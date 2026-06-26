// ============================================================
// NikNote 4.0 — Handwriting DNA Engine v2
// 95-99% handwriting similarity target
// ============================================================

import type { CSSProperties } from 'react';

// ============================================================
// Types
// ============================================================

export interface HandwritingDNA {
  slant: number;
  strokeThickness: number;
  penPressure: number;
  baselineDrift: number;
  wordSpacing: number;
  letterSpacing: number;
  characterSize: number;
  sizeVariation: number;
  strokeSpeed: number;
  imperfectionLevel: number;
  curveSmoothness: number;
  connectionStyle: 'print' | 'cursive' | 'mixed';
  loopSize: number;
  closestFont: string;
  fontModifications: FontModification[];
  confidence: number;
  sampleQuality: 'poor' | 'fair' | 'good' | 'excellent';
}

export interface FontModification {
  property: string;
  value: number | string;
  cssProperty: string;
}

// ============================================================
// Default DNA
// ============================================================

export function getDefaultDNA(): HandwritingDNA {
  return {
    slant: 0,
    strokeThickness: 1.0,
    penPressure: 0.5,
    baselineDrift: 1,
    wordSpacing: 4,
    letterSpacing: 0.5,
    characterSize: 24,
    sizeVariation: 0.1,
    strokeSpeed: 1.0,
    imperfectionLevel: 0.2,
    curveSmoothness: 0.8,
    connectionStyle: 'mixed',
    loopSize: 1.0,
    closestFont: 'caveat',
    fontModifications: [],
    confidence: 0,
    sampleQuality: 'fair',
  };
}

// ============================================================
// Preset DNA Profiles
// ============================================================

export const DNA_PROFILES: Record<string, Partial<HandwritingDNA>> = {
  neat_student: {
    slant: 2,
    strokeThickness: 1.2,
    penPressure: 0.6,
    baselineDrift: 0.5,
    wordSpacing: 4,
    letterSpacing: 0.5,
    characterSize: 22,
    sizeVariation: 0.05,
    strokeSpeed: 1.0,
    imperfectionLevel: 0.1,
    curveSmoothness: 0.9,
    connectionStyle: 'mixed',
    loopSize: 1.0,
    closestFont: 'caveat',
  },
  messy_fast: {
    slant: -5,
    strokeThickness: 1.5,
    penPressure: 0.7,
    baselineDrift: 3,
    wordSpacing: 3,
    letterSpacing: 1.5,
    characterSize: 24,
    sizeVariation: 0.2,
    strokeSpeed: 1.8,
    imperfectionLevel: 0.6,
    curveSmoothness: 0.4,
    connectionStyle: 'cursive',
    loopSize: 1.2,
    closestFont: 'shadows-into-light',
  },
  exam_rush: {
    slant: 8,
    strokeThickness: 1.0,
    penPressure: 0.5,
    baselineDrift: 2,
    wordSpacing: 3,
    letterSpacing: 0,
    characterSize: 20,
    sizeVariation: 0.15,
    strokeSpeed: 2.0,
    imperfectionLevel: 0.4,
    curveSmoothness: 0.5,
    connectionStyle: 'mixed',
    loopSize: 0.8,
    closestFont: 'reenie-beanie',
  },
  girly_neat: {
    slant: 5,
    strokeThickness: 0.8,
    penPressure: 0.4,
    baselineDrift: 0.3,
    wordSpacing: 5,
    letterSpacing: 1,
    characterSize: 26,
    sizeVariation: 0.08,
    strokeSpeed: 0.8,
    imperfectionLevel: 0.15,
    curveSmoothness: 0.95,
    connectionStyle: 'cursive',
    loopSize: 1.3,
    closestFont: 'dancing-script',
  },
};

// ============================================================
// Analyze handwriting — lazy-loads supabase only when needed
// ============================================================

export async function analyzeHandwriting(imageData: string): Promise<HandwritingDNA> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase.functions.invoke('analyze-handwriting', {
      body: { image: imageData },
    });

    if (error) throw error;

    if (data?.dna) {
      return {
        ...getDefaultDNA(),
        ...data.dna,
        confidence: data.confidence || 0.7,
        sampleQuality: data.sampleQuality || 'good',
      };
    }
  } catch (err) {
    console.error('Handwriting analysis error:', err);
  }

  return getDefaultDNA();
}

// ============================================================
// DNA → CSS Conversion
// ============================================================

