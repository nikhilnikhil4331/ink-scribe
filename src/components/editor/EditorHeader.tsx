import React from 'react';
import { motion } from 'framer-motion';
import { Crown, LogIn, Undo2, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/hooks/usePremium';
import { useNavigate } from 'react-router-dom';
import { HeaderProfileButton } from '@/components/HeaderProfileButton';
import { cn } from '@/lib/utils';

interface EditorHeaderProps {
  onExport: () => void;
  onUndo: () => void;
  canUndo: boolean;
  isExporting: boolean;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  onExport,
  onUndo,
  canUndo,
  isExporting,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = usePremium();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-4 left-4 right-4 z-50"
    >
      <div className="max-w-4xl mx-auto">
        <div className={cn(
          "flex items-center justify-between",
          "px-4 py-2.5 rounded-[24px]",
          "bg-card/90 backdrop-blur-2xl",
          "border border-border/40",
          "shadow-soft-lg"
        )}>
          {/* Left: Profile + Premium */}
          <div className="flex items-center gap-2">
            {user ? (
              <HeaderProfileButton />
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className={cn(
                  "w-10 h-10 rounded-xl",
                  "bg-secondary/80 hover:bg-secondary",
                  "flex items-center justify-center",
                  "transition-colors"
                )}
              >
                <LogIn className="w-4.5 h-4.5 text-muted-foreground" />
              </motion.button>
            )}

            {/* Premium Crown */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/payment')}
              className={cn(
                "w-10 h-10 rounded-xl",
                isPremium 
                  ? "bg-gradient-to-br from-amber-400/20 to-orange-500/20" 
                  : "bg-secondary/80 hover:bg-secondary",
                "flex items-center justify-center",
                "transition-all"
              )}
            >
              <Crown className={cn(
                "w-4.5 h-4.5",
                isPremium ? "text-amber-500" : "text-muted-foreground"
              )} />
            </motion.button>
          </div>

          {/* Center: Export Button (Primary Gradient) */}
          <motion.div whileTap={{ scale: 0.96 }}>
            <Button
              onClick={onExport}
              disabled={isExporting}
              className={cn(
                "rounded-full px-6 h-10",
                "bg-gradient-to-r from-primary via-primary to-accent",
                "hover:opacity-90",
                "shadow-primary-soft",
                "text-primary-foreground font-semibold text-sm",
                "gap-2"
              )}
            >
              <FileDown className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </motion.div>

          {/* Right: Undo */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onUndo}
            disabled={!canUndo}
            className={cn(
              "w-10 h-10 rounded-xl",
              "bg-secondary/80 hover:bg-secondary",
              "flex items-center justify-center",
              "transition-colors",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            <Undo2 className="w-4.5 h-4.5 text-muted-foreground" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

EditorHeader.displayName = 'EditorHeader';
