import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WithdrawalRequest {
  withdrawalId: string;
  amount: number;
  phone: string;
  campaignTitle: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { withdrawalId, amount, phone, campaignTitle }: WithdrawalRequest = await req.json();

    console.log(`Processing withdrawal: ID=${withdrawalId}, Amount=${amount}, Phone=${phone}`);

    // Validate inputs
    if (!withdrawalId || !amount || !phone) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: withdrawalId, amount, phone' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number to 254 format
    let formattedPhone = phone.replace(/\s+/g, '').replace(/^0/, '254').replace(/^\+/, '');
    if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    // Get payment config from database (we need B2C credentials)
    const { data: paymentConfig, error: configError } = await supabase
      .from('payment_config')
      .select('*')
      .eq('provider', 'mpesa')
      .eq('enabled', true)
      .single();

    if (configError || !paymentConfig) {
      // If no B2C config, just mark as approved (manual processing)
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({ 
          status: 'approved',
          processed_at: new Date().toISOString(),
          transaction_reference: `MANUAL-${Date.now()}`
        })
        .eq('id', withdrawalId);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Withdrawal approved for manual processing. M-Pesa B2C not configured.',
          manual: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const config = (paymentConfig.config ?? {}) as Record<string, any>;

    // Check if B2C is configured
    const b2cConsumerKey = String(config.b2c_consumer_key ?? config.consumer_key ?? '').trim();
    const b2cConsumerSecret = String(config.b2c_consumer_secret ?? config.consumer_secret ?? '').trim();
    const b2cShortcode = String(config.b2c_shortcode ?? '').trim();
    const b2cInitiatorName = String(config.b2c_initiator_name ?? '').trim();
    const b2cSecurityCredential = String(config.b2c_security_credential ?? '').trim();

    if (!b2cConsumerKey || !b2cConsumerSecret || !b2cShortcode || !b2cInitiatorName || !b2cSecurityCredential) {
      // B2C not fully configured, approve for manual processing
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({ 
          status: 'approved',
          processed_at: new Date().toISOString(),
          transaction_reference: `PENDING-B2C-${Date.now()}`
        })
        .eq('id', withdrawalId);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Withdrawal approved. M-Pesa B2C credentials not fully configured - requires manual disbursement.',
          manual: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sandbox = Boolean(config.sandbox ?? true);
    const baseUrl = sandbox ? 'https://sandbox.safaricom.co.ke' : 'https://api.safaricom.co.ke';
    const callbackUrl = String(config.b2c_callback_url || `${supabaseUrl}/functions/v1/mpesa-b2c-callback`).trim();

    // Generate access token
    console.log(`Generating M-Pesa B2C access token (sandbox=${sandbox})...`);
    const authString = btoa(`${b2cConsumerKey}:${b2cConsumerSecret}`);

    const tokenResponse = await fetch(
      `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token generation failed:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate with M-Pesa for B2C' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = String(tokenData?.access_token ?? '').trim();

    if (!accessToken) {
      console.error('Token response missing access_token:', tokenData);
      return new Response(
        JSON.stringify({ error: 'Failed to get M-Pesa B2C access token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('B2C Access token obtained successfully');

    // Prepare B2C request
    const b2cPayload = {
      InitiatorName: b2cInitiatorName,
      SecurityCredential: b2cSecurityCredential,
      CommandID: 'BusinessPayment',
      Amount: Math.round(amount),
      PartyA: b2cShortcode,
      PartyB: formattedPhone,
      Remarks: `Withdrawal for campaign: ${campaignTitle}`,
      QueueTimeOutURL: callbackUrl,
      ResultURL: callbackUrl,
      Occasion: `WD-${withdrawalId.slice(0, 8)}`
    };

    console.log('Sending B2C request...');

    const b2cResponse = await fetch(
      `${baseUrl}/mpesa/b2c/v1/paymentrequest`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(b2cPayload),
      }
    );

    const b2cResult = await b2cResponse.json().catch(() => ({}));
    console.log('B2C response:', JSON.stringify(b2cResult));

    if (b2cResult.ResponseCode === '0') {
      // Update withdrawal status
      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({ 
          status: 'processing',
          transaction_reference: b2cResult.ConversationID || b2cResult.OriginatorConversationID
        })
        .eq('id', withdrawalId);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({
          success: true,
          message: 'B2C payment initiated successfully',
          conversationId: b2cResult.ConversationID,
          originatorConversationId: b2cResult.OriginatorConversationID
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error('B2C request failed:', b2cResult);
      return new Response(
        JSON.stringify({
          success: false,
          error: b2cResult.errorMessage || b2cResult.ResponseDescription || 'B2C request failed'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in process-withdrawal:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});