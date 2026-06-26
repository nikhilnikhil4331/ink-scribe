// ============================================================
// NikNote 4.0 — Handwriting DNA Context
// Provides DNA state across the app so all components can
// read and apply the same handwriting profile
// ============================================================

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { CSSProperties } from 'react';
import {
  HandwritingDNA,
  DNA_PROFILES,
  getDefaultDNA,
  analyzeHandwriting,
  dnaToCSS,
  generateLineVariation,
  generateWordVariation,
  calculateSimilarity,
} from '@/components/handwriting-dna/HandwritingDNAEngine';

interface HandwritingDNAContextType {
  // Current DNA profile
  dna: HandwritingDNA;
  // Update specific DNA parameters
  updateDNA: (partial: Partial<HandwritingDNA>) => void;
  // Set entire DNA profile
  setDNA: (dna: HandwritingDNA) => void;
  // Apply a preset profile
  applyPreset: (presetName: string) => void;
  // Analyze from image
  analyzeFromImage: (imageData: string) => Promise<HandwritingDNA>;
  // Is analyzing
  isAnalyzing: boolean;
  // Analysis confidence
  confidence: number;
  // DNA-powered CSS for a line
  getLineCSS: (lineIndex: number) => CSSProperties;
  // DNA-powered CSS for a word
  getWordCSS: (lineIndex: number, wordIndex: number) => CSSProperties;
  // Base DNA CSS
  getBaseCSS: () => CSSProperties;
  // Calculate similarity with another DNA
  getSimilarity: (otherDNA: HandwritingDNA) => number;
  // Reset to defaults
  resetDNA: () => void;
}

const HandwritingDNAContext = createContext<HandwritingDNAContextType | null>(null);

export function HandwritingDNAProvider({ children }: { children: React.ReactNode }) {
  const [dna, setDNAState] = useState<HandwritingDNA>(getDefaultDNA());
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load saved DNA on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('niknote-handwriting-dna');
      if (saved) {
        const parsed = JSON.parse(saved);
        setDNAState({ ...getDefaultDNA(), ...parsed });
      }
    } catch {}
  }, []);

  // Save DNA to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('niknote-handwriting-dna', JSON.stringify(dna));
    } catch {}
  }, [dna]);

  const updateDNA = useCallback((partial: Partial<HandwritingDNA>) => {
    setDNAState(prev => ({ ...prev, ...partial }));
  }, []);

  const setDNA = useCallback((newDNA: HandwritingDNA) => {
    setDNAState(newDNA);
  }, []);

  const applyPreset = useCallback((presetName: string) => {
    const preset = DNA_PROFILES[presetName];
    if (preset) {
      setDNAState(prev => ({ ...getDefaultDNA(), ...preset, fontModifications: prev.fontModifications }));
    }
  }, []);

  const analyzeFromImage = useCallback(async (imageData: string): Promise<HandwritingDNA> => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeHandwriting(imageData);
      setDNAState(result);
      return result;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const getLineCSS = useCallback((lineIndex: number) => {
    return generateLineVariation(dna, lineIndex);
  }, [dna]);

  const getWordCSS = useCallback((lineIndex: number, wordIndex: number) => {
    return generateWordVariation(dna, lineIndex, wordIndex);
  }, [dna]);

  const getBaseCSS = useCallback(() => {
    return dnaToCSS(dna);
  }, [dna]);

  const getSimilarity = useCallback((otherDNA: HandwritingDNA) => {
    return calculateSimilarity(dna, otherDNA);
  }, [dna]);

  const resetDNA = useCallback(() => {
    setDNAState(getDefaultDNA());
    localStorage.removeItem('niknote-handwriting-dna');
  }, []);

  return (
    <HandwritingDNAContext.Provider
      value={{
        dna,
        updateDNA,
        setDNA,
        applyPreset,
        analyzeFromImage,
        isAnalyzing,
        confidence: dna.confidence,
        getLineCSS,
        getWordCSS,
        getBaseCSS,
        getSimilarity,
        resetDNA,
      }}
    >
      {children}
    </HandwritingDNAContext.Provider>
  );
}

export function useHandwritingDNA(): HandwritingDNAContextType {
  const ctx = useContext(HandwritingDNAContext);
  if (!ctx) {
    throw new Error('useHandwritingDNA must be used within HandwritingDNAProvider');
  }
  return ctx;
}

// Optional hook that returns null if no provider
export function useHandwritingDNAOptional(): HandwritingDNAContextType | null {
  return useContext(HandwritingDNAContext);
}

export default HandwritingDNAContext;
