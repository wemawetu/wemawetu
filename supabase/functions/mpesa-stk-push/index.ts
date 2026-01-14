import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface STKPushRequest {
  phone: string;
  amount: number;
  paymentType: 'till' | 'paybill';
  reference?: string;
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

    const { phone, amount, paymentType, reference = 'DONATION' }: STKPushRequest = await req.json();

    console.log(`Processing M-Pesa STK Push: ${paymentType}, amount: ${amount}, phone: ${phone}`);

    // Validate inputs
    if (!phone || !amount || !paymentType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: phone, amount, paymentType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number to 254 format
    let formattedPhone = phone.replace(/\s+/g, '').replace(/^0/, '254').replace(/^\+/, '');
    if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    console.log(`Formatted phone: ${formattedPhone}`);

    // Get payment config from database
    const { data: paymentConfig, error: configError } = await supabase
      .from('payment_config')
      .select('*')
      .eq('provider', paymentType === 'till' ? 'mpesa_till' : 'mpesa_paybill')
      .eq('enabled', true)
      .single();

    if (configError || !paymentConfig) {
      console.error('Payment config error:', configError);
      return new Response(
        JSON.stringify({ error: 'M-Pesa payment method not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const config = (paymentConfig.config ?? {}) as Record<string, any>;

    const consumerKey = String(config.consumer_key ?? '').trim();
    const consumerSecret = String(config.consumer_secret ?? '').trim();
    const passkey = String(config.passkey ?? '').trim();

    const shortcode = String(
      paymentType === 'till' ? config.till_number : config.paybill_number
    ).trim();

    const callbackUrl = String(
      config.callback_url || `${supabaseUrl}/functions/v1/mpesa-callback`
    ).trim();

    const sandbox = Boolean(config.sandbox ?? true);
    const baseUrl = sandbox ? 'https://sandbox.safaricom.co.ke' : 'https://api.safaricom.co.ke';


    if (!consumerKey || !consumerSecret || !passkey || !shortcode) {
      console.error('Missing M-Pesa credentials');
      return new Response(
        JSON.stringify({ error: 'M-Pesa credentials not fully configured. Please configure Consumer Key, Consumer Secret, Passkey, and Shortcode in admin settings.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate access token
    console.log(`Generating M-Pesa access token (sandbox=${sandbox})...`);
    const authString = btoa(`${consumerKey}:${consumerSecret}`);

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
        JSON.stringify({ error: 'Failed to authenticate with M-Pesa' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenData = await tokenResponse.json().catch(() => ({} as any));
    const accessToken = String((tokenData as any)?.access_token ?? '').trim();

    if (!accessToken) {
      console.error('Token response missing access_token:', tokenData);
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate with M-Pesa (no access token returned)' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Access token obtained successfully');

    // Generate timestamp and password
    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    // Prepare STK Push request
    // For Till (Buy Goods): TransactionType = CustomerBuyGoodsOnline, BusinessShortCode = Till Number
    // For Paybill: TransactionType = CustomerPayBillOnline, BusinessShortCode = Paybill Number
    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: paymentType === 'till' ? 'CustomerBuyGoodsOnline' : 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: reference,
      TransactionDesc: `Donation to Wemawetu Foundation`,
    };

    console.log('Sending STK Push request...');
    console.log('Payload:', JSON.stringify(stkPayload, null, 2));

    const stkResponse = await fetch(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(stkPayload),
      }
    );

    const stkText = await stkResponse.text();
    let stkResult: any = {};
    try {
      stkResult = JSON.parse(stkText);
    } catch {
      stkResult = { raw: stkText };
    }

    console.log('STK Push response:', JSON.stringify(stkResult));

    if (!stkResponse.ok) {
      console.error('STK Push HTTP error:', stkResponse.status, stkResult);
      return new Response(
        JSON.stringify({
          success: false,
          error: stkResult?.errorMessage || stkResult?.ResponseDescription || 'STK Push request failed',
          status: stkResponse.status,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (stkResult.ResponseCode === '0') {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'STK Push sent successfully. Check your phone for the payment prompt.',
          checkoutRequestId: stkResult.CheckoutRequestID,
          merchantRequestId: stkResult.MerchantRequestID,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error('STK Push failed:', stkResult);
      return new Response(
        JSON.stringify({
          success: false,
          error: stkResult.errorMessage || stkResult.ResponseDescription || 'STK Push request failed',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in mpesa-stk-push:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
