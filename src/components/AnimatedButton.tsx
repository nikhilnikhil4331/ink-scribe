import React from 'react';
import { motion } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/button';
import { useHaptics } from '@/hooks/useHaptics';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface AnimatedButtonProps extends ButtonProps {
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection';
  enableSound?: boolean;
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, onClick, hapticType = 'light', enableSound = true, ...props }, ref) => {
    const { triggerHaptic } = useHaptics();
    const { playClick } = useSoundEffects();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      triggerHaptic(hapticType);
      if (enableSound) {
        playClick();
      }
      onClick?.(e);
    };

    return (
      <motion.div
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <Button ref={ref} onClick={handleClick} {...props}>
          {children}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';
