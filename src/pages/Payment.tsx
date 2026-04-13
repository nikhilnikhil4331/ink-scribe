import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Crown, Sparkles, CheckCircle, AlertCircle, Loader2, CreditCard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePremium } from "@/hooks/usePremium";

type PlanCode = "weekly" | "monthly";
type PaymentStep = "select" | "processing" | "success" | "error";

interface Plan {
  code: PlanCode;
  label: string;
  price: number;
  period: string;
  popular?: boolean;
}

const plans: Plan[] = [
  { code: "weekly", label: "Weekly", price: 49, period: "/week" },
  { code: "monthly", label: "Monthly", price: 99, period: "/month", popular: true },
];

// Load Razorpay SDK dynamically
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { refresh: refreshPremium } = usePremium();

  const initialPlan = (searchParams.get("plan") as PlanCode) || "monthly";
  const [selectedPlan, setSelectedPlan] = useState<PlanCode>(initialPlan);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>("select");

  const plan = plans.find((p) => p.code === selectedPlan)!;

  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      navigate("/auth?redirect=/payment");
    }
  }, [user, navigate]);

  const handlePay = async () => {
    if (!user) return;

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Payment system failed to load. Please try again.");
      return;
    }

    setPaymentStep("processing");

    try {
      // Create order via edge function
      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: { planCode: selectedPlan },
      });

      if (error || !data?.orderId) {
        throw new Error(error?.message || "Failed to create order");
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "NikNote",
        description: `${data.planLabel} Premium Plan`,
        order_id: data.orderId,
        prefill: {
          email: data.userEmail || "",
        },
        theme: {
          color: "#6366f1",
        },
        handler: async (response: any) => {
          // Payment successful — verify on server
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-razorpay-payment", {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planCode: selectedPlan,
              },
            });

            if (verifyError || !verifyData?.success) {
              throw new Error("Verification failed");
            }

            await refreshPremium();
            setPaymentStep("success");
            toast.success("🎉 Payment successful! Premium activated!");

            setTimeout(() => navigate("/"), 2500);
          } catch (err) {
            console.error("Verification error:", err);
            setPaymentStep("error");
            toast.error("Payment verification failed. Contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentStep("select");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response.error);
        setPaymentStep("error");
        toast.error(response.error?.description || "Payment failed");
      });
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      setPaymentStep("error");
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleRetry = () => {
    setPaymentStep("select");
  };

  if (!user) return null;

  // Success Screen
  if (paymentStep === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-green-50/20 to-primary/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center space-y-6 max-w-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Premium Activated! 🎉</h1>
            <p className="text-muted-foreground">
              All premium features are now unlocked.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Redirecting...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Error Screen
  if (paymentStep === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-destructive/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6 max-w-sm"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground mb-2">Payment Failed</h1>
            <p className="text-muted-foreground text-sm">
              Your payment couldn't be processed. Please try again.
            </p>
          </div>
          <Button onClick={handleRetry} className="rounded-xl">
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 h-14 sm:h-16">
        <div className="max-w-lg mx-auto px-4 h-full flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-semibold truncate">Go Premium</h1>
            <p className="text-xs text-muted-foreground truncate">Unlock all features</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
            <Crown className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-border/50 shadow-lg"
        >
          <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Premium Features
          </h2>
          <ul className="space-y-2.5 sm:space-y-3">
            {[
              "Voice Dictation - Speak to write",
              "AI Writing Assistant - Smart suggestions",
              "AI Style Matcher - Match any handwriting",
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Plan Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-muted-foreground px-1">Choose Plan</h2>
          <div className="grid grid-cols-2 gap-3">
            {plans.map((p) => (
              <button
                key={p.code}
                onClick={() => setSelectedPlan(p.code)}
                className={`relative p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 text-left ${
                  selectedPlan === p.code
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border/50 bg-card hover:border-border"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    Best Value
                  </span>
                )}
                <div className="text-xl font-bold">₹{p.price}</div>
                <div className="text-xs text-muted-foreground">{p.period}</div>
                <div className="text-sm font-medium mt-1">{p.label}</div>
                {selectedPlan === p.code && (
                  <motion.div
                    layoutId="selected-plan"
                    className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Pay Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <Button
            onClick={handlePay}
            disabled={paymentStep === "processing"}
            className="w-full h-14 rounded-2xl text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all duration-300"
          >
            {paymentStep === "processing" ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Pay ₹{plan.price} — {plan.label} Plan
              </>
            )}
          </Button>

          {/* Trust Signals */}
          <div className="text-center space-y-2 pb-8">
            <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                Secured by Razorpay
              </span>
              <span className="hidden sm:inline">•</span>
              <span>UPI, Cards, Wallets</span>
              <span className="hidden sm:inline">•</span>
              <span>Instant Activation</span>
            </div>
            <p className="text-xs text-muted-foreground/60">
              By subscribing, you agree to our Terms of Service
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
