// ============================================================
// NikNote 4.0 — Handwriting DNA Engine v2
// 95-99% handwriting similarity target
// Analyzes: character shapes, stroke thickness, pressure,
// slant, baseline drift, word/letter spacing, size variation
// ============================================================

export interface HandwritingDNA {
  // Core parameters
  slant: number;              // -15 to 15 degrees
  strokeThickness: number;    // 0.5 to 3.0
  penPressure: number;        // 0.1 to 1.0
  baselineDrift: number;      // 0 to 5 pixels
  wordSpacing: number;        // 2 to 12 pixels
  letterSpacing: number;      // 0 to 5 pixels
  characterSize: number;      // 16 to 40 pixels
  sizeVariation: number;      // 0 to 0.3 (coefficient)
  
  // Advanced parameters
  strokeSpeed: number;        // 0.5 to 2.0
  imperfectionLevel: number;  // 0 to 1.0
  curveSmoothness: number;    // 0 to 1.0
  connectionStyle: 'print' | 'cursive' | 'mixed';
  loopSize: number;           // 0.5 to 1.5
  
  // Font mapping
  closestFont: string;        // Base font to modify
  fontModifications: FontModification[];
  
  // Metadata
  confidence: number;         // 0 to 1.0 analysis confidence
  sampleQuality: 'poor' | 'fair' | 'good' | 'excellent';
}

export interface FontModification {
  property: string;
  value: number | string;
  cssProperty: string;
}

// Default DNA profiles
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

/**
 * Analyze handwriting from image
 * Uses Supabase edge function with GPT-4o Vision
 */
export async function analyzeHandwriting(imageData: string): Promise<HandwritingDNA> {
  try {
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

  // Fallback: return default DNA
  return getDefaultDNA();
}

// Import supabase
import { supabase } from '@/integrations/supabase/client';

/**
 * Get default DNA values
 */
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

/**
 * Apply Handwriting DNA to CSS styles
 * This is how we make generated text look like the student's handwriting
 */
export function dnaToCSS(dna: HandwritingDNA): React.CSSProperties {
  const styles: React.CSSProperties = {};

  // Slant — CSS skewX
  if (dna.slant !== 0) {
    styles.transform = `skewX(${-dna.slant * 0.5}deg)`;
  }

  // Stroke thickness — font-weight
  styles.fontWeight = Math.round(300 + dna.penPressure * 400);

  // Character size with variation
  styles.fontSize = `${dna.characterSize}px`;

  // Word spacing
  styles.wordSpacing = `${dna.wordSpacing}px`;

  // Letter spacing
  styles.letterSpacing = `${dna.letterSpacing}px`;

  // Baseline drift — small vertical offset per character
  // (Applied via JS in HandwritingLine component)

  // Pressure variation — opacity
  styles.opacity = 0.85 + dna.penPressure * 0.15;

  // Stroke speed → affects letter spacing variation
  // (Applied per-word in rendering)

  return styles;
}

/**
 * Generate per-line CSS with DNA-based variation
 * Each line gets slightly different properties for natural look
 */
export function generateLineVariation(
  dna: HandwritingDNA,
  lineIndex: number
): React.CSSProperties {
  const variation: React.CSSProperties = {};

  // Seed-based pseudo-random using lineIndex
  const seed = (n: number) => Math.sin(lineIndex * n * 7.3) * 0.5 + 0.5;

  // Slant variation
  const slantVar = dna.slant + (seed(1) - 0.5) * dna.imperfectionLevel * 6;
  if (Math.abs(slantVar) > 0.5) {
    variation.transform = `skewX(${-slantVar * 0.5}deg)`;
  }

  // Size variation per line
  const sizeVar = 1 + (seed(2) - 0.5) * dna.sizeVariation;
  variation.fontSize = `${Math.round(dna.characterSize * sizeVar)}px`;

  // Pressure variation
  const pressureVar = dna.penPressure + (seed(3) - 0.5) * dna.imperfectionLevel * 0.3;
  variation.fontWeight = Math.round(300 + Math.max(0.1, pressureVar) * 400);
  variation.opacity = 0.85 + Math.max(0.1, pressureVar) * 0.15;

  // Baseline drift
  const drift = Math.sin(lineIndex * 3.7) * dna.baselineDrift;
  variation.marginTop = `${drift}px`;

  // Letter spacing variation
  const letterVar = dna.letterSpacing + (seed(5) - 0.5) * dna.imperfectionLevel * 2;
  variation.letterSpacing = `${letterVar}px`;

  return variation;
}

/**
 * Generate per-word variation for ultra-realistic output
 */
export function generateWordVariation(
  dna: HandwritingDNA,
  lineIndex: number,
  wordIndex: number
): React.CSSProperties {
  const variation: React.CSSProperties = {};

  const seed = (n: number) => Math.sin((lineIndex * 100 + wordIndex) * n * 5.3) * 0.5 + 0.5;

  // Vertical micro-positioning (baseline jitter)
  const yJitter = Math.sin(wordIndex * 3.7 + lineIndex) * dna.baselineDrift * 0.3;
  variation.position = 'relative';
  variation.top = `${yJitter}px`;

  // Letter spacing per word
  const letterVar = dna.letterSpacing + (seed(1) - 0.5) * dna.imperfectionLevel * 1.5;
  variation.letterSpacing = `${Math.max(0, letterVar)}px`;

  return variation;
}

/**
 * Calculate similarity score between two DNA profiles
 * Returns 0-100 similarity percentage
 */
export function calculateSimilarity(dna1: HandwritingDNA, dna2: HandwritingDNA): number {
  const weights = {
    slant: 15,
    strokeThickness: 12,
    penPressure: 15,
    baselineDrift: 10,
    wordSpacing: 10,
    letterSpacing: 8,
    characterSize: 12,
    sizeVariation: 5,
    imperfectionLevel: 8,
    connectionStyle: 5,
  };

  let totalScore = 0;
  let totalWeight = 0;

  // Numerical comparisons
  const numericFields: (keyof typeof weights)[] = [
    'slant', 'strokeThickness', 'penPressure', 'baselineDrift',
    'wordSpacing', 'letterSpacing', 'characterSize', 'sizeVariation', 'imperfectionLevel',
  ];

  for (const field of numericFields) {
    if (field in weights) {
      const v1 = Number(dna1[field]) || 0;
      const v2 = Number(dna2[field]) || 0;
      const maxDiff = { slant: 30, strokeThickness: 2.5, penPressure: 0.9, baselineDrift: 5, wordSpacing: 10, letterSpacing: 5, characterSize: 24, sizeVariation: 0.3, imperfectionLevel: 1 }[field] || 1;
      const diff = Math.abs(v1 - v2) / maxDiff;
      const similarity = Math.max(0, 1 - diff);
      totalScore += similarity * weights[field];
      totalWeight += weights[field];
    }
  }

  // Connection style comparison
  if (dna1.connectionStyle === dna2.connectionStyle) {
    totalScore += weights.connectionStyle;
  } else {
    totalScore += weights.connectionStyle * 0.3;
  }
  totalWeight += weights.connectionStyle;

  return Math.round((totalScore / totalWeight) * 100);
}
