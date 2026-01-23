import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Copy, Crown, QrCode, Smartphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const UPI_ID = "niknote@uboi";
const UPI_NAME = "NikNote Premium";

type PlanCode = "weekly" | "monthly";

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

// Generate UPI deep link
function generateUpiLink(amount: number, txnNote: string): string {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: UPI_NAME,
    am: amount.toString(),
    cu: "INR",
    tn: txnNote,
  });
  return `upi://pay?${params.toString()}`;
}

// Generate QR code URL using a free API
function generateQrCodeUrl(upiLink: string, size = 280): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(upiLink)}&margin=8`;
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const initialPlan = (searchParams.get("plan") as PlanCode) || "monthly";
  const [selectedPlan, setSelectedPlan] = useState<PlanCode>(initialPlan);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  const plan = plans.find((p) => p.code === selectedPlan)!;
  const upiLink = generateUpiLink(plan.price, `NikNote ${plan.label} Subscription`);
  const qrUrl = generateQrCodeUrl(upiLink);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      navigate("/auth?redirect=/payment");
    }
  }, [user, navigate]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    toast.success("UPI ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayWithUpi = () => {
    setPaymentInitiated(true);
    // Try to open UPI app
    window.location.href = upiLink;
    
    // Show QR fallback after a short delay
    setTimeout(() => {
      setShowQr(true);
    }, 1500);
  };

  const handlePaymentComplete = async () => {
    if (!user) return;

    // Call secure edge function to record payment (uses service role)
    const { error } = await supabase.functions.invoke("record-payment", {
      body: { planCode: selectedPlan },
    });

    if (error) {
      console.error("Payment recording error:", error);
      toast.error("Failed to record payment. Please contact support.");
      return;
    }

    toast.success("Payment recorded! Premium features will be activated after verification.");
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Go Premium</h1>
            <p className="text-xs text-muted-foreground">Unlock all features</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Crown className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-5 border border-border/50 shadow-lg"
        >
          <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Premium Features
          </h2>
          <ul className="space-y-3">
            {[
              "Voice Dictation - Speak to write",
              "AI Writing Assistant - Smart suggestions",
              "AI Style Matcher - Match any handwriting",
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                {feature}
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
                className={`relative p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                  selectedPlan === p.code
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border/50 bg-card hover:border-border"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
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
          className="bg-card rounded-3xl p-5 border border-border/50 shadow-lg space-y-5"
        >
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-1">Pay ₹{plan.price}</h2>
            <p className="text-sm text-muted-foreground">
              Scan QR or pay using any UPI app
            </p>
          </div>

          {/* QR Code */}
          <AnimatePresence mode="wait">
            {(showQr || !paymentInitiated) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex justify-center"
              >
                <div className="bg-background p-4 rounded-2xl shadow-inner">
                  <img
                    src={qrUrl}
                    alt="UPI QR Code"
                    className="w-56 h-56 rounded-lg"
                    loading="eager"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* UPI ID with Copy */}
          <div className="flex items-center justify-center gap-2 bg-muted/50 rounded-xl p-3">
            <span className="text-sm font-mono font-medium">{UPI_ID}</span>
            <button
              onClick={handleCopyUpi}
              className="p-1.5 rounded-lg bg-background hover:bg-primary/10 transition-colors"
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
            className="w-full h-14 rounded-2xl text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all duration-300"
          >
            <Smartphone className="h-5 w-5 mr-2" />
            Pay with UPI App
          </Button>

          {/* Fallback Message */}
          <AnimatePresence>
            {paymentInitiated && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3"
              >
                <p className="text-center text-sm text-muted-foreground">
                  If UPI app didn't open, scan the QR code above
                </p>
                <Button
                  onClick={handlePaymentComplete}
                  variant="outline"
                  className="w-full h-12 rounded-xl"
                >
                  <Check className="h-4 w-4 mr-2" />
                  I've Completed Payment
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
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <QrCode className="h-3.5 w-3.5" />
              Secure UPI
            </span>
            <span>•</span>
            <span>Instant Activation</span>
            <span>•</span>
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
