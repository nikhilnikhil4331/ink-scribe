// ============================================================
// NikNote 4.0 — Unified Premium Hook
// FIXED: PremiumFeature now matches PremiumContext.tsx exactly
// Single source of truth for premium feature checks
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// MUST match PremiumContext.tsx PremiumFeature exactly
export type PremiumFeature =
  | "ai_note_generator"
  | "ai_solver"
  | "ai_text_tools"
  | "handwriting_styles"
  | "image_pdf_convert"
  | "voice_to_notes"
  | "ai_flashcards";

// Free tier limits — MUST match PremiumContext.tsx FREE_LIMITS
// Tightened for better free→paid conversion (users must feel the need)
const FREE_LIMITS: Record<PremiumFeature, { limit: number; period: "day" | "month" }> = {
  ai_note_generator: { limit: 3, period: "month" },
  ai_solver: { limit: 3, period: "day" },
  ai_text_tools: { limit: 5, period: "day" },
  handwriting_styles: { limit: 1, period: "month" },
  image_pdf_convert: { limit: 2, period: "month" },
  voice_to_notes: { limit: 3, period: "month" },
  ai_flashcards: { limit: 1, period: "month" },
};

export function usePremium() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
  const [usageMap, setUsageMap] = useState<Record<string, number>>({});

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentDay = new Date().toISOString().slice(0, 10);

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

  const fetchUsage = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("feature_usage")
        .select("feature_name, usage_count, usage_month")
        .eq("user_id", user.id);

      if (data) {
        const map: Record<string, number> = {};
        data.forEach((row) => {
          map[`${row.feature_name}_${row.usage_month}`] = row.usage_count;
        });
        setUsageMap(map);
      }
    } catch (err) {
      console.error("Usage fetch failed:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
    fetchUsage();
  }, [fetchSubscription, fetchUsage]);

  // Check if a feature is accessible
  const checkFeatureAccess = useCallback(
    (feature: PremiumFeature): { allowed: boolean; used: number; limit: number } => {
      if (isPremium) return { allowed: true, used: 0, limit: Infinity };

      const config = FREE_LIMITS[feature];
      if (!config) return { allowed: true, used: 0, limit: Infinity };

      const key = config.period === "month"
        ? `${feature}_${currentMonth}`
        : `${feature}_${currentDay}`;
      const used = usageMap[key] || 0;

      return { allowed: used < config.limit, used, limit: config.limit };
    },
    [isPremium, usageMap, currentMonth, currentDay]
  );

  return {
    loading,
    isPremium,
    status,
    currentPeriodEnd,
    user,
    refresh: fetchSubscription,
    checkFeatureAccess,
  };
}
