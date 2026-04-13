import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PremiumFeature = "voice_dictation" | "ai_writing" | "ai_style_matcher";

export function usePremium() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setIsPremium(false);
      setStatus(null);
      setCurrentPeriodEnd(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("status, current_period_end, plan_code")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching subscription:", error);
        setIsPremium(false);
        setStatus(null);
      } else if (data) {
        const isActive = data.status === "active";
        const notExpired = data.current_period_end
          ? new Date(data.current_period_end) > new Date()
          : false;
        setIsPremium(isActive && notExpired);
        setStatus(data.status);
        setCurrentPeriodEnd(data.current_period_end);
      } else {
        setIsPremium(false);
        setStatus(null);
        setCurrentPeriodEnd(null);
      }
    } catch (err) {
      console.error("Premium check failed:", err);
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    loading,
    isPremium,
    status,
    currentPeriodEnd,
    user,
    refresh: fetchSubscription,
  };
}
