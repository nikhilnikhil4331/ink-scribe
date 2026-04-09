import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNoteSettings } from '@/hooks/useNoteSettings';
import { useNotebookPages } from '@/hooks/useNotebookPages';
import { useHaptics } from '@/hooks/useHaptics';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useAutoPagination } from '@/hooks/useAutoPagination';
import { usePremium } from '@/hooks/usePremium';
import { useAuth } from '@/contexts/AuthContext';
import { exportToPDF, ExportProgress } from '@/utils/export';
import { NoteLine, LineInkColor, generateLineId, getDefaultColorForLine, LineHistory } from '@/types/noteLine';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { StepContent } from '@/components/app/StepContent';
import { StepStyle } from '@/components/app/StepStyle';
import { StepPreview } from '@/components/app/StepPreview';
import { BottomNavBar } from '@/components/app/BottomNavBar';
import { AppHeader } from '@/components/app/AppHeader';

type AppStep = 'content' | 'style' | 'preview';

const AppWorkspace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<AppStep>('content');
  const { settings, updateSettings, updateMargins, updateHeaderFooter, resetSettings } = useNoteSettings();
  const { triggerHaptic } = useHaptics();
  const { playClick, playSuccess } = useSoundEffects();
  const premium = usePremium();
  const [isExporting, setIsExporting] = useState(false);

  // Multi-page system
  const {
    pages, currentPageIndex, currentPage, totalPages,
    goToPage, nextPage, prevPage, addNewPage, deletePage,
    updateCurrentPageLines, flowOverflowFrom, canGoNext, canGoPrev
  } = useNotebookPages();

  const [currentColor, setCurrentColor] = useState<LineInkColor>('black');
  const [lineHistories, setLineHistories] = useState<Map<string, LineHistory>>(new Map());
  const lines = currentPage.lines;
  const isPastingRef = useRef(false);

  // Auto pagination
  const autoPagination = useAutoPagination({
    settings, lines,
    updateLines: updateCurrentPageLines,
    addNewPage, totalPages, currentPageIndex, goToPage,
  });

  useEffect(() => {
    if (isPastingRef.current) return;
    if (lines.length > autoPagination.linesPerPage) {
      flowOverflowFrom(currentPageIndex, autoPagination.linesPerPage);
    }
  }, [lines.length, autoPagination.linesPerPage, currentPageIndex, flowOverflowFrom]);

  // Line operations
  const saveToHistory = useCallback((lineId: string, line: NoteLine) => {
    setLineHistories((prev) => {
      const m = new Map(prev);
      const h = m.get(lineId) || { past: [], future: [] };
      m.set(lineId, { past: [...h.past.slice(-20), line], future: [] });
      return m;
    });
  }, []);

  const updateLineText = useCallback((lineId: string, text: string) => {
    const idx = lines.findIndex((l) => l.id === lineId);
    if (idx === -1) return;
    saveToHistory(lineId, lines[idx]);
    updateCurrentPageLines(lines.map((l) => l.id === lineId ? { ...l, text, timestamp: Date.now() } : l));
  }, [lines, saveToHistory, updateCurrentPageLines]);

  const addLine = useCallback((afterLineId?: string): string => {
    const newId = generateLineId();
    const idx = afterLineId ? lines.findIndex((l) => l.id === afterLineId) + 1 : lines.length;
    const newLine: NoteLine = { id: newId, text: '', color: getDefaultColorForLine(idx), timestamp: Date.now() };
    const newLines = [...lines];
    newLines.splice(idx, 0, newLine);
    updateCurrentPageLines(newLines);
    return newId;
  }, [lines, updateCurrentPageLines]);

  const removeLine = useCallback((lineId: string) => {
    if (lines.length <= 1) {
      updateCurrentPageLines(lines.map((l) => l.id === lineId ? { ...l, text: '', timestamp: Date.now() } : l));
    } else {
      updateCurrentPageLines(lines.filter((l) => l.id !== lineId));
    }
  }, [lines, updateCurrentPageLines]);

  const mergeLinesUp = useCallback((lineId: string) => {
    const idx = lines.findIndex((l) => l.id === lineId);
    if (idx <= 0) return;
    const merged = { ...lines[idx - 1], text: lines[idx - 1].text + lines[idx].text, timestamp: Date.now() };
    const newLines = [...lines];
    newLines[idx - 1] = merged;
    newLines.splice(idx, 1);
    updateCurrentPageLines(newLines);
  }, [lines, updateCurrentPageLines]);

  const handlePaste = useCallback((rawText: string, atLineId?: string) => {
    const normalized = (rawText ?? '').replace(/\r/g, '');
    const pastedLines = normalized.split('\n');
    if (pastedLines.length <= 1) return;

    const insertIndex = atLineId ? lines.findIndex((l) => l.id === atLineId) : lines.length - 1;
    if (insertIndex === -1) return;

    const newLinesData = pastedLines.map((text, i) => ({
      id: generateLineId(), text,
      color: getDefaultColorForLine(insertIndex + i),
      timestamp: Date.now() + i,
    }));

    const currentLine = lines[insertIndex];
    const baseBefore = (currentLine?.text ?? '') === '' ? lines.slice(0, insertIndex) : lines.slice(0, insertIndex + 1);
    const baseAfter = (currentLine?.text ?? '') === '' ? lines.slice(insertIndex + 1) : lines.slice(insertIndex + 1);

    isPastingRef.current = true;
    const allNew = [...baseBefore, ...newLinesData, ...baseAfter];
    updateCurrentPageLines(allNew);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isPastingRef.current = false;
        if (allNew.length > autoPagination.linesPerPage) {
          flowOverflowFrom(currentPageIndex, autoPagination.linesPerPage);
        }
      });
    });
  }, [lines, updateCurrentPageLines, autoPagination.linesPerPage, flowOverflowFrom, currentPageIndex]);

  const getPlainText = useCallback(() => lines.map((l) => l.text).join('\n'), [lines]);

  const handleExportPDF = useCallback(async () => {
    const text = getPlainText();
    if (!text.trim()) {
      toast.error('Please add some content first');
      return;
    }

    setIsExporting(true);
    triggerHaptic('medium');
    const toastId = toast.loading('Creating PDF...');

    try {
      const previewEls = Array.from(
        document.querySelectorAll('[data-export-page="true"]')
      ) as HTMLElement[];

      if (!previewEls.length) {
        toast.error('Switch to Preview first', { id: toastId });
        setCurrentStep('preview');
        setIsExporting(false);
        return;
      }

      await exportToPDF(previewEls, 'niknote-handwritten', settings.pageSize, (p) => {
        toast.loading(`Creating PDF: Page ${p.current}/${p.total}`, { id: toastId });
      });

      toast.success('PDF exported!', { id: toastId });
      playSuccess();
      triggerHaptic('success');
    } catch (e) {
      toast.error('Export failed', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  }, [getPlainText, settings.pageSize, triggerHaptic, playSuccess]);

  const handleStepChange = useCallback((step: AppStep) => {
    triggerHaptic('light');
    playClick();
    setCurrentStep(step);
  }, [triggerHaptic, playClick]);

  const wordCount = lines.reduce((acc, l) => acc + (l.text.trim() ? l.text.trim().split(/\s+/).length : 0), 0);

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <AppHeader
        user={user}
        isPremium={premium.isPremium}
        wordCount={wordCount}
        currentPage={currentPageIndex + 1}
        totalPages={totalPages}
      />

      {/* Step Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {currentStep === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <StepContent
                lines={lines}
                currentColor={currentColor}
                onUpdateLineText={updateLineText}
                onAddLine={addLine}
                onRemoveLine={removeLine}
                onMergeLinesUp={mergeLinesUp}
                onPaste={handlePaste}
                onColorChange={setCurrentColor}
              />
            </motion.div>
          )}

          {currentStep === 'style' && (
            <motion.div
              key="style"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <StepStyle
                settings={settings}
                onUpdateSettings={updateSettings}
                lines={lines}
              />
            </motion.div>
          )}

          {currentStep === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <StepPreview
                settings={settings}
                pages={pages}
                currentPageIndex={currentPageIndex}
                totalPages={totalPages}
                onGoToPage={goToPage}
                onExportPDF={handleExportPDF}
                isExporting={isExporting}
                isPremium={premium.isPremium}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar
        currentStep={currentStep}
        onStepChange={handleStepChange}
      />
    </div>
  );
};

export default AppWorkspace;
