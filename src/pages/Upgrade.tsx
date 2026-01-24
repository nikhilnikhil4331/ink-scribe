import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown, CheckCircle2, Sparkles, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import paymentQR from '@/assets/payment-qr.png';

const features = [
  { icon: Sparkles, text: 'AI Writing Assistant' },
  { icon: Zap, text: 'Voice Dictation' },
  { icon: Shield, text: 'AI Style Matcher' },
  { icon: Crown, text: 'Unlimited Exports' },
];

const Upgrade: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="ml-3 font-semibold text-lg">Upgrade to Premium</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        {/* Premium Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl border border-border/50 shadow-xl overflow-hidden"
        >
          {/* Header Badge */}
          <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-white text-sm font-medium">
              <Crown className="w-4 h-4" />
              Premium Features
            </div>
          </div>

          {/* Features List */}
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-center text-foreground">
              Unlock Everything
            </h2>
            <p className="text-sm text-muted-foreground text-center">
              Get access to all premium features and create beautiful handwritten notes effortlessly.
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

          {/* Divider */}
          <div className="h-px bg-border mx-6" />

          {/* QR Code Section */}
          <div className="p-6 text-center">
            <h3 className="font-semibold text-foreground mb-2">
              Scan to Pay
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Scan the QR code with any UPI app to complete your payment
            </p>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-block p-4 bg-white rounded-2xl shadow-lg"
            >
              <img 
                src={paymentQR} 
                alt="Payment QR Code" 
                className="w-56 h-auto mx-auto"
              />
            </motion.div>

            <p className="text-[11px] text-muted-foreground mt-4">
              UPI ID: <span className="font-mono font-medium text-foreground">Niknote@uboi</span>
            </p>
          </div>

          {/* Footer Note */}
          <div className="px-6 pb-6">
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-xs text-center text-muted-foreground">
                After payment, your premium access will be activated within 24 hours. 
                Contact support if you need immediate activation.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="rounded-xl text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Notes
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default Upgrade;
