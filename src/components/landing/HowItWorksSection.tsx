import React from 'react';
import { motion } from 'framer-motion';
import { Type, Palette, Download } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Type,
    title: 'Paste or Type Your Text',
    description: 'Write your content or paste from any source. Supports paragraphs, bullet points, and multi-page documents.',
  },
  {
    number: '02',
    icon: Palette,
    title: 'Choose Style & Paper',
    description: 'Pick from 16+ handwriting fonts, ink colors, paper types (ruled, graph, plain), margins, and spacing.',
  },
  {
    number: '03',
    icon: Download,
    title: 'Preview & Export PDF',
    description: 'See a live preview of your handwritten pages, then export a pixel-perfect PDF in one click.',
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">How It Works</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4 text-foreground">
            Three Steps to Handwritten Notes
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            No drawing skills needed. Just type, style, and download.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative text-center"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
              )}

              {/* Step number + icon */}
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 mb-6">
                <step.icon className="w-10 h-10 text-primary" />
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-lg">
                  {step.number}
                </span>
              </div>

              <h3 className="text-xl font-semibold mb-3 text-foreground">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
