// ============================================================
// NikNote 4.0 — DNA Profile Selector
// Quick UI to pick handwriting DNA presets
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { DNA_PROFILES, HandwritingDNA, getDefaultDNA } from '@/components/handwriting-dna/HandwritingDNAEngine';
import { useHandwritingDNA } from '@/contexts/HandwritingDNAContext';
import { Pen, Sparkles, RotateCcw } from 'lucide-react';

const PRESET_LABELS: Record<string, { emoji: string; label: string; desc: string }> = {
  neat_student: { emoji: '✨', label: 'Neat Student', desc: 'Clean, consistent, exam-ready' },
  messy_fast: { emoji: '⚡', label: 'Fast Writer', desc: 'Rushed, connected, quick strokes' },
  exam_rush: { emoji: '📝', label: 'Exam Mode', desc: 'Slightly messy, exam pressure' },
  girly_neat: { emoji: '🌸', label: 'Elegant Flow', desc: 'Smooth, flowing, cursive' },
};

export const DNAProfileSelector: React.FC = () => {
  const { dna, updateDNA, applyPreset, resetDNA } = useHandwritingDNA();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <Pen className="w-4 h-4" /> Handwriting DNA
        </h3>
        <button
          onClick={resetDNA}
          className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(DNA_PROFILES).map(([key, profile]) => {
          const meta = PRESET_LABELS[key] || { emoji: '✍️', label: key, desc: '' };
          const isActive = dna.closestFont === profile.closestFont && 
            Math.abs(dna.slant - (profile.slant || 0)) < 2;

          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.97 }}
              onClick={() => applyPreset(key)}
              className={`p-2.5 rounded-xl text-left transition-all ${
                isActive
                  ? 'bg-primary/10 border-2 border-primary/30'
                  : 'bg-muted/30 border border-border/50 hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{meta.emoji}</span>
                <div>
                  <div className="text-xs font-semibold">{meta.label}</div>
                  <div className="text-[10px] text-muted-foreground">{meta.desc}</div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Current DNA stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-muted/30 rounded-lg p-2 text-center">
          <div className="text-[10px] text-muted-foreground">Slant</div>
          <div className="text-xs font-bold">{dna.slant.toFixed(1)}°</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-2 text-center">
          <div className="text-[10px] text-muted-foreground">Pressure</div>
          <div className="text-xs font-bold">{(dna.penPressure * 100).toFixed(0)}%</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-2 text-center">
          <div className="text-[10px] text-muted-foreground">Speed</div>
          <div className="text-xs font-bold">{dna.strokeSpeed.toFixed(1)}x</div>
        </div>
      </div>

      {/* Confidence indicator */}
      {dna.confidence > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${dna.confidence * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">
            {(dna.confidence * 100).toFixed(0)}% match
          </span>
        </div>
      )}
    </div>
  );
};

export default DNAProfileSelector;
