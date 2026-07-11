import React from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Crown, Mic, Sparkles, Wand2, CreditCard, Brain, FileImage,
  BookOpen, Volume2, Star, TrendingUp, Zap, Shield, Flame
} from "lucide-react";
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
  { code: "weekly", label: "Weekly", price: "₹49", period: "/week", icon: Zap },
  { code: "monthly", label: "Monthly", price: "₹99", period: "/month", popular: true, icon: Star },
  { code: "annual", label: "Annual", price: "₹499", period: "/year", savings: "Save 58%", icon: TrendingUp },
  { code: "lifetime", label: "Lifetime", price: "₹1,999", period: "one-time", savings: "🔥 Limited", icon: Crown },
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
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border-border/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 pb-3">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                <Crown className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="text-lg">Upgrade to Premium</DialogTitle>
                <DialogDescription className="text-xs">
                  Unlock all AI features — starting ₹49/week
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {/* Social Proof */}
          <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-muted-foreground">
            <Flame className="h-3 w-3 text-orange-500" />
            <span>2,500+ students already premium</span>
          </div>
        </div>

        <div className="p-5 pt-2 space-y-4">
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

          {/* Premium Features - Compact */}
          <div className="grid grid-cols-2 gap-1.5">
            {allFeatures.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
              >
                <f.icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="text-[11px] font-medium leading-tight">{f.label}</span>
              </div>
            ))}
          </div>

          {/* Plans - Grid */}
          <div className="grid grid-cols-2 gap-2">
            {plans.map((p) => (
              <button
                key={p.code}
                onClick={() => handleSelectPlan(p.code)}
                className={`relative p-3 rounded-xl border-2 bg-card hover:bg-primary/5 transition-all duration-200 text-left group ${
                  p.popular ? 'border-primary shadow-md shadow-primary/10' : 'border-border/50 hover:border-primary/50'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                    Popular
                  </span>
                )}
                {p.savings && (
                  <span className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                    p.savings.includes('🔥') ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
                  }`}>
                    {p.savings}
                  </span>
                )}
                <div className="flex items-center gap-1.5 mb-1">
                  <p.icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] font-medium text-muted-foreground">{p.label}</span>
                </div>
                <div className="text-lg font-bold group-hover:text-primary transition-colors">
                  {p.price}
                </div>
                <div className="text-[10px] text-muted-foreground">{p.period}</div>
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={() => handleSelectPlan('monthly')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-sm hover:from-primary/90 hover:to-primary/70 transition-all shadow-lg shadow-primary/20"
          >
            <CreditCard className="h-4 w-4 inline mr-2" />
            Upgrade Now — Starting ₹49/week
          </button>

          {/* Trust Signals */}
          <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Razorpay Secure
            </span>
            <span>•</span>
            <span>UPI, Cards</span>
            <span>•</span>
            <span>Cancel Anytime</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
