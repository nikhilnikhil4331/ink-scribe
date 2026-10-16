import React from 'react';
import {
  PenLine, Palette, PencilRuler, Brain, LayoutTemplate, Flame, FolderOpen, Check, Wallet,
} from 'lucide-react';
import { Reveal } from '@/components/design/Reveal';
import { SectionHeading } from '@/components/design/SectionHeading';
import { FeatureIcon } from '@/components/design/FeatureIcon';

/**
 * Feature story — every section maps to a REAL NikNote capability
 * (no invented stats, no fake features). Scrolltide-inspired storytelling:
 * meaningful reveals that present content instead of hiding it behind motion.
 */
const featureStories = [
  {
    icon: PenLine,
    tone: 'primary' as const,
    eyebrow: 'Note writing',
    title: 'A block editor that keeps up with your thoughts',
    body: 'Type, paste or dictate — NikNote organizes everything into clean blocks. Slash commands, toggles, tables, code, equations and 25+ block types, with smart suggestions while you write.',
    points: ['25+ block types', 'Smart editor suggestions', 'Paste multi-line notes'],
  },
  {
    icon: Palette,
    tone: 'paper' as const,
    eyebrow: 'Handwriting personalization',
    title: 'Your handwriting, your rules',
    body: 'Convert typed text into realistic handwritten pages with 16+ handwriting styles, ink colors and paper types. The Handwriting DNA Scanner studies your style and reproduces it.',
    points: ['16+ handwriting styles', 'Handwriting DNA Scanner', 'Ink colors & paper styles'],
  },
  {
    icon: PencilRuler,
    tone: 'warm' as const,
    eyebrow: 'Drawing & annotation',
    title: 'Sketch, diagram, annotate — right on the page',
    body: 'Draw diagrams, mark up your notes and import visuals. From physics figures to mind maps, your pages stay as expressive as a real notebook.',
    points: ['Freehand drawing tools', 'Diagram import', 'Per-block styling'],
  },
  {
    icon: Brain,
    tone: 'primary' as const,
    eyebrow: 'AI learning tools',
    title: 'An AI teacher that speaks your language',
    body: 'Ask doubts in Hindi or English, generate quizzes, flashcards and mind maps, or snap a problem to the AI Solver. Local knowledge base answers even without internet.',
    points: ['AI Teacher (Hindi + English)', 'Quiz & flashcard generator', 'Works offline-first'],
  },
  {
    icon: LayoutTemplate,
    tone: 'ink' as const,
    eyebrow: 'Productivity',
    title: 'Templates, workflows and print-ready exports',
    body: 'Jump-start notes with ready templates and study workflows. Export clean multi-page PDFs at 300 DPI, share to WhatsApp, and find anything through the command palette.',
    points: ['Quick templates & workflows', 'Multi-page PDF export', 'Command palette'],
  },
  {
    icon: Flame,
    tone: 'warm' as const,
    eyebrow: 'Daily habits',
    title: 'Build a study streak that actually sticks',
    body: 'Track daily study streaks, unlock rewards as you go, and earn achievements for real work done — not for clicking buttons. Small wins, every single day.',
    points: ['Study streaks & rewards', 'Achievement badges', 'Real progress tracking'],
  },
  {
    icon: FolderOpen,
    tone: 'primary' as const,
    eyebrow: 'Personal workspace',
    title: 'Every subject, every notebook, one place',
    body: 'Organize pages into notebooks by subject, colour-code them your way, and pick up exactly where you left off — on your phone or your laptop.',
    points: ['Notebooks & pages', 'Subject organisation', 'Sync-ready workspace'],
  },
  {
    icon: Wallet,
    tone: 'warm' as const,
    eyebrow: 'Money tracking',
    title: 'Pocket money, expenses and savings — sorted',
    body: 'A calm little finance tracker for student life. Log income and expenses, see where money goes each month, and keep your savings on track.',
    points: ['Income & expense log', 'Monthly breakdown', 'Category insights'],
  },
];

export const FeatureShowcase: React.FC = () => (
  <section id="features" className="relative py-20 md:py-28">
    <div className="container mx-auto px-4 lg:px-6">
      <SectionHeading
        eyebrow="Everything in one notebook"
        title="Built for how Indian students actually study"
        subtitle="From first draft to final revision — writing, handwriting, drawing, AI and daily habits work together in one calm, focused workspace."
      />

      <div className="space-y-16 md:space-y-24 max-w-5xl mx-auto">
        {featureStories.map((story, i) => (
          <Reveal key={story.eyebrow}>
            <div className={`flex flex-col md:flex-row items-start gap-8 md:gap-12 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              <div className="flex-shrink-0">
                <FeatureIcon icon={<story.icon className="w-6 h-6" />} tone={story.tone} size="lg" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold tracking-[0.14em] uppercase text-primary mb-2">
                  {story.eyebrow}
                </p>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-snug">
                  {story.title}
                </h3>
                <p className="mt-3 text-base sm:text-lg text-muted-foreground leading-relaxed">
                  {story.body}
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {story.points.map((point) => (
                    <li
                      key={point}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(var(--paper))] border border-[hsl(var(--line-color))] text-xs font-medium text-foreground/80"
                    >
                      <Check className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
