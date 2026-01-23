import React from 'react';
import { motion } from 'framer-motion';
import { PenLine, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingHeaderProps {
  isDark: boolean;
  onToggleDark: () => void;
  onStartWriting: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  isDark,
  onToggleDark,
  onStartWriting,
}) => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30"
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <PenLine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground tracking-tight">Nik Note</h1>
              <p className="text-[10px] text-muted-foreground font-medium hidden sm:block">
                Realistic Handwritten Notes
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDark}
              className="rounded-xl hover:bg-secondary/80"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-foreground" />
              )}
            </Button>

            {/* CTA */}
            <Button
              onClick={onStartWriting}
              className="hidden sm:flex h-10 px-6 rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 font-medium"
            >
              Start Writing
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
