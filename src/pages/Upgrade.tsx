import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Crown, CheckCircle2, Sparkles, Shield, Zap,
  CreditCard, Star, Brain, BookOpen, Flame, Users, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { usePremium } from '@/hooks/usePremium';
import { UrgencyTimer } from '@/components/urgency/UrgencyTimer';

const plans = [
  {
    code: 'weekly',
    label: 'Student Pro',
    price: 49,
    period: '/week',
    icon: Zap,
    badge: 'Try First',
    features: ['All AI features', '16+ handwriting styles', 'PDF export', 'Voice dictation'],
  },
  {
    code: 'monthly',
    label: 'Premium',
    price: 99,
    period: '/month',
    icon: Star,
    popular: true,
    badge: 'Most Popular',
    features: ['Everything in Student Pro', 'Priority AI responses', 'AI flashcards & quizzes', 'Early access to new features'],
  },
];

const allFeatures = [
  { icon: Sparkles, text: 'AI Note Generator', desc: 'Unlimited AI notes' },
  { icon: Brain, text: 'AI Solver', desc: 'Solve any problem' },
  { icon: Star, text: 'AI Flashcards', desc: 'Auto study cards' },
  { icon: BookOpen, text: 'Voice Dictation', desc: 'Speak to write' },
  { icon: Crown, text: '16+ Handwriting Styles', desc: 'Your handwriting, AI-powered' },
  { icon: Zap, text: 'Unlimited Exports', desc: 'PDF, image, share' },
  { icon: Shield, text: 'Priority AI', desc: 'Faster responses' },
  { icon: Sparkles, text: 'AI Text Tools', desc: 'Rewrite, summarize' },
];

const Upgrade = () => {
  useDocumentTitle({ title: 'Upgrade to Premium — NikNote | AI Study App', description: 'Unlock all NikNote premium features — AI notes, handwriting, quizzes, flashcards. Starting ₹49/week.' });
  const navigate = useNavigate();
  const { isPremium } = usePremium();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="ml-3 font-semibold text-lg">Upgrade to Premium</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-8 pb-12">
        {/* Urgency Timer */}
        <UrgencyTimer variant="card" />

        {/* Social Proof */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 via-orange-500/10 to-pink-500/10 text-sm font-medium border border-primary/10">
            <Flame className="h-4 w-4 text-orange-500" />
            2,500+ students already premium
            <span className="text-muted-foreground">•</span>
            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            <span className="text-green-600 font-semibold">₹49/week</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {isPremium ? "You're Premium! 🎉" : "Unlock Your Full Potential"}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            {isPremium
              ? 'All premium features are active. Keep creating amazing notes!'
              : 'The ultimate AI study companion — write, solve, and learn smarter.'}
          </p>
        </div>

        {isPremium ? (
          <div className="text-center py-8">
            <Button onClick={() => navigate('/')} className="rounded-xl">Go to Editor</Button>
          </div>
        ) : (
          <>
            {/* Features Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {allFeatures.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border/30 text-center"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-xs font-medium">{feature.text}</div>
                  <div className="text-[10px] text-muted-foreground">{feature.desc}</div>
                </motion.div>
              ))}
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.code}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className={`relative bg-card rounded-2xl border-2 overflow-hidden ${
                    plan.popular ? 'border-primary shadow-xl shadow-primary/10' : 'border-border/30'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-primary/60" />
                  )}
                  {plan.badge && (
                    <div className={`absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      plan.popular ? 'bg-primary text-primary-foreground' : 'bg-orange-500/10 text-orange-600'
                    }`}>
                      {plan.badge}
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <plan.icon className={`h-5 w-5 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-semibold">{plan.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold">₹{plan.price}</span>
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    </div>
                    <ul className="space-y-2 mb-5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => navigate(`/payment?plan=${plan.code}`)}
                      className={`w-full rounded-xl ${
                        plan.popular ? 'bg-gradient-to-r from-primary to-primary/80' : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Get {plan.label}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* B2B Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20 text-center space-y-3"
            >
              <Users className="h-8 w-8 text-primary mx-auto" />
              <h3 className="text-lg font-bold">For Schools & Coaching Centers</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Custom plans starting ₹25,000/year. White-label option available.
              </p>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => navigate('/schools')}
              >
                View B2B Plans
              </Button>
            </motion.div>

            {/* Trust Signals */}
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                Secured by Razorpay
              </span>
              <span>UPI, Cards, Wallets</span>
              <span>Cancel Anytime</span>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Upgrade;
