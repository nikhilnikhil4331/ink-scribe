import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token to verify identity
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the user's JWT using getUser
    const { data: userData, error: userError } = await userClient.auth.getUser();

    if (userError || !userData?.user) {
      console.error("JWT verification failed:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const callerId = userData.user.id;
    
    // Parse request body
    const body = await req.json();
    const { planCode, userId, status } = body;

    // Use service role client for all DB operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check if caller is admin (for admin operations)
    const { data: adminCheck } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("role", "admin")
      .maybeSingle();

    const isAdmin = !!adminCheck;

    // Admin operation: toggle premium for another user
    if (userId && isAdmin) {
      console.log(`Admin ${callerId} updating user ${userId} to status: ${status || 'active'}`);
      
      const newStatus = status || "active";
      const periodDays = newStatus === "active" ? 30 : 0;
      const periodEnd = newStatus === "active" 
        ? new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error: upsertError } = await adminClient
        .from("user_subscriptions")
        .upsert(
          {
            user_id: userId,
            plan_code: planCode || "admin_granted",
            status: newStatus,
            current_period_end: periodEnd,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (upsertError) {
        console.error("Failed to update subscription:", upsertError);
        return new Response(
          JSON.stringify({ error: "Failed to update subscription" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: `User subscription ${newStatus}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Regular user operation: record their own payment
    if (!planCode || !["weekly", "monthly"].includes(planCode)) {
      return new Response(
        JSON.stringify({ error: "Invalid plan code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Recording payment for user ${callerId}, plan: ${planCode}`);

    const periodDays = planCode === "weekly" ? 7 : 30;
    const periodEnd = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000).toISOString();

    const { error: upsertError } = await adminClient
      .from("user_subscriptions")
      .upsert(
        {
          user_id: callerId,
          plan_code: planCode,
          status: "pending_verification", // Admin will manually verify and set to 'active'
          current_period_end: periodEnd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("Failed to record subscription:", upsertError);
      return new Response(
        JSON.stringify({ error: "Failed to record payment" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Payment recorded successfully for user ${callerId}`);

    return new Response(
      JSON.stringify({ success: true, message: "Payment recorded. Awaiting verification." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in record-payment function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
