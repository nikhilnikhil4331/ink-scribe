import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown, CheckCircle2, Sparkles, Shield, Zap, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { usePremium } from '@/hooks/usePremium';

const features = [
  { icon: Sparkles, text: 'AI Writing Assistant' },
  { icon: Zap, text: 'Voice Dictation' },
  { icon: Shield, text: 'AI Style Matcher' },
  { icon: Crown, text: 'Unlimited Exports' },
];

const Upgrade: React.FC = () => {
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

      <main className="container mx-auto px-4 py-8 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl border border-border/50 shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-white text-sm font-medium">
              <Crown className="w-4 h-4" />
              Premium Features
            </div>
          </div>

          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-center text-foreground">
              {isPremium ? 'You\'re Premium! 🎉' : 'Unlock Everything'}
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              {isPremium
                ? 'You have access to all premium features.'
                : 'Get access to all premium features and create beautiful handwritten notes effortlessly.'}
            </p>

            <div className="grid gap-3 pt-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{feature.text}</span>
                  <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="h-px bg-border mx-6" />

          <div className="p-6 space-y-4">
            {isPremium ? (
              <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800 text-center">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  ✅ Your premium subscription is active
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate('/payment?plan=weekly')}
                    className="p-4 rounded-2xl border-2 border-border/50 bg-card hover:border-primary hover:bg-primary/5 transition-all text-left"
                  >
                    <div className="text-xl font-bold">₹49</div>
                    <div className="text-xs text-muted-foreground">/week</div>
                    <div className="text-sm font-medium mt-1">Weekly</div>
                  </button>
                  <button
                    onClick={() => navigate('/payment?plan=monthly')}
                    className="relative p-4 rounded-2xl border-2 border-primary bg-primary/5 shadow-lg shadow-primary/10 text-left"
                  >
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                      Best Value
                    </span>
                    <div className="text-xl font-bold">₹99</div>
                    <div className="text-xs text-muted-foreground">/month</div>
                    <div className="text-sm font-medium mt-1">Monthly</div>
                  </button>
                </div>

                <Button
                  onClick={() => navigate('/payment?plan=monthly')}
                  className="w-full h-14 rounded-2xl text-base font-semibold bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Subscribe Now
                </Button>
              </>
            )}

            <p className="text-xs text-center text-muted-foreground">
              Secured by Razorpay • UPI, Cards, Wallets accepted
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <Button variant="ghost" onClick={() => navigate('/')} className="rounded-xl text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Notes
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default Upgrade;
