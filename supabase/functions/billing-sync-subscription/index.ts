import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getBasicAuthHeader(keyId: string, keySecret: string) {
  const token = btoa(`${keyId}:${keySecret}`);
  return `Basic ${token}`;
}

async function razorpayGetSubscription(subId: string, keyId: string, keySecret: string) {
  const res = await fetch(`https://api.razorpay.com/v1/subscriptions/${subId}`, {
    method: "GET",
    headers: {
      Authorization: getBasicAuthHeader(keyId, keySecret),
    },
  });

  const text = await res.text();
  const json = text ? (() => { try { return JSON.parse(text); } catch { return { raw: text }; } })() : {};

  if (!res.ok) {
    console.error("Razorpay get subscription error", res.status, json);
    throw new Error(json?.error?.description || json?.message || "Failed to fetch subscription");
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

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: subRow, error: subRowErr } = await admin
      .from("user_subscriptions")
      .select("id, plan_code, razorpay_subscription_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (subRowErr) throw subRowErr;

    if (!subRow?.razorpay_subscription_id) {
      return new Response(JSON.stringify({ isPremium: false, status: "inactive" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rpSub = await razorpayGetSubscription(subRow.razorpay_subscription_id, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET);

    const status: string = rpSub.status || "inactive";
    const currentEndIso = rpSub.current_end ? new Date(rpSub.current_end * 1000).toISOString() : null;

    const { error: upErr } = await admin
      .from("user_subscriptions")
      .update({
        status,
        current_period_end: currentEndIso,
        plan_code: subRow.plan_code,
      })
      .eq("user_id", userData.user.id);
    if (upErr) throw upErr;

    const isPremium = status === "active" || status === "authenticated";

    return new Response(JSON.stringify({ isPremium, status, currentPeriodEnd: currentEndIso }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("billing-sync-subscription error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
