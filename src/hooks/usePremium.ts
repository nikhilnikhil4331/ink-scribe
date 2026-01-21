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

    // 1) quick local read
    const { data } = await supabase
      .from("user_subscriptions")
      .select("status, current_period_end")
      .maybeSingle();

    const localStatus = (data as any)?.status ?? null;
    const localEnd = (data as any)?.current_period_end ?? null;
    const localPremium = localStatus === "active" || localStatus === "authenticated";

    setState({ loading: false, isPremium: !!localPremium, status: localStatus, currentPeriodEnd: localEnd });
  }, [user]);

  const sync = useCallback(async () => {
    if (!user) return { isPremium: false };
    const { data, error } = await supabase.functions.invoke("billing-sync-subscription");
    if (!error && data) {
      setState({
        loading: false,
        isPremium: !!data.isPremium,
        status: data.status ?? null,
        currentPeriodEnd: data.currentPeriodEnd ?? null,
      });
    }
    return { isPremium: !!data?.isPremium, error };
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return useMemo(
    () => ({
      ...state,
      user,
      refresh,
      sync,
    }),
    [state, user, refresh, sync],
  );
}
