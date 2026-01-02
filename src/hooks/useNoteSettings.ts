import { useState, useCallback } from 'react';
import { NoteSettings, DEFAULT_SETTINGS } from '@/types/notes';

export function useNoteSettings() {
  const [settings, setSettings] = useState<NoteSettings>(DEFAULT_SETTINGS);

  const updateSettings = useCallback((updates: Partial<NoteSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateMargins = useCallback((updates: Partial<NoteSettings['margins']>) => {
    setSettings((prev) => ({
      ...prev,
      margins: { ...prev.margins, ...updates },
    }));
  }, []);

  const updateHeaderFooter = useCallback((updates: Partial<NoteSettings['headerFooter']>) => {
    setSettings((prev) => ({
      ...prev,
      headerFooter: { ...prev.headerFooter, ...updates },
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    updateSettings,
    updateMargins,
    updateHeaderFooter,
    resetSettings,
  };
}
