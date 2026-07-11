import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Plan period days
const PLAN_PERIOD_DAYS: Record<string, number> = {
  weekly: 7,
  monthly: 30,
  annual: 365,
  lifetime: 36500, // 100 years = forever
};

async function hmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const msgData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeySecret) {
      return new Response(JSON.stringify({ error: "Payment system not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await adminClient.auth.getUser(token);

    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planCode, examPacks } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planCode) {
      return new Response(JSON.stringify({ error: "Missing payment details" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify signature
    const expectedSignature = await hmacSha256(
      razorpayKeySecret,
      `${razorpay_order_id}|${razorpay_payment_id}`
    );

    if (expectedSignature !== razorpay_signature) {
      console.error(`Signature mismatch for user ${userId}`);
      return new Response(JSON.stringify({ error: "Payment verification failed" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Payment verified for user ${userId}, payment: ${razorpay_payment_id}, plan: ${planCode}`);

    // Get period days
    const periodDays = PLAN_PERIOD_DAYS[planCode] || 30;
    const periodEnd = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000).toISOString();

    // Activate subscription
    const { error: upsertError } = await adminClient
      .from("user_subscriptions")
      .upsert({
        user_id: userId,
        plan_code: planCode,
        status: "active",
        current_period_end: periodEnd,
        razorpay_payment_id: razorpay_payment_id,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (upsertError) {
      console.error("Failed to activate subscription:", upsertError);
      return new Response(JSON.stringify({ error: "Failed to activate subscription" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record payment
    try {
      await adminClient.from("billing_plans").upsert({
        user_id: userId,
        plan_code: planCode,
        amount_paid: body.amount || 0,
        currency: "INR",
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        status: "paid",
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Failed to record payment (non-critical):", e);
    }

    // Record exam pack purchases
    if (examPacks && Array.isArray(examPacks)) {
      for (const pack of examPacks) {
        try {
          await adminClient.from("feature_usage").upsert({
            user_id: userId,
            feature_name: `exam_pack_${pack}`,
            usage_count: 1,
            usage_month: new Date().toISOString().slice(0, 7),
          });
        } catch (e) {
          console.error(`Failed to record exam pack ${pack} (non-critical):`, e);
        }
      }
    }

    // Record analytics event
    try {
      await adminClient.from("analytics_events").insert({
        user_id: userId,
        event_type: "payment_success",
        event_data: {
          plan_code: planCode,
          payment_id: razorpay_payment_id,
          exam_packs: examPacks || [],
        },
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Failed to record analytics (non-critical):", e);
    }

    console.log(`Subscription activated for ${userId}, plan: ${planCode}, period: ${periodDays} days`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Payment verified and subscription activated!",
      planCode,
      periodDays,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
