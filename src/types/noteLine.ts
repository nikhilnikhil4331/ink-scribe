export type LineInkColor = 'black' | 'blue' | 'red' | 'green';

export interface NoteLine {
  id: string;
  text: string;
  color: LineInkColor;
  timestamp: number;
}

export interface LineHistory {
  past: NoteLine[];
  future: NoteLine[];
}

export interface RealPenVariation {
  opacity: number;
  thickness: number;
  hueShift: number;
}

export const LINE_INK_COLORS: { value: LineInkColor; label: string; hex: string; hsl: string }[] = [
  { value: 'black', label: 'Black', hex: '#1a1a2e', hsl: '220 20% 12%' },
  { value: 'blue', label: 'Blue', hex: '#1565c0', hsl: '215 85% 40%' },
  { value: 'red', label: 'Red', hex: '#d32f2f', hsl: '0 72% 50%' },
  { value: 'green', label: 'Green', hex: '#2e7d32', hsl: '145 65% 38%' },
];

export const generateLineId = (): string => {
  return `line-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const getDefaultColorForLine = (lineIndex: number): LineInkColor => {
  // First line black, second line blue, then alternate
  if (lineIndex === 0) return 'black';
  if (lineIndex === 1) return 'blue';
  return lineIndex % 2 === 0 ? 'black' : 'blue';
};

export const generateRealPenVariation = (lineIndex: number, realPenMode: boolean): RealPenVariation => {
  if (!realPenMode) {
    return { opacity: 1, thickness: 1, hueShift: 0 };
  }
  
  // Generate deterministic but natural-looking variations based on line index
  const seed = lineIndex * 7919; // Prime number for pseudo-randomness
  const random1 = Math.sin(seed) * 0.5 + 0.5;
  const random2 = Math.sin(seed + 1) * 0.5 + 0.5;
  const random3 = Math.sin(seed + 2) * 0.5 + 0.5;
  
  return {
    opacity: 0.85 + random1 * 0.15, // 0.85 to 1.0
    thickness: 0.95 + random2 * 0.1, // 0.95 to 1.05
    hueShift: (random3 - 0.5) * 10, // -5 to +5 degrees
  };
};
