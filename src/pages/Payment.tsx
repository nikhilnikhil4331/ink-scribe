import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Check, Crown, Sparkles, CheckCircle, AlertCircle,
  Loader2, CreditCard, Shield, Zap, Star, TrendingUp, Gift,
  BookOpen, Brain, Target, Users, Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePremium } from "@/hooks/usePremium";

type PlanCode = "weekly" | "monthly" | "annual" | "lifetime";
type PaymentStep = "select" | "processing" | "success" | "error";

interface Plan {
  code: PlanCode;
  label: string;
  price: number;
  period: string;
  popular?: boolean;
  badge?: string;
  savings?: string;
  icon: any;
}

const plans: Plan[] = [
  { code: "weekly", label: "Weekly", price: 49, period: "/week", icon: Zap },
  {
    code: "monthly", label: "Monthly", price: 99, period: "/month",
    popular: true, icon: Star, badge: "Most Popular"
  },
  {
    code: "annual", label: "Annual", price: 499, period: "/year",
    savings: "Save ₹689", icon: TrendingUp, badge: "Best Value"
  },
  {
    code: "lifetime", label: "Lifetime", price: 1999, period: "one-time",
    savings: "Save ₹9,389", icon: Crown, badge: "🔥 Limited"
  },
];

const examPacks = [
  { id: "jee", label: "JEE Complete", price: 149, icon: Target, subjects: "Physics, Chemistry, Math", color: "from-blue-500 to-indigo-600" },
  { id: "neet", label: "NEET Complete", price: 149, icon: Brain, subjects: "Biology, Chemistry, Physics", color: "from-green-500 to-emerald-600" },
  { id: "upsc", label: "UPSC Complete", price: 199, icon: BookOpen, subjects: "GS, Current Affairs, Essays", color: "from-orange-500 to-red-600" },
  { id: "cbse10", label: "CBSE Class 10", price: 99, icon: BookOpen, subjects: "All Subjects, NCERT Solutions", color: "from-purple-500 to-pink-600" },
  { id: "cbse12", label: "CBSE Class 12", price: 99, icon: BookOpen, subjects: "All Subjects, Board Prep", color: "from-teal-500 to-cyan-600" },
];

