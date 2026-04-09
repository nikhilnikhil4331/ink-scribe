import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User as UserType } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  user: UserType | null;
  isPremium: boolean;
  wordCount: number;
  currentPage: number;
  totalPages: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  user, isPremium, wordCount, currentPage, totalPages,
}) => {
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-12 flex items-center justify-between px-3 border-b border-border/30 bg-background/95 backdrop-blur-lg z-40 flex-shrink-0"
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <span className="text-base font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          NikNote
        </span>
        {isPremium && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">PRO</span>
        )}
      </div>

      {/* Center: Page indicator */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{currentPage}/{totalPages} pages</span>
        <span className="w-px h-3 bg-border" />
        <span>{wordCount} words</span>
      </div>

      {/* Right: Streak + Actions */}
      <div className="flex items-center gap-2">
        {/* Streak placeholder */}
        <div className="flex items-center gap-0.5 text-orange-500">
          <Flame className="w-4 h-4" />
          <span className="text-xs font-bold">0</span>
        </div>

        {!isPremium && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/payment')}
            className="p-1.5 rounded-lg bg-amber-50 text-amber-600"
          >
            <Crown className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </div>
    </motion.header>
  );
};
