import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Copy, Crown, QrCode, Smartphone, Sparkles, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePremium } from "@/hooks/usePremium";

const UPI_ID = "niknote@uboi";
const UPI_NAME = "NikhilNotes";

type PlanCode = "weekly" | "monthly";
type PaymentStep = "select" | "pay" | "verifying" | "success" | "error";

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

// Generate UPI deep link with fixed amount
function generateUpiLink(amount: number, txnNote: string): string {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: UPI_NAME,
    am: amount.toFixed(2),
    cu: "INR",
    tn: txnNote,
    mode: "02", // UPI Collect mode
  });
  return `upi://pay?${params.toString()}`;
}

// Generate QR code URL with amount baked in
function generateQrCodeUrl(upiLink: string, size = 240): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(upiLink)}&margin=8&format=png`;
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { refresh: refreshPremium } = usePremium();

  const initialPlan = (searchParams.get("plan") as PlanCode) || "monthly";
  const [selectedPlan, setSelectedPlan] = useState<PlanCode>(initialPlan);
  const [copied, setCopied] = useState(false);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>("select");
  const [showQr, setShowQr] = useState(false);

  const plan = plans.find((p) => p.code === selectedPlan)!;
  const upiLink = generateUpiLink(plan.price, `NikhilNotes-${plan.label}`);
  const qrUrl = generateQrCodeUrl(upiLink);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      navigate("/auth?redirect=/payment");
    }
  }, [user, navigate]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(`${UPI_ID} (Amount: ₹${plan.price})`);
    setCopied(true);
    toast.success("UPI details copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayWithUpi = () => {
    setPaymentStep("pay");
    
    // Try to open UPI app with deep link
    window.location.href = upiLink;
    
    // If deep link didn't work, show QR after delay
    setTimeout(() => {
      setShowQr(true);
    }, 1000);
  };

  const handlePaymentComplete = async () => {
    if (!user) return;

    setPaymentStep("verifying");

    try {
      // Call secure edge function to record payment
      const { error } = await supabase.functions.invoke("record-payment", {
        body: { planCode: selectedPlan },
      });

      if (error) throw error;

      // Refresh premium status
      await refreshPremium();

      setPaymentStep("success");
      toast.success("🎉 Payment recorded! Verifying...");

      // Navigate home after success animation
      setTimeout(() => {
        navigate("/");
      }, 2500);
    } catch (error) {
      console.error("Payment recording error:", error);
      setPaymentStep("error");
      toast.error("Failed to record payment. Please contact support.");
    }
  };

  const handleRetry = () => {
    setPaymentStep("select");
    setShowQr(false);
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
            <h1 className="text-2xl font-bold text-foreground mb-2">Payment Successful! 🎉</h1>
            <p className="text-muted-foreground">
              Premium features will be unlocked after verification.
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
            <h1 className="text-xl font-bold text-foreground mb-2">Something went wrong</h1>
            <p className="text-muted-foreground text-sm">
              Your payment couldn't be recorded. Please try again or contact support.
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
      {/* Header - Fixed height */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 h-14 sm:h-16">
        <div className="max-w-lg mx-auto px-4 h-full flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full h-9 w-9"
          >
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
                onClick={() => {
                  setSelectedPlan(p.code);
                  setShowQr(false);
                }}
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

        {/* Payment Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-border/50 shadow-lg space-y-4 sm:space-y-5"
        >
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-1">Pay ₹{plan.price}</h2>
            <p className="text-sm text-muted-foreground">
              Scan QR or pay using any UPI app
            </p>
          </div>

          {/* QR Code - Always visible after plan selection */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center"
          >
            <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-inner">
              <img
                src={qrUrl}
                alt={`Pay ₹${plan.price} via UPI`}
                className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg"
                loading="eager"
              />
            </div>
          </motion.div>

          {/* Amount Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-2 rounded-full text-sm">
              Amount: ₹{plan.price}
            </div>
          </div>

          {/* UPI ID with Copy */}
          <div className="flex items-center justify-center gap-2 bg-muted/50 rounded-xl p-3">
            <span className="text-xs sm:text-sm font-mono font-medium truncate">{UPI_ID}</span>
            <button
              onClick={handleCopyUpi}
              className="p-1.5 rounded-lg bg-background hover:bg-primary/10 transition-colors flex-shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Pay Button */}
          <Button
            onClick={handlePayWithUpi}
            disabled={paymentStep === "verifying"}
            className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all duration-300"
          >
            <Smartphone className="h-5 w-5 mr-2" />
            Open UPI App (₹{plan.price})
          </Button>

          {/* Post-payment Section */}
          <AnimatePresence>
            {(paymentStep === "pay" || showQr) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pt-2"
              >
                <div className="h-px bg-border/50" />
                <p className="text-center text-xs sm:text-sm text-muted-foreground">
                  After payment, tap the button below
                </p>
                <Button
                  onClick={handlePaymentComplete}
                  disabled={paymentStep === "verifying"}
                  variant="outline"
                  className="w-full h-11 sm:h-12 rounded-xl border-green-500/50 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                >
                  {paymentStep === "verifying" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      I've Completed Payment
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Trust Signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-2 pb-8"
        >
          <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <QrCode className="h-3.5 w-3.5" />
              Secure UPI
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Instant QR</span>
            <span className="hidden sm:inline">•</span>
            <span>24/7 Support</span>
          </div>
          <p className="text-xs text-muted-foreground/60">
            By subscribing, you agree to our Terms of Service
          </p>
        </motion.div>
      </main>
    </div>
  );
}
