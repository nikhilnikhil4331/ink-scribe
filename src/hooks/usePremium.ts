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

// DEVELOPMENT MODE: All features unlocked for testing
export function usePremium() {
  const { user } = useAuth();
  
  // Always return premium = true for development/testing
  return {
    loading: false,
    isPremium: true, // <-- UNLOCKED FOR DEV
    status: 'active',
    currentPeriodEnd: null,
    user,
    refresh: async () => {}, // no-op
  };
}
