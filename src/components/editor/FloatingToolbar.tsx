import React from 'react';
import { motion } from 'framer-motion';
import { PenLine, Mic, MicOff, Palette, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIWritingAssistant } from '@/components/AIWritingAssistant';

interface FloatingToolbarProps {
  isListening: boolean;
  onToggleDictation: () => void;
  onOpenPalette: () => void;
  onOpenSettings: () => void;
  dictationSupported: boolean;
  premiumLocked: boolean;
  onPremiumTap: () => void;
  currentText: string;
  onInsertText: (text: string) => void;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  isListening,
  onToggleDictation,
  onOpenPalette,
  onOpenSettings,
  dictationSupported,
  premiumLocked,
  onPremiumTap,
  currentText,
  onInsertText,
}) => {
  const tools = [
    {
      id: 'write',
      icon: <PenLine className="w-5 h-5" />,
      onClick: () => {},
      active: true,
      label: 'Write',
    },
    {
      id: 'mic',
      icon: isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />,
      onClick: () => {
        if (premiumLocked) return onPremiumTap();
        if (dictationSupported) onToggleDictation();
      },
      active: isListening,
      label: 'Voice',
    },
    {
      id: 'palette',
      icon: <Palette className="w-5 h-5" />,
      onClick: onOpenPalette,
      label: 'Colors',
    },
    {
      id: 'settings',
      icon: <Settings2 className="w-5 h-5" />,
      onClick: onOpenSettings,
      label: 'Settings',
    },
  ];

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex"
    >
      <div className={cn(
        "flex flex-col items-center gap-3",
        "p-2 rounded-[28px]",
        "bg-card/90 backdrop-blur-2xl",
        "border border-border/40",
        "shadow-soft-lg"
      )}>
        {tools.map((tool, index) => (
          <motion.button
            key={tool.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: 0.25 + index * 0.05, 
              type: 'spring', 
              stiffness: 400, 
              damping: 20 
            }}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            onClick={tool.onClick}
            className={cn(
              "w-12 h-12 rounded-xl",
              "flex items-center justify-center",
              "transition-all duration-200",
              tool.active
                ? "bg-primary text-primary-foreground shadow-primary-soft"
                : "bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground"
            )}
            title={tool.label}
          >
            {tool.icon}
          </motion.button>
        ))}

        {/* AI Spark Button */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.45, type: 'spring', stiffness: 400, damping: 20 }}
        >
          <AIWritingAssistant
            currentText={currentText}
            onInsertText={onInsertText}
            locked={premiumLocked}
            onLockedTap={onPremiumTap}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

FloatingToolbar.displayName = 'FloatingToolbar';
