import { useState, useCallback } from 'react';
import { DiagramImage } from '@/types/notes';

export function useDiagrams() {
  const [diagrams, setDiagrams] = useState<DiagramImage[]>([]);

  const addDiagram = useCallback((diagram: DiagramImage) => {
    setDiagrams((prev) => [...prev, diagram]);
  }, []);

  const removeDiagram = useCallback((id: string) => {
    setDiagrams((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const updateDiagram = useCallback((id: string, updates: Partial<DiagramImage>) => {
    setDiagrams((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  }, []);

  const clearDiagrams = useCallback(() => {
    setDiagrams([]);
  }, []);

  return {
    diagrams,
    addDiagram,
    removeDiagram,
    updateDiagram,
    clearDiagrams,
  };
}