export function dnaToCSS(dna: HandwritingDNA): CSSProperties {
  const styles: CSSProperties = {};

  if (dna.slant !== 0) {
    styles.transform = `skewX(${-dna.slant * 0.5}deg)`;
  }
  styles.fontWeight = Math.round(300 + dna.penPressure * 400);
  styles.fontSize = `${dna.characterSize}px`;
  styles.wordSpacing = `${dna.wordSpacing}px`;
  styles.letterSpacing = `${dna.letterSpacing}px`;
  styles.opacity = 0.85 + dna.penPressure * 0.15;

  return styles;
}

// ============================================================
// Per-line CSS variation
// ============================================================

export function generateLineVariation(
  dna: HandwritingDNA,
  lineIndex: number
): CSSProperties {
  const variation: CSSProperties = {};
  const seed = (n: number) => Math.sin(lineIndex * n * 7.3) * 0.5 + 0.5;

  const slantVar = dna.slant + (seed(1) - 0.5) * dna.imperfectionLevel * 6;
  if (Math.abs(slantVar) > 0.5) {
    variation.transform = `skewX(${-slantVar * 0.5}deg)`;
  }

  const sizeVar = 1 + (seed(2) - 0.5) * dna.sizeVariation;
  variation.fontSize = `${Math.round(dna.characterSize * sizeVar)}px`;

  const pressureVar = dna.penPressure + (seed(3) - 0.5) * dna.imperfectionLevel * 0.3;
  variation.fontWeight = Math.round(300 + Math.max(0.1, pressureVar) * 400);
  variation.opacity = 0.85 + Math.max(0.1, pressureVar) * 0.15;

  const drift = Math.sin(lineIndex * 3.7) * dna.baselineDrift;
  variation.marginTop = `${drift}px`;

  const letterVar = dna.letterSpacing + (seed(5) - 0.5) * dna.imperfectionLevel * 2;
  variation.letterSpacing = `${letterVar}px`;

  return variation;
}

// ============================================================
// Per-word CSS variation
// ============================================================

export function generateWordVariation(
  dna: HandwritingDNA,
  lineIndex: number,
  wordIndex: number
): CSSProperties {
  const variation: CSSProperties = {};
  const seed = (n: number) => Math.sin((lineIndex * 100 + wordIndex) * n * 5.3) * 0.5 + 0.5;

  const yJitter = Math.sin(wordIndex * 3.7 + lineIndex) * dna.baselineDrift * 0.3;
  variation.position = 'relative';
  variation.top = `${yJitter}px`;

  const letterVar = dna.letterSpacing + (seed(1) - 0.5) * dna.imperfectionLevel * 1.5;
  variation.letterSpacing = `${Math.max(0, letterVar)}px`;

  return variation;
}

// ============================================================
// Similarity calculation
// ============================================================

export function calculateSimilarity(dna1: HandwritingDNA, dna2: HandwritingDNA): number {
  const weights = {
    slant: 15, strokeThickness: 12, penPressure: 15, baselineDrift: 10,
    wordSpacing: 10, letterSpacing: 8, characterSize: 12, sizeVariation: 5,
    imperfectionLevel: 8, connectionStyle: 5,
  };

  let totalScore = 0;
  let totalWeight = 0;

  const numericFields: (keyof typeof weights)[] = [
    'slant', 'strokeThickness', 'penPressure', 'baselineDrift',
    'wordSpacing', 'letterSpacing', 'characterSize', 'sizeVariation', 'imperfectionLevel',
  ];

  const maxDiffs: Record<string, number> = {
    slant: 30, strokeThickness: 2.5, penPressure: 0.9, baselineDrift: 5,
    wordSpacing: 10, letterSpacing: 5, characterSize: 24, sizeVariation: 0.3, imperfectionLevel: 1,
  };

  for (const field of numericFields) {
    if (field in weights) {
      const v1 = Number(dna1[field]) || 0;
      const v2 = Number(dna2[field]) || 0;
      const maxDiff = maxDiffs[field] || 1;
      const diff = Math.abs(v1 - v2) / maxDiff;
      totalScore += Math.max(0, 1 - diff) * weights[field];
      totalWeight += weights[field];
    }
  }

  totalScore += dna1.connectionStyle === dna2.connectionStyle
    ? weights.connectionStyle
    : weights.connectionStyle * 0.3;
  totalWeight += weights.connectionStyle;

  return Math.round((totalScore / totalWeight) * 100);
}
