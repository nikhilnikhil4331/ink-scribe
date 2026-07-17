import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { name, email, phone, institution, students, message, plan } = body;

    if (!name || !email || !institution) {
      return new Response(JSON.stringify({ error: "Name, email, and institution are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save lead to analytics_events
    const { error } = await adminClient.from("analytics_events").insert({
      event_type: "b2b_lead",
      event_data: {
        name,
        email,
        phone: phone || "",
        institution,
        students: students || "",
        message: message || "",
        plan: plan || "unknown",
        source: "niknote_website",
        timestamp: new Date().toISOString(),
      },
    });

    if (error) {
      console.error("Lead save error:", error);
    }

    // Also try to save to user_roles table for tracking
    try {
      await adminClient.from("error_logs").insert({
        message: `B2B LEAD: ${name} | ${institution} | ${email} | ${phone || "no phone"} | Students: ${students || "?"} | Plan: ${plan || "?"}`,
        stack: message || "",
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Log save error:", e);
    }

    console.log(`B2B LEAD: ${name} from ${institution} (${email}) — ${students} students — Plan: ${plan}`);

    return new Response(JSON.stringify({
      success: true,
      message: "Thank you! We'll contact you within 24 hours.",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("B2B lead error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
