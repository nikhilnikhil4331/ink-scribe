import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const AISolverButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
      onClick={() => navigate('/ai-solver')}
      className={cn(
        "fixed top-[200px] right-4 z-40",
        "flex items-center gap-2",
        "px-4 py-2.5 rounded-full",
        "bg-gradient-to-r from-primary via-accent to-primary",
        "text-primary-foreground font-semibold text-sm",
        "shadow-lg shadow-primary/30",
        "hover:shadow-xl hover:shadow-accent/40",
        "transition-shadow duration-200"
      )}
    >
      <Brain className="w-4 h-4" />
      <span>AI Solver</span>
    </motion.button>
  );
};

AISolverButton.displayName = 'AISolverButton';
