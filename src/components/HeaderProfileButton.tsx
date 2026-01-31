import React from 'react';
import { motion } from 'framer-motion';
import { User, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePremium } from '@/hooks/usePremium';

/**
 * Simple header profile button that navigates directly to /account.
 * No dropdowns, no overlays - just clean navigation.
 */
export const HeaderProfileButton: React.FC = () => {
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const navigate = useNavigate();

  if (!user) return null;

  const displayName = user?.user_metadata?.full_name || 
    user?.email?.split('@')[0] || 
    'User';

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate('/account')}
      className="flex items-center gap-2 h-10 px-3 rounded-2xl bg-secondary/80 hover:bg-secondary border border-border/50 transition-all duration-200"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-sm">
        <User className="w-4 h-4 text-primary-foreground" />
      </div>
      <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
        {displayName}
      </span>
      {isPremium && <Crown className="w-4 h-4 text-accent" />}
    </motion.button>
  );
};
