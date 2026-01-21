import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type PlanCode = "weekly" | "monthly";

function getBasicAuthHeader(keyId: string, keySecret: string) {
  const token = btoa(`${keyId}:${keySecret}`);
  return `Basic ${token}`;
}

async function razorpayFetch(
  path: string,
  options: RequestInit,
  keyId: string,
  keySecret: string,
) {
  const url = `https://api.razorpay.com/v1${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: getBasicAuthHeader(keyId, keySecret),
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  const json = text ? (() => { try { return JSON.parse(text); } catch { return { raw: text }; } })() : {};

  if (!res.ok) {
    console.error("Razorpay error", res.status, json);
    throw new Error(json?.error?.description || json?.message || "Razorpay request failed");
  }

  return json;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Backend configuration error");
    }
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay keys are not configured");
    }

    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { planCode } = (await req.json().catch(() => ({}))) as { planCode?: PlanCode };
    if (planCode !== "weekly" && planCode !== "monthly") {
      return new Response(JSON.stringify({ error: "Invalid plan" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Upsert the catalog entry (safe defaults)
    const planDefaults: Record<PlanCode, { price_inr: number; interval_unit: string; interval_count: number }> = {
      weekly: { price_inr: 49, interval_unit: "weekly", interval_count: 1 },
      monthly: { price_inr: 99, interval_unit: "monthly", interval_count: 1 },
    };

    const defaults = planDefaults[planCode];

    const { data: planRow, error: planRowErr } = await admin
      .from("billing_plans")
      .select("id, code, price_inr, interval_unit, interval_count, razorpay_plan_id")
      .eq("code", planCode)
      .maybeSingle();

    if (planRowErr) throw planRowErr;

    let razorpayPlanId = planRow?.razorpay_plan_id || null;

    if (!planRow) {
      const { error: insErr } = await admin.from("billing_plans").insert({
        code: planCode,
        price_inr: defaults.price_inr,
        interval_unit: defaults.interval_unit,
        interval_count: defaults.interval_count,
      });
      if (insErr) throw insErr;
    }

    // Create Razorpay plan lazily
    if (!razorpayPlanId) {
      const rpPlan = await razorpayFetch(
        "/plans",
        {
          method: "POST",
          body: JSON.stringify({
            period: defaults.interval_unit,
            interval: defaults.interval_count,
            item: {
              name: `NikNote Premium (${planCode})`,
              amount: defaults.price_inr * 100,
              currency: "INR",
              description: "Premium features: AI + Dictation + Style Matcher",
            },
          }),
        },
        RAZORPAY_KEY_ID,
        RAZORPAY_KEY_SECRET,
      );

      razorpayPlanId = rpPlan.id;
      const { error: upErr } = await admin
        .from("billing_plans")
        .update({ razorpay_plan_id: razorpayPlanId })
        .eq("code", planCode);
      if (upErr) throw upErr;
    }

    // Create a customer for this user if we don't have one
    const { data: subRow, error: subRowErr } = await admin
      .from("user_subscriptions")
      .select("id, user_id, razorpay_customer_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (subRowErr) throw subRowErr;

    let customerId = subRow?.razorpay_customer_id || null;
    if (!customerId) {
      const customer = await razorpayFetch(
        "/customers",
        {
          method: "POST",
          body: JSON.stringify({
            name: userData.user.user_metadata?.full_name || userData.user.email?.split("@")[0] || "NikNote User",
            email: userData.user.email,
          }),
        },
        RAZORPAY_KEY_ID,
        RAZORPAY_KEY_SECRET,
      );
      customerId = customer.id;
    }

    // Create subscription
    const subscription = await razorpayFetch(
      "/subscriptions",
      {
        method: "POST",
        body: JSON.stringify({
          plan_id: razorpayPlanId,
          customer_id: customerId,
          total_count: 0, // auto-renew indefinitely
          quantity: 1,
          customer_notify: 1,
        }),
      },
      RAZORPAY_KEY_ID,
      RAZORPAY_KEY_SECRET,
    );

    // Persist (server-side)
    const { error: upsertErr } = await admin.from("user_subscriptions").upsert(
      {
        user_id: userData.user.id,
        plan_code: planCode,
        razorpay_customer_id: customerId,
        razorpay_subscription_id: subscription.id,
        status: subscription.status || "created",
        current_period_end: subscription.current_end ? new Date(subscription.current_end * 1000).toISOString() : null,
      },
      { onConflict: "user_id" },
    );
    if (upsertErr) throw upsertErr;

    return new Response(
      JSON.stringify({
        keyId: RAZORPAY_KEY_ID,
        subscriptionId: subscription.id,
        planCode,
        email: userData.user.email,
        name: userData.user.user_metadata?.full_name || userData.user.email?.split("@")[0] || "NikNote User",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("billing-create-subscription error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
