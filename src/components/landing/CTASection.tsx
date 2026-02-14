import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CTASectionProps {
  onStartWriting: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onStartWriting }) => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      
      {/* Animated Background Orbs */}
      <motion.div
        className="absolute top-0 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
        animate={{ y: [0, 20, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl"
        animate={{ y: [0, -30, 0], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30"
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Note-Taking Experience?
            </span>
          </h2>

          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Join thousands of students and creators who are already using 
            Nik Note to create beautiful, authentic handwritten notes.
          </p>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={onStartWriting}
              className="group glass-liquid h-16 px-10 text-lg font-semibold text-white transition-all duration-300 cursor-pointer"
            >
              <span className="flex items-center gap-3">
                Start Creating Now
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </motion.div>

          <p className="mt-6 text-sm text-muted-foreground">
            No signup required • Free to start • Export instantly
          </p>
        </motion.div>
      </div>
    </section>
  );
};
