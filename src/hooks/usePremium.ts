import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PremiumFeature = "voice_dictation" | "ai_writing" | "ai_style_matcher";

type PremiumState = {
  loading: boolean;
  isPremium: boolean;
  status: string | null;
  currentPeriodEnd: string | null;
};

export function usePremium() {
  const { user } = useAuth();
  const [state, setState] = useState<PremiumState>({
    loading: true,
    isPremium: false,
    status: null,
    currentPeriodEnd: null,
  });

  const refresh = useCallback(async () => {
    if (!user) {
      setState({ loading: false, isPremium: false, status: null, currentPeriodEnd: null });
      return;
    }

    setState((s) => ({ ...s, loading: true }));

    // Read from local subscription table
    const { data } = await supabase
      .from("user_subscriptions")
      .select("status, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle();

    const localStatus = data?.status ?? null;
    const localEnd = data?.current_period_end ?? null;

    // Premium if active or pending verification (trust-based until manual verification)
    const isPremium =
      localStatus === "active" ||
      localStatus === "authenticated" ||
      localStatus === "pending_verification";

    // Check if subscription has expired
    const isExpired = localEnd ? new Date(localEnd) < new Date() : false;

    setState({
      loading: false,
      isPremium: isPremium && !isExpired,
      status: localStatus,
      currentPeriodEnd: localEnd,
    });
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return useMemo(
    () => ({
      ...state,
      user,
      refresh,
    }),
    [state, user, refresh],
  );
}
