import React, { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

/**
 * Scroll-reveal wrapper (design-system motion tokens).
 * Respects prefers-reduced-motion: renders statically when reduced.
 */
export const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}> = ({ children, delay = 0, y = 12, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y }}
      animate={inView || reduced ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
