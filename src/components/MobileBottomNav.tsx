import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Palette, Eye, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHaptics } from '@/hooks/useHaptics';

export type MobileTab = 'write' | 'style' | 'preview' | 'ai';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

const tabs: { id: MobileTab; label: string; icon: React.ReactNode; glow?: boolean }[] = [
  { id: 'write', label: 'Write', icon: <Edit3 className="w-5 h-5" /> },
  { id: 'style', label: 'Style', icon: <Palette className="w-5 h-5" /> },
  { id: 'preview', label: 'Preview', icon: <Eye className="w-5 h-5" /> },
  { id: 'ai', label: 'AI', icon: <Sparkles className="w-5 h-5" />, glow: true },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onTabChange }) => {
  const { triggerHaptic } = useHaptics();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-background/95 backdrop-blur-xl border-t border-border/50 px-1 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id || (tab.id === 'style' && false);
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  triggerHaptic('light');
                  onTabChange(tab.id);
                }}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-colors duration-200 relative",
                  isActive ? "text-primary" : "text-muted-foreground",
                  tab.glow && !isActive && "text-amber-500"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-2xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                {tab.glow && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{ 
                      boxShadow: isActive 
                        ? '0 0 12px 2px hsl(var(--primary) / 0.3)' 
                        : '0 0 8px 1px rgba(245, 158, 11, 0.2)' 
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                  />
                )}
                <span className="relative z-10">{tab.icon}</span>
                <span className="relative z-10 text-[10px] font-semibold">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
