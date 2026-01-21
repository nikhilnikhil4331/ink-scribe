import React, { useCallback, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Crown, Loader2 } from "lucide-react";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

type PlanCode = "weekly" | "monthly";

function ensureRazorpayLoaded() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) return resolve();
    // If the script tag is blocked for some reason
    const start = Date.now();
    const t = setInterval(() => {
      if (window.Razorpay) {
        clearInterval(t);
        resolve();
      }
      if (Date.now() - start > 8000) {
        clearInterval(t);
        reject(new Error("Razorpay failed to load"));
      }
    }, 150);
  });
}

export interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchased?: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ open, onOpenChange, onPurchased }) => {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<PlanCode | null>(null);

  const plans = useMemo(
    () => [
      { code: "weekly" as const, label: "Weekly", price: "₹49 / week" },
      { code: "monthly" as const, label: "Monthly", price: "₹99 / month" },
    ],
    [],
  );

  const startCheckout = useCallback(
    async (planCode: PlanCode) => {
      if (!user) {
        toast.error("Please sign in to subscribe");
        onOpenChange(false);
        window.location.href = "/auth";
        return;
      }

      setLoadingPlan(planCode);
      try {
        await ensureRazorpayLoaded();

        const { data, error } = await supabase.functions.invoke("billing-create-subscription", {
          body: { planCode },
        });

        if (error) throw error;
        if (!data?.subscriptionId || !data?.keyId) throw new Error("Subscription init failed");

        const options = {
          key: data.keyId,
          subscription_id: data.subscriptionId,
          name: "NikNote Premium",
          description: "Unlock AI + Dictation + Style Matcher",
          prefill: {
            name: data.name,
            email: data.email,
          },
          theme: {
            color: "hsl(222 84% 56%)",
          },
          handler: async () => {
            toast.success("Payment received — verifying…");
            await supabase.functions.invoke("billing-sync-subscription");
            onOpenChange(false);
            onPurchased?.();
          },
          modal: {
            ondismiss: () => {
              setLoadingPlan(null);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (e) {
        console.error(e);
        toast.error(e instanceof Error ? e.message : "Checkout failed");
      } finally {
        setLoadingPlan(null);
      }
    },
    [user, onOpenChange, onPurchased],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <Crown className="h-4 w-4 text-primary" />
            </span>
            Go Premium
          </DialogTitle>
          <DialogDescription>
            Unlock Voice Dictation, AI Writing Assistant, and AI Style Matcher (auto-renew).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          {plans.map((p) => (
            <button
              key={p.code}
              type="button"
              onClick={() => startCheckout(p.code)}
              className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 p-4 text-left hover:bg-muted/30 transition-colors"
              disabled={!!loadingPlan}
            >
              <div>
                <div className="text-sm font-semibold text-foreground">{p.label}</div>
                <div className="text-xs text-muted-foreground">{p.price}</div>
              </div>
              <Button size="sm" className="rounded-xl" disabled={loadingPlan === p.code}>
                {loadingPlan === p.code ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
              </Button>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
