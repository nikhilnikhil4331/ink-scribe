import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Shuru karo — risk nahi!',
    features: [
      '✍️ 16+ handwriting styles',
      '🧠 AI Teacher (28+ subjects)',
      '📝 Quiz Generator',
      '📄 Basic PDF export',
      '🎨 12 ink colors',
      '📱 Mobile + Desktop',
    ],
    cta: 'Start Free ✨',
    highlighted: false,
  },
  {
    name: 'Student Pro',
    price: '₹99',
    period: '/month',
    description: 'Ek chai se sasta! ☕',
    features: [
      '✨ Sab kuch Free mein +',
      '📄 Unlimited pages',
      '📥 No watermark PDF',
      '🎨 Custom colors + presets',
      '🧠 Advanced AI features',
      '💾 Project history & sync',
      '📊 Mind Maps & Diagrams',
      '⚡ Priority rendering',
    ],
    cta: 'Get Student Pro 🔥',
    highlighted: true,
  },
  {
    name: 'Lifetime',
    price: '₹999',
    period: 'once',
    description: 'Ek baar pay, forever use!',
    features: [
      '✨ Sab kuch Student Pro +',
      '🔓 Lifetime access',
      '🚀 Early access to new features',
      '💬 Priority support',
      '👨‍🏫 Teacher mode',
      '📊 Batch export',
      '🔌 API access',
    ],
    cta: 'Get Lifetime Access 🏆',
    highlighted: false,
  },
];

export const PricingTeaser: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-secondary/20 to-background">
      <div className="container mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Pricing</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4 text-foreground">
            Simple Pricing — Ek Chai Se Sasta! ☕
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Free mein shuru karo, jab zaroorat ho tab upgrade karo. Hidden charges nahi!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-3xl p-8 border transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-primary/5 to-accent/5 border-primary/30 shadow-xl shadow-primary/10 scale-[1.02]'
                  : 'bg-card border-border/50 hover:border-primary/20 hover:shadow-lg'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-2.5 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => navigate(plan.highlighted ? '/payment' : '/signup')}
                className={`w-full rounded-full h-12 font-semibold ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 text-white shadow-lg shadow-primary/20'
                    : ''
                }`}
                variant={plan.highlighted ? 'default' : 'outline'}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              {plan.name === 'Student Pro' && (
                <p className="text-center text-[11px] text-muted-foreground mt-3">
                  UPI • Credit Card • Debit Card accepted
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
