// ============================================================
// NikNote 4.0 — Mobile Bottom Navigation (Notion-style Pro)
// Clean, minimal, touch-friendly — like Notion mobile app
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { PenLine, Palette, Sparkles, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MobileTab = 'write' | 'style' | 'preview' | 'ai';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  onShare?: () => void;
  onScan?: () => void;
  onExport?: () => void;
  onAIWorkspace?: () => void;
  isExporting?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ 
  activeTab, onTabChange
}) => {
  const tabs: { id: MobileTab; label: string; icon: React.ReactNode; }[] = [
    { id: 'write', label: 'Write', icon: <PenLine className="w-[18px] h-[18px]" /> },
    { id: 'style', label: 'Style', icon: <Palette className="w-[18px] h-[18px]" /> },
    { id: 'ai', label: 'AI', icon: <Sparkles className="w-[18px] h-[18px]" /> },
    { id: 'preview', label: 'More', icon: <MoreHorizontal className="w-[18px] h-[18px]" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-white/90 backdrop-blur-xl border-t border-gray-200/60">
        <div className="flex items-center justify-around h-[52px] px-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-xl transition-all duration-150 relative active:scale-95",
                  isActive ? "text-indigo-600" : "text-gray-400"
                )}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileTabIndicator"
                    className="absolute inset-0 bg-indigo-50 rounded-xl"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{tab.icon}</span>
                <span className={cn(
                  "relative z-10 text-[10px] font-semibold tracking-wide",
                  isActive ? "text-indigo-600" : "text-gray-400"
                )}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* Safe area for iPhone notch */}
        <div className="h-[env(safe-area-inset-bottom,0px)]" />
      </div>
    </div>
  );
};