const premiumFeatures = [
  { icon: Sparkles, text: "AI Note Generator", desc: "Unlimited AI-generated notes" },
  { icon: Brain, text: "AI Solver", desc: "Solve any problem instantly" },
  { icon: Target, text: "AI Flashcards", desc: "Auto-generate study cards" },
  { icon: BookOpen, text: "Voice Dictation", desc: "Speak to write notes" },
  { icon: Crown, text: "Handwriting DNA", desc: "All 16+ handwriting styles" },
  { icon: Gift, text: "Exam Packs", desc: "JEE, NEET, UPSC content" },
  { icon: Zap, text: "Priority AI", desc: "Faster responses, better results" },
  { icon: Users, text: "PDF Export", desc: "Unlimited exports & sharing" },
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
  const { refresh: refreshPremium, isPremium } = usePremium();

  const initialPlan = (searchParams.get("plan") as PlanCode) || "monthly";
  const [selectedPlan, setSelectedPlan] = useState<PlanCode>(initialPlan);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>("select");
  const [showExamPacks, setShowExamPacks] = useState(false);
  const [selectedExamPacks, setSelectedExamPacks] = useState<string[]>([]);

  const plan = plans.find((p) => p.code === selectedPlan)!;

  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      navigate("/auth?redirect=/payment");
    }
  }, [user, navigate]);

  const toggleExamPack = (id: string) => {
    setSelectedExamPacks(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const examPacksTotal = selectedExamPacks.reduce((sum, id) => {
    const pack = examPacks.find(p => p.id === id);
    return sum + (pack?.price || 0);
  }, 0);

  const handlePay = async () => {
    if (!user) return;

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Payment system failed to load. Please try again.");
      return;
    }

    setPaymentStep("processing");

    try {
      // Calculate total amount
      let totalAmount = plan.price;
      if (selectedExamPacks.length > 0) {
        totalAmount += examPacksTotal;
      }

      // Create order via edge function
      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: {
          planCode: selectedPlan,
          amount: totalAmount * 100, // Convert to paise
          examPacks: selectedExamPacks,
        },
      });

      if (error || !data?.orderId) {
        throw new Error(error?.message || "Failed to create order");
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "NikNote",
        description: `${data.planLabel} Premium Plan${selectedExamPacks.length > 0 ? ` + ${selectedExamPacks.length} Exam Pack(s)` : ''}`,
        order_id: data.orderId,
        prefill: {
          email: data.userEmail || "",
        },
        theme: {
          color: "#6366f1",
        },
        handler: async (response: any) => {
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-razorpay-payment", {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planCode: selectedPlan,
                examPacks: selectedExamPacks,
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
              All premium features are now unlocked. Go create magic! ✨
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

  if (isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 h-14 sm:h-16">
          <div className="max-w-lg mx-auto px-4 h-full flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-base font-semibold">You're Premium! 🎉</h1>
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-8 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl">
            <Crown className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold">Premium Active ✨</h2>
          <p className="text-muted-foreground">All features unlocked! Keep creating amazing notes.</p>
          <Button onClick={() => navigate("/")} className="rounded-xl">Go to Editor</Button>
        </main>
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
            <h1 className="text-base sm:text-lg font-semibold truncate">Go Premium ✨</h1>
            <p className="text-xs text-muted-foreground truncate">Unlock everything</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
            <Crown className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4 pb-32">
        {/* Social Proof Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 py-2 px-4 bg-primary/5 rounded-full text-xs font-medium"
        >
          <Flame className="h-3.5 w-3.5 text-orange-500" />
          <span>2,500+ students already premium</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-green-600">4.8 ⭐</span>
        </motion.div>

        {/* Premium Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-4 border border-border/50 shadow-lg"
        >
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Premium Features
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {premiumFeatures.map((feature, i) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30"
              >
                <feature.icon className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium leading-tight">{feature.text}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">{feature.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Plan Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-semibold text-foreground px-1">Choose Plan</h2>
          <div className="grid grid-cols-2 gap-2">
            {plans.map((p) => (
              <button
                key={p.code}
                onClick={() => setSelectedPlan(p.code)}
                className={`relative p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedPlan === p.code
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border/50 bg-card hover:border-border"
                } ${p.code === 'annual' || p.code === 'lifetime' ? 'col-span-2' : ''}`}
              >
                {p.badge && (
                  <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
                    p.badge.includes('🔥') ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' :
                    p.badge === 'Best Value' ? 'bg-green-500 text-white' :
                    'bg-primary text-primary-foreground'
                  }`}>
                    {p.badge}
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p.icon className={`h-3.5 w-3.5 ${selectedPlan === p.code ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-xs font-medium">{p.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-bold">₹{p.price}</span>
                      <span className="text-[10px] text-muted-foreground">{p.period}</span>
                    </div>
                    {p.savings && (
                      <div className="text-[10px] font-semibold text-green-600 mt-0.5">
                        {p.savings}
                      </div>
                    )}
                  </div>
                  {selectedPlan === p.code && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
                {/* Price breakdown for annual/lifetime */}
                {(p.code === 'annual') && (
                  <div className="mt-1.5 pt-1.5 border-t border-border/30 text-[10px] text-muted-foreground">
                    Just ₹41.6/month • Save 58%
                  </div>
                )}
                {p.code === 'lifetime' && (
                  <div className="mt-1.5 pt-1.5 border-t border-border/30 text-[10px] text-muted-foreground">
                    Pay once, use forever • All future updates FREE
                  </div>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Exam Packs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <button
            onClick={() => setShowExamPacks(!showExamPacks)}
            className="w-full flex items-center justify-between px-1"
          >
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Add Exam Packs
              <span className="text-[10px] bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full">Optional</span>
            </h2>
            <span className={`text-xs text-muted-foreground transition-transform ${showExamPacks ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showExamPacks && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2 overflow-hidden"
            >
              {examPacks.map((pack) => (
                <button
                  key={pack.id}
                  onClick={() => toggleExamPack(pack.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    selectedExamPacks.includes(pack.id)
                      ? "border-primary bg-primary/5"
                      : "border-border/30 bg-card hover:border-border/60"
                  }`}
                >
                  <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${pack.color} flex items-center justify-center flex-shrink-0`}>
                    <pack.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{pack.label}</div>
                    <div className="text-[10px] text-muted-foreground">{pack.subjects}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold">₹{pack.price}</div>
                    <div className="text-[10px] text-muted-foreground">one-time</div>
                  </div>
                  {selectedExamPacks.includes(pack.id) && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Sticky Pay Button */}
        <div className="fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/40 p-4">
          <div className="max-w-lg mx-auto space-y-2">
            {/* Price Summary */}
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>{plan.label} Plan: ₹{plan.price}</span>
              {selectedExamPacks.length > 0 && (
                <span>+ {selectedExamPacks.length} Pack(s): ₹{examPacksTotal}</span>
              )}
              <span className="font-bold text-foreground">Total: ₹{plan.price + examPacksTotal}</span>
            </div>
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
                  Pay ₹{plan.price + examPacksTotal} — {plan.label} Plan
                </>
              )}
            </Button>
            <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Secured by Razorpay
              </span>
              <span>•</span>
              <span>UPI, Cards, Wallets</span>
              <span>•</span>
              <span>Instant Activation</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
