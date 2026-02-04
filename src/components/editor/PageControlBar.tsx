import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageControlBarProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onAddPage: () => void;
  onDeletePage: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export const PageControlBar: React.FC<PageControlBarProps> = ({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onAddPage,
  onDeletePage,
  canGoPrev,
  canGoNext,
}) => {
  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed top-[140px] left-1/2 -translate-x-1/2 z-40"
    >
      <div className={cn(
        "flex items-center gap-2",
        "px-3 py-2 rounded-full",
        "bg-card/90 backdrop-blur-2xl",
        "border border-border/40",
        "shadow-soft"
      )}>
        {/* Previous Page */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onPrevPage}
          disabled={!canGoPrev}
          className={cn(
            "w-8 h-8 rounded-full",
            "bg-secondary/80 hover:bg-secondary",
            "flex items-center justify-center",
            "transition-colors",
            "disabled:opacity-30 disabled:cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>

        {/* Page Number */}
        <div className={cn(
          "px-4 py-1.5 rounded-full",
          "bg-muted/50",
          "text-sm font-medium text-foreground"
        )}>
          {currentPage} / {totalPages}
        </div>

        {/* Next Page */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onNextPage}
          disabled={!canGoNext}
          className={cn(
            "w-8 h-8 rounded-full",
            "bg-secondary/80 hover:bg-secondary",
            "flex items-center justify-center",
            "transition-colors",
            "disabled:opacity-30 disabled:cursor-not-allowed"
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </motion.button>

        {/* Divider */}
        <div className="w-px h-5 bg-border/50 mx-1" />

        {/* Add Page */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={onAddPage}
          className={cn(
            "w-8 h-8 rounded-full",
            "bg-primary/10 hover:bg-primary/20",
            "flex items-center justify-center",
            "text-primary",
            "transition-colors"
          )}
        >
          <Plus className="w-4 h-4" />
        </motion.button>

        {/* Delete Page */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={onDeletePage}
          disabled={totalPages <= 1}
          className={cn(
            "w-8 h-8 rounded-full",
            "bg-destructive/10 hover:bg-destructive/20",
            "flex items-center justify-center",
            "text-destructive",
            "transition-colors",
            "disabled:opacity-30 disabled:cursor-not-allowed"
          )}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </motion.div>
  );
};

PageControlBar.displayName = 'PageControlBar';
