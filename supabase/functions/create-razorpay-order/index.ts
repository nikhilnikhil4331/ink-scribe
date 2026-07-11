import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Plan pricing in INR
const PLAN_PRICES: Record<string, { amount: number; label: string; period_days: number }> = {
  weekly:   { amount: 49,   label: "Weekly",   period_days: 7 },
  monthly:  { amount: 99,   label: "Monthly",  period_days: 30 },
  annual:   { amount: 499,  label: "Annual",   period_days: 365 },
  lifetime: { amount: 1999, label: "Lifetime", period_days: 36500 }, // 100 years
};

// Exam pack pricing
const EXAM_PACK_PRICES: Record<string, number> = {
  jee:   149,
  neet:  149,
  upsc:  199,
  cbse10: 99,
  cbse12: 99,
};

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
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("Razorpay credentials not configured");
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
    const userEmail = userData.user.email || "";

    const body = await req.json();
    const { planCode, amount: customAmount, examPacks } = body;

    // Validate plan
    if (!planCode || !PLAN_PRICES[planCode]) {
      return new Response(JSON.stringify({ error: "Invalid plan code. Valid: weekly, monthly, annual, lifetime" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const planConfig = PLAN_PRICES[planCode];

    // Calculate total
    let totalAmount = planConfig.amount;
    const validatedExamPacks: string[] = [];

    // Add exam packs if provided
    if (examPacks && Array.isArray(examPacks)) {
      for (const pack of examPacks) {
        if (EXAM_PACK_PRICES[pack]) {
          totalAmount += EXAM_PACK_PRICES[pack];
          validatedExamPacks.push(pack);
        }
      }
    }

    // Override with custom amount if provided (for exam pack combinations)
    const amountInPaise = customAmount ? customAmount : totalAmount * 100;

    const planLabel = planConfig.label;

    // Create Razorpay order
    const credentials = base64Encode(`${razorpayKeyId}:${razorpayKeySecret}`);
    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: `niknote_${userId.slice(0, 8)}_${Date.now()}`,
        notes: {
          user_id: userId,
          plan_code: planCode,
          exam_packs: validatedExamPacks.join(","),
        },
      }),
    });

    if (!orderRes.ok) {
      const errBody = await orderRes.text();
      console.error(`Razorpay order creation failed [${orderRes.status}]: ${errBody}`);
      return new Response(JSON.stringify({ error: "Failed to create payment order" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const order = await orderRes.json();
    console.log(`Order created: ${order.id} for user ${userId}, plan: ${planCode}, amount: ₹${totalAmount}, packs: ${validatedExamPacks.join(",")}`);

    return new Response(JSON.stringify({
      orderId: order.id,
      amount: amountInPaise,
      currency: "INR",
      keyId: razorpayKeyId,
      planCode,
      planLabel,
      planPeriodDays: planConfig.period_days,
      examPacks: validatedExamPacks,
      totalAmount: totalAmount,
      userEmail,
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
