import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    console.log('M-Pesa Callback received:', JSON.stringify(body, null, 2));

    // Extract callback data
    const stkCallback = body?.Body?.stkCallback;
    
    if (!stkCallback) {
      console.error('Invalid callback format');
      return new Response(
        JSON.stringify({ ResultCode: 1, ResultDesc: 'Invalid callback format' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    console.log(`Callback for ${CheckoutRequestID}: ResultCode=${ResultCode}, ResultDesc=${ResultDesc}`);

    if (ResultCode === 0 && CallbackMetadata) {
      // Payment successful - extract metadata
      const items = CallbackMetadata.Item || [];
      const amount = items.find((i: any) => i.Name === 'Amount')?.Value;
      const mpesaReceiptNumber = items.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = items.find((i: any) => i.Name === 'TransactionDate')?.Value;
      const phoneNumber = items.find((i: any) => i.Name === 'PhoneNumber')?.Value;

      console.log(`Payment successful: Amount=${amount}, Receipt=${mpesaReceiptNumber}, Phone=${phoneNumber}`);

      // Here you could store the transaction in a donations table
      // For now, just log it
      console.log('Payment processed successfully');
    } else {
      console.log(`Payment failed or cancelled: ${ResultDesc}`);
    }

    // Always return success to M-Pesa
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: 'Callback processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in mpesa-callback:', error);
    return new Response(
      JSON.stringify({ ResultCode: 1, ResultDesc: errorMessage }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
