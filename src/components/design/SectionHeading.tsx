import React from 'react';
import { Reveal } from './Reveal';
import { cn } from '@/lib/utils';

/**
 * Consistent section heading — eyebrow + display title + supporting copy.
 */
export const SectionHeading: React.FC<{
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}> = ({ eyebrow, title, subtitle, align = 'center', className }) => (
  <Reveal className={cn('max-w-2xl mb-10 md:mb-14', align === 'center' && 'mx-auto text-center', className)}>
    {eyebrow && (
      <p className="text-xs font-semibold tracking-[0.14em] uppercase text-primary mb-3">{eyebrow}</p>
    )}
    <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.12] font-bold text-foreground">
      {title}
    </h2>
    {subtitle && (
      <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">{subtitle}</p>
    )}
  </Reveal>
);
