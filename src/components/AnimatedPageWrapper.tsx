import React from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

interface AnimatedPageWrapperProps {
  children: React.ReactNode;
  pageKey: string | number;
  direction: 'left' | 'right' | 'none';
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export const AnimatedPageWrapper: React.FC<AnimatedPageWrapperProps> = ({
  children,
  pageKey,
  direction,
  onSwipeLeft,
  onSwipeRight,
}) => {
  const variants = {
    enter: (dir: string) => ({
      x: dir === 'right' ? 300 : dir === 'left' ? -300 : 0,
      opacity: 0,
      scale: 0.95,
      rotateY: dir === 'right' ? 15 : dir === 'left' ? -15 : 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (dir: string) => ({
      x: dir === 'right' ? -300 : dir === 'left' ? 300 : 0,
      opacity: 0,
      scale: 0.95,
      rotateY: dir === 'right' ? -15 : dir === 'left' ? 15 : 0,
    }),
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const velocity = 500;

    if (info.offset.x > threshold || info.velocity.x > velocity) {
      onSwipeRight?.();
    } else if (info.offset.x < -threshold || info.velocity.x < -velocity) {
      onSwipeLeft?.();
    }
  };

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={pageKey}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          mass: 0.8,
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ 
          perspective: 1000,
          transformStyle: 'preserve-3d',
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
