import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Play, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onStartWriting: () => void;
  onPreviewNotes: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  onStartWriting, 
  onPreviewNotes 
}) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {/* Floating Orbs */}
      <motion.div 
        className="absolute top-20 left-[10%] w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        animate={{ 
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-20 right-[10%] w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        animate={{ 
          y: [0, -40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Handwriting</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            <span className="text-foreground">Turn Text Into</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Beautiful Handwritten
            </span>
            <br />
            <span className="text-foreground">Notes</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Create stunning, realistic handwritten notes in seconds. 
            Perfect for students, creators, and anyone who wants their notes 
            to feel <span className="text-foreground font-medium">personal and authentic</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={onStartWriting}
              className="group relative h-14 px-8 text-base font-semibold rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
            >
              <span className="flex items-center gap-2">
                Start Writing
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={onPreviewNotes}
              className="group h-14 px-8 text-base font-semibold rounded-full border-2 hover:bg-secondary/50 transition-all duration-300 hover:scale-105"
            >
              <Play className="w-5 h-5 mr-2 text-primary" />
              Preview Notes
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-accent text-accent" />
              ))}
              <span className="ml-2 text-sm font-medium text-foreground">4.9/5</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-border" />
            <p className="text-sm text-muted-foreground">
              Loved by <span className="font-semibold text-foreground">10,000+</span> students & creators
            </p>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
        >
          <motion.div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
};
