import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Try it out with basic features.',
    features: ['2 pages per export', '3 handwriting styles', 'Watermarked PDF', 'Basic paper types'],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Student',
    price: '₹99',
    period: '/month',
    description: 'Perfect for students and daily use.',
    features: ['20 pages per day', 'All handwriting styles', 'No watermark', 'All paper types', 'Project history'],
    cta: 'Get Student Plan',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '₹249',
    period: '/month',
    description: 'Unlimited power for professionals.',
    features: ['Unlimited pages', 'All styles + presets', 'High-res export', 'Priority rendering', 'Save custom presets', 'API access'],
    cta: 'Go Pro',
    highlighted: false,
  },
];

export const PricingTeaser: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-b from-secondary/20 to-background">
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
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Start free, upgrade when you need more. No hidden fees.
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
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => navigate(plan.highlighted ? '/payment' : '/signup')}
                className={`w-full rounded-full h-12 font-semibold ${
                  plan.highlighted
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20'
                    : ''
                }`}
                variant={plan.highlighted ? 'default' : 'outline'}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
