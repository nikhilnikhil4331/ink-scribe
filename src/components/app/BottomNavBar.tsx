import React from 'react';
import { motion } from 'framer-motion';
import { PenLine, Palette, Eye, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

type AppStep = 'content' | 'style' | 'preview';

interface BottomNavBarProps {
  currentStep: AppStep;
  onStepChange: (step: AppStep) => void;
}

const NAV_ITEMS: { key: AppStep; icon: React.ReactNode; label: string }[] = [
  { key: 'content', icon: <PenLine className="w-5 h-5" />, label: 'Text' },
  { key: 'style', icon: <Palette className="w-5 h-5" />, label: 'Style' },
  { key: 'preview', icon: <Eye className="w-5 h-5" />, label: 'Preview' },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentStep, onStepChange }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-pb">
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = currentStep === item.key;
          return (
            <motion.button
              key={item.key}
              whileTap={{ scale: 0.92 }}
              onClick={() => onStepChange(item.key)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </motion.button>
          );
        })}

        {/* Profile/Me Tab */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate('/account')}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-muted-foreground"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Me</span>
        </motion.button>
      </div>
    </div>
  );
};
