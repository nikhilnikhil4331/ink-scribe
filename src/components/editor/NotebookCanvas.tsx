import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NotebookCanvasProps {
  children: React.ReactNode;
  pageDirection: 'left' | 'right' | 'none';
  pageId: string;
  className?: string;
}

// Page transition variants
const pageVariants = {
  enter: (direction: string) => ({
    x: direction === 'right' ? 100 : direction === 'left' ? -100 : 0,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: string) => ({
    x: direction === 'right' ? -100 : direction === 'left' ? 100 : 0,
    opacity: 0,
    scale: 0.98,
  }),
};

export const NotebookCanvas: React.FC<NotebookCanvasProps> = ({
  children,
  pageDirection,
  pageId,
  className,
}) => {
  return (
    <div className={cn(
      "relative",
      "rounded-[20px]",
      "bg-white dark:bg-paper",
      "border-l-4 border-l-[hsl(0,65%,60%)]", // Red margin line
      "shadow-2xl shadow-black/10 dark:shadow-black/30",
      "overflow-hidden",
      className
    )}>
      {/* Cream paper texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(245, 240, 230, 0.3) 0%, transparent 50%, rgba(245, 240, 230, 0.2) 100%)',
          mixBlendMode: 'multiply',
        }}
      />

      {/* Ruled lines background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, hsl(210, 35%, 88%) 31px, hsl(210, 35%, 88%) 32px)',
        }}
      />

      {/* Content with page transitions */}
      <AnimatePresence mode="wait" custom={pageDirection}>
        <motion.div
          key={pageId}
          custom={pageDirection}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="relative z-10 min-h-[600px] p-6"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

NotebookCanvas.displayName = 'NotebookCanvas';
