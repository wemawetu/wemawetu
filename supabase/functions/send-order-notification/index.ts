import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderNotificationRequest {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  orderStatus: string;
  trackingNumber?: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
  totalAmount?: number;
  currency?: string;
}

const getStatusMessage = (status: string): { subject: string; heading: string; body: string } => {
  switch (status) {
    case "confirmed":
      return {
        subject: "Your Order Has Been Confirmed! 🎉",
        heading: "Order Confirmed!",
        body: "Great news! Your order has been confirmed and is being prepared for shipment."
      };
    case "processing":
      return {
        subject: "Your Order is Being Processed 📦",
        heading: "Order Processing",
        body: "Your order is now being processed and will be shipped soon."
      };
    case "shipped":
      return {
        subject: "Your Order Has Been Shipped! 🚚",
        heading: "Order Shipped!",
        body: "Exciting news! Your order has been shipped and is on its way to you."
      };
    case "delivered":
      return {
        subject: "Your Order Has Been Delivered! ✅",
        heading: "Order Delivered!",
        body: "Your order has been successfully delivered. Thank you for supporting Wemawetu Foundation!"
      };
    case "cancelled":
      return {
        subject: "Your Order Has Been Cancelled",
        heading: "Order Cancelled",
        body: "Your order has been cancelled. If you have any questions, please contact us."
      };
    default:
      return {
        subject: "Order Status Update",
        heading: "Order Update",
        body: `Your order status has been updated to: ${status}`
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    return new Response(
      JSON.stringify({ success: false, error: "Email service not configured" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { 
      customerEmail, 
      customerName, 
      orderNumber, 
      orderStatus, 
      trackingNumber,
      items,
      totalAmount,
      currency = "USD"
    }: OrderNotificationRequest = await req.json();

    const statusInfo = getStatusMessage(orderStatus);

    const itemsHtml = items?.length 
      ? `
        <div style="margin: 20px 0; background: #f9f9f9; padding: 15px; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Order Items:</h3>
          ${items.map(item => `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
              <span>${item.name} x${item.quantity}</span>
              <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
          ${totalAmount ? `
            <div style="display: flex; justify-content: space-between; padding: 12px 0 0 0; font-weight: bold; font-size: 16px;">
              <span>Total</span>
              <span>${currency === 'USD' ? '$' : currency}${totalAmount.toFixed(2)}</span>
            </div>
          ` : ''}
        </div>
      `
      : '';

    const trackingHtml = trackingNumber 
      ? `
        <div style="margin: 20px 0; padding: 15px; background: #e8f5e9; border-radius: 8px; border-left: 4px solid #4caf50;">
          <p style="margin: 0; font-weight: bold; color: #2e7d32;">Tracking Number:</p>
          <p style="margin: 5px 0 0 0; font-family: monospace; font-size: 18px; color: #1b5e20;">${trackingNumber}</p>
        </div>
      `
      : '';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #0ea5e9;">
          <h1 style="color: #0ea5e9; margin: 0; font-size: 24px;">💧 Wemawetu Foundation</h1>
          <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">People. Planet. Future.</p>
        </div>
        
        <div style="padding: 30px 0;">
          <h2 style="color: #333; margin: 0 0 15px 0;">${statusInfo.heading}</h2>
          <p style="color: #666; margin: 0 0 20px 0;">Hi ${customerName},</p>
          <p style="color: #666; margin: 0 0 20px 0;">${statusInfo.body}</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #666;">
              <strong>Order Number:</strong> 
              <span style="font-family: monospace; color: #0ea5e9;">${orderNumber}</span>
            </p>
            <p style="margin: 8px 0 0 0; color: #666;">
              <strong>Status:</strong> 
              <span style="text-transform: capitalize; color: #4caf50;">${orderStatus}</span>
            </p>
          </div>
          
          ${trackingHtml}
          ${itemsHtml}
          
          <div style="margin-top: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px; text-align: center;">
            <p style="margin: 0 0 10px 0; color: #666;">Track your order anytime:</p>
            <a href="https://wemawetu.lovable.app/track-order?search=${encodeURIComponent(customerEmail)}" 
               style="display: inline-block; padding: 12px 24px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Track Order
            </a>
          </div>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
          <p style="margin: 0;">Thank you for supporting Wemawetu Foundation!</p>
          <p style="margin: 10px 0 0 0;">Your purchase helps us provide clean water, shelter, education, and environmental protection to communities in need.</p>
          <p style="margin: 15px 0 0 0;">
            <a href="https://wemawetu.lovable.app" style="color: #0ea5e9; text-decoration: none;">wemawetu.lovable.app</a>
          </p>
        </div>
      </body>
      </html>
    `;

    // Send email via Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Wemawetu Foundation <onboarding@resend.dev>",
        to: [customerEmail],
        subject: `${statusInfo.subject} - Order #${orderNumber}`,
        html: emailHtml,
      }),
    });

    const emailResponse = await response.json();
    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-order-notification function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
