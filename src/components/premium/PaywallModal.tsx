import React from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Crown, Mic, Sparkles, Wand2, CreditCard, Brain, FileImage, BookOpen, Volume2 } from "lucide-react";
import { type PremiumFeature } from "@/contexts/PremiumContext";

export interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: PremiumFeature;
  usedCount?: number;
  limitCount?: number;
}

const featureLabels: Record<PremiumFeature, { icon: any; label: string; desc: string }> = {
  ai_note_generator: { icon: Wand2, label: "AI Note Generator", desc: "Generate unlimited notes with AI" },
  ai_solver: { icon: Brain, label: "AI Solver", desc: "Unlimited problem solving" },
  ai_text_tools: { icon: Sparkles, label: "AI Text Tools", desc: "Rewrite, summarize & more" },
  handwriting_styles: { icon: Wand2, label: "Handwriting DNA", desc: "Unlimited custom styles" },
  image_pdf_convert: { icon: FileImage, label: "Image/PDF to Notes", desc: "Unlimited conversions" },
  voice_to_notes: { icon: Volume2, label: "Voice to Notes", desc: "Unlimited transcription" },
  ai_flashcards: { icon: BookOpen, label: "AI Flashcards", desc: "Unlimited decks & cards" },
};

const allFeatures = [
  { icon: Wand2, label: "AI Note Generator", desc: "Unlimited AI-generated notes" },
  { icon: Brain, label: "AI Solver", desc: "Unlimited problem solving" },
  { icon: Sparkles, label: "AI Text Tools", desc: "Rewrite, summarize, expand" },
  { icon: Mic, label: "Voice Dictation", desc: "Unlimited voice transcription" },
  { icon: FileImage, label: "Image/PDF to Notes", desc: "Unlimited conversions" },
  { icon: BookOpen, label: "AI Flashcards", desc: "Unlimited decks & cards" },
];

const plans = [
  { code: "weekly", label: "Weekly", price: "₹49", period: "/week" },
  { code: "monthly", label: "Monthly", price: "₹99", period: "/month", popular: true },
];

export const PaywallModal: React.FC<PaywallModalProps> = ({ open, onOpenChange, feature, usedCount, limitCount }) => {
  const navigate = useNavigate();

  const handleSelectPlan = (planCode: string) => {
    onOpenChange(false);
    navigate(`/payment?plan=${planCode}`);
  };

  const triggeredFeature = feature ? featureLabels[feature] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border-border/50 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 pb-4">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                <Crown className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="text-xl">Upgrade to Premium</DialogTitle>
                <DialogDescription className="text-sm">
                  Unlock all AI features
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 pt-2 space-y-5">
          {/* Usage warning */}
          {triggeredFeature && usedCount !== undefined && limitCount !== undefined && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
                <triggeredFeature.icon className="h-4 w-4" />
                {triggeredFeature.label}
              </div>
              <p className="text-xs text-amber-600/80 mt-1">
                You've used {usedCount}/{limitCount} free uses. Upgrade for unlimited access!
              </p>
            </div>
          )}

          {/* All Premium Features */}
          <div className="space-y-2">
            {allFeatures.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">{f.label}</div>
                  <div className="text-xs text-muted-foreground">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Plans */}
          <div className="grid grid-cols-2 gap-3">
            {plans.map((p) => (
              <button
                key={p.code}
                onClick={() => handleSelectPlan(p.code)}
                className="relative p-4 rounded-2xl border-2 border-border/50 bg-card hover:border-primary hover:bg-primary/5 transition-all duration-200 text-left group"
              >
                {p.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
                    Popular
                  </span>
                )}
                <div className="text-xl font-bold group-hover:text-primary transition-colors">
                  {p.price}
                </div>
                <div className="text-xs text-muted-foreground">{p.period}</div>
                <div className="text-sm font-medium mt-1">{p.label}</div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5" />
            <span>Secured by Razorpay • UPI, Cards, Wallets</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
