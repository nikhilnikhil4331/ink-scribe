import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles, PenLine, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onStartWriting: () => void;
  onPreviewNotes: () => void;
}

/**
 * Hero — NikNote's identity: paper + ink + one indigo accent.
 * Real editor preview instead of fake stats; staged entrance, no infinite
 * floating decoration (design brief: every animation must have a purpose).
 */
export const HeroSection: React.FC<HeroSectionProps> = ({ onStartWriting, onPreviewNotes }) => {
  const reduced = useReducedMotion();

  const staged = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
  });

  return (
    <section className="relative overflow-hidden">
      {/* Paper-and-ink ambient background: ruled-line motif + single accent wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/[0.04]" />
      <div
        className="absolute inset-x-0 top-0 h-[520px] paper-lines opacity-[0.35] pointer-events-none"
        style={{ maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' }}
      />

      <div className="relative z-10 container mx-auto px-4 lg:px-6 pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badges — factual only */}
          <motion.div {...staged(0)} className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/15 text-xs font-semibold text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Study Notes
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(var(--paper))] border border-[hsl(var(--line-color))] text-xs font-semibold text-[hsl(var(--ink-brown))]">
              🇮🇳 Made for Indian Students
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...staged(0.08)}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-foreground"
          >
            Notes that look like
            <span className="text-accent-ink"> you wrote them</span>
          </motion.h1>

          {/* Sub — real capabilities only */}
          <motion.p {...staged(0.16)} className="mt-5 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Type your notes — NikNote turns them into beautiful handwritten pages, teaches concepts in
            Hindi &amp; English, and generates quizzes, flashcards and mind maps. Padhai ko asaan banana hai — AI se!
          </motion.p>

          {/* CTAs — primary + secondary, full state feedback */}
          <motion.div {...staged(0.24)} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" variant="premium" onClick={onStartWriting} className="px-8 text-base">
              Start writing — free
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={onPreviewNotes} className="px-8 text-base">
              See how it works
            </Button>
          </motion.div>

          {/* Trust row — factual */}
          <motion.p {...staged(0.3)} className="mt-5 text-sm text-muted-foreground">
            Free to start · Works on phone &amp; laptop · No credit card needed
          </motion.p>
        </div>

        {/* Realistic editor preview — stylized from the actual NikNote editor */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.38 }}
          className="mt-14 md:mt-20 max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border border-[hsl(var(--line-color))]/80 bg-white shadow-overlay overflow-hidden">
            {/* Editor chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[hsl(var(--line-color))]/70 bg-muted/30">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
              </div>
              <div className="flex-1 text-center text-xs font-medium text-muted-foreground truncate px-2">
                Physics — Chapter 2: Laws of Motion
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <PenLine className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <span className="hidden sm:inline font-handwriting-2 text-sm">Caveat · Ink Blue</span>
              </div>
            </div>

            {/* Paper page with handwriting preview */}
            <div className="relative paper-lines px-6 sm:px-10 py-8 sm:py-10 min-h-[280px] sm:min-h-[340px]">
              <div className="absolute top-6 bottom-6 left-3 sm:left-5 w-px bg-red-300/60" aria-hidden="true" />
              <h3 className="font-handwriting-2 text-2xl sm:text-3xl text-[hsl(var(--ink-blue))] mb-3">
                Newton's Laws of Motion
              </h3>
              <div className="space-y-2 text-[hsl(var(--ink-black))]">
                <p className="font-handwriting-2 text-lg sm:text-xl leading-[28px]">
                  <span className="font-semibold">1st Law (Inertia):</span> Body apni state of rest ya uniform motion
                  me tab tak rahegi jab tak external force na lagayein.
                </p>
                <p className="font-handwriting-2 text-lg sm:text-xl leading-[28px]">
                  <span className="font-semibold">2nd Law:</span> F = ma — force equals mass times acceleration.
                </p>
                <p className="font-handwriting-2 text-lg sm:text-xl leading-[28px] text-[hsl(var(--ink-blue))]">
                  ✍️ Tip: Har action ka equal &amp; opposite reaction hota hai — 3rd Law!
                </p>
              </div>

              {/* Inline AI chip — mirrors the real @ai-teacher mention */}
              <div className="mt-6 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary shadow-soft">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                @ai-teacher — Explain this in Hindi
              </div>
            </div>

            {/* Status strip — mirrors real export/save affordances */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-[hsl(var(--line-color))]/70 bg-muted/30 text-xs text-muted-foreground">
              <span>All changes saved</span>
              <span className="inline-flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                Export PDF · 300 DPI
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
