import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Soft-depth icon tile (3D-icons inspired — built from CSS, no heavy libs).
 * Layered radial highlight + inner top light + soft shadow = tactile depth
 * while staying lightweight and consistent across the product.
 */
export const FeatureIcon: React.FC<{
  icon: React.ReactNode;
  tone?: 'primary' | 'ink' | 'paper' | 'warm';
  size?: 'md' | 'lg';
  className?: string;
}> = ({ icon, tone = 'primary', size = 'md', className }) => {
  const tones: Record<string, string> = {
    primary: 'bg-primary/10 text-primary border-primary/15',
    ink: 'bg-slate-900/5 text-slate-700 border-slate-900/10',
    paper: 'bg-[hsl(var(--paper))] text-[hsl(var(--ink-brown))] border-[hsl(var(--line-color))]',
    warm: 'bg-amber-500/10 text-amber-600 border-amber-500/15',
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative inline-flex items-center justify-center rounded-2xl border',
        size === 'md' ? 'w-12 h-12' : 'w-16 h-16',
        tones[tone],
        className,
      )}
      style={{
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -2px 6px rgba(15,23,42,0.06), 0 6px 16px rgba(15,23,42,0.08)',
      }}
    >
      {icon}
    </div>
  );
};
