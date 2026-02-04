import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LineBasedEditor } from '@/components/LineBasedEditor';
import { NotebookPreview, NotebookPreviewHandle } from '@/components/NotebookPreview';
import { PenPalette } from '@/components/PenPalette';
import { ControlPanel } from '@/components/ControlPanel';
import { SlidePanel } from '@/components/SlidePanel';
import {
  EditorHeader,
  MoodToolbar,
  PageControlBar,
  FloatingToolbar,
  AISolverButton,
  LivePreviewPanel,
  NotebookCanvas,
} from '@/components/editor';
import { useNoteSettings } from '@/hooks/useNoteSettings';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useDiagrams } from '@/hooks/useDiagrams';
import { useTableData } from '@/hooks/useTableData';
import { useNotebookPages } from '@/hooks/useNotebookPages';
import { useHaptics } from '@/hooks/useHaptics';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useMood } from '@/hooks/useMood';
import { useIsMobile } from '@/hooks/use-mobile';

import { exportToPDF, exportAllPagesToImages, ExportProgress } from '@/utils/export';
import { toast } from 'sonner';
import { PenLine, Settings2, Palette, Mic, MicOff } from 'lucide-react';
import { NoteLine, LineInkColor, generateLineId, getDefaultColorForLine, LineHistory } from '@/types/noteLine';
import { useSpeechDictation } from '@/hooks/useSpeechDictation';
import { PaywallModal } from '@/components/premium/PaywallModal';
import { usePremium, PremiumFeature } from '@/hooks/usePremium';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { AnimatedButton } from '@/components/AnimatedButton';
import type { MoodType } from '@/components/editor/MoodToolbar';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [pageDirection, setPageDirection] = useState<'left' | 'right' | 'none'>('none');
  const [showPenPanel, setShowPenPanel] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [isLivePreviewExpanded, setIsLivePreviewExpanded] = useState(false);

  const { settings, updateSettings, updateMargins, updateHeaderFooter, resetSettings } = useNoteSettings();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { diagrams, addDiagram, removeDiagram, updateDiagram } = useDiagrams();
  const { tableData, updateTableData } = useTableData(settings.table.rows, settings.table.columns);
  const { mood, changeMood, styles: moodStyles } = useMood();
  const previewRef = useRef<NotebookPreviewHandle>(null);
  
  const { triggerHaptic } = useHaptics();
  const { playClick, playSuccess } = useSoundEffects();

  const premium = usePremium();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [pendingFeature, setPendingFeature] = useState<PremiumFeature | null>(null);

  const requirePremium = useCallback((feature: PremiumFeature) => {
    setPendingFeature(feature);
    setPaywallOpen(true);
  }, []);

  const quickDictation = useSpeechDictation({
    onFinalTranscript: (text) => {
      handlePaste(text);
    },
  });

  // Multi-page system
  const {
    pages,
    currentPageIndex,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    addNewPage,
    deletePage,
    updateCurrentPageLines,
    canGoNext,
    canGoPrev,
  } = useNotebookPages();

  // Line editing state for current page
  const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set());
  const [currentColor, setCurrentColor] = useState<LineInkColor>('black');
  const [realPenMode, setRealPenMode] = useState(false);
  const [lineHistories, setLineHistories] = useState<Map<string, LineHistory>>(new Map());

  const lines = currentPage.lines;

  // Sync lines when page changes
  useEffect(() => {
    setSelectedLines(new Set());
  }, [currentPageIndex]);

  // Line operations
  const saveToHistory = useCallback((lineId: string, line: NoteLine) => {
    setLineHistories(prev => {
      const newHistories = new Map(prev);
      const history = newHistories.get(lineId) || { past: [], future: [] };
      newHistories.set(lineId, {
        past: [...history.past.slice(-20), line],
        future: [],
      });
      return newHistories;
    });
  }, []);

  const updateLineText = useCallback((lineId: string, text: string) => {
    const lineIndex = lines.findIndex(l => l.id === lineId);
    if (lineIndex === -1) return;
    
    saveToHistory(lineId, lines[lineIndex]);
    
    const newLines = lines.map(line => 
      line.id === lineId 
        ? { ...line, text, timestamp: Date.now() }
        : line
    );
    updateCurrentPageLines(newLines);
  }, [lines, saveToHistory, updateCurrentPageLines]);

  const updateLineColor = useCallback((lineId: string, color: LineInkColor) => {
    const newLines = lines.map(line => 
      line.id === lineId 
        ? { ...line, color, timestamp: Date.now() }
        : line
    );
    updateCurrentPageLines(newLines);
  }, [lines, updateCurrentPageLines]);

  const updateSelectedLinesColor = useCallback((color: LineInkColor) => {
    if (selectedLines.size === 0) return;
    
    const newLines = lines.map(line => 
      selectedLines.has(line.id)
        ? { ...line, color, timestamp: Date.now() }
        : line
    );
    updateCurrentPageLines(newLines);
    setCurrentColor(color);
  }, [lines, selectedLines, updateCurrentPageLines]);

  const addLine = useCallback((afterLineId?: string): string => {
    const newId = generateLineId();
    const newLineIndex = afterLineId 
      ? lines.findIndex(l => l.id === afterLineId) + 1 
      : lines.length;
    
    const newLine: NoteLine = {
      id: newId,
      text: '',
      color: getDefaultColorForLine(newLineIndex),
      timestamp: Date.now(),
    };
    
    const newLines = [...lines];
    newLines.splice(newLineIndex, 0, newLine);
    updateCurrentPageLines(newLines);
    
    return newId;
  }, [lines, updateCurrentPageLines]);

  const removeLine = useCallback((lineId: string) => {
    if (lines.length <= 1) {
      const newLines = lines.map(line => 
        line.id === lineId 
          ? { ...line, text: '', timestamp: Date.now() }
          : line
      );
      updateCurrentPageLines(newLines);
    } else {
      updateCurrentPageLines(lines.filter(line => line.id !== lineId));
    }
    setSelectedLines(prev => {
      const next = new Set(prev);
      next.delete(lineId);
      return next;
    });
  }, [lines, updateCurrentPageLines]);

  const selectLine = useCallback((lineId: string, multiSelect = false) => {
    setSelectedLines(prev => {
      if (multiSelect) {
        const next = new Set(prev);
        if (next.has(lineId)) {
          next.delete(lineId);
        } else {
          next.add(lineId);
        }
        return next;
      } else {
        return new Set([lineId]);
      }
    });
    
    const line = lines.find(l => l.id === lineId);
    if (line) {
      setCurrentColor(line.color);
    }
  }, [lines]);

  const clearSelection = useCallback(() => {
    setSelectedLines(new Set());
  }, []);

  const handlePaste = useCallback((text: string, atLineId?: string) => {
    const pastedLines = text.split('\n');
    const insertIndex = atLineId 
      ? lines.findIndex(l => l.id === atLineId) 
      : lines.length - 1;
    
    if (insertIndex === -1) return;
    
    const newLinesData = pastedLines.map((lineText, i) => ({
      id: generateLineId(),
      text: lineText,
      color: getDefaultColorForLine(insertIndex + i),
      timestamp: Date.now() + i,
    }));
    
    const currentLine = lines[insertIndex];
    const newLines = [...lines];
    
    if (currentLine.text === '') {
      newLines.splice(insertIndex, 1, ...newLinesData);
    } else {
      newLines.splice(insertIndex + 1, 0, ...newLinesData);
    }
    
    updateCurrentPageLines(newLines);
  }, [lines, updateCurrentPageLines]);

  const undoLine = useCallback((lineId: string) => {
    const history = lineHistories.get(lineId);
    if (!history || history.past.length === 0) return;
    
    const currentLine = lines.find(l => l.id === lineId);
    if (!currentLine) return;
    
    const previousState = history.past[history.past.length - 1];
    
    setLineHistories(prevHistories => {
      const newHistories = new Map(prevHistories);
      const h = newHistories.get(lineId)!;
      newHistories.set(lineId, {
        past: h.past.slice(0, -1),
        future: [currentLine, ...h.future],
      });
      return newHistories;
    });
    
    const newLines = lines.map(line => 
      line.id === lineId ? previousState : line
    );
    updateCurrentPageLines(newLines);
  }, [lines, lineHistories, updateCurrentPageLines]);

  const redoLine = useCallback((lineId: string) => {
    const history = lineHistories.get(lineId);
    if (!history || history.future.length === 0) return;
    
    const currentLine = lines.find(l => l.id === lineId);
    if (!currentLine) return;
    
    const nextState = history.future[0];
    
    setLineHistories(prevHistories => {
      const newHistories = new Map(prevHistories);
      const h = newHistories.get(lineId)!;
      newHistories.set(lineId, {
        past: [...h.past, currentLine],
        future: h.future.slice(1),
      });
      return newHistories;
    });
    
    const newLines = lines.map(line => 
      line.id === lineId ? nextState : line
    );
    updateCurrentPageLines(newLines);
  }, [lines, lineHistories, updateCurrentPageLines]);

  const canUndo = useCallback((lineId: string) => {
    const history = lineHistories.get(lineId);
    return history ? history.past.length > 0 : false;
  }, [lineHistories]);

  const canRedo = useCallback((lineId: string) => {
    const history = lineHistories.get(lineId);
    return history ? history.future.length > 0 : false;
  }, [lineHistories]);

  const getPlainText = useCallback(() => {
    return lines.map(l => l.text).join('\n');
  }, [lines]);

  const mergeLinesUp = useCallback((lineId: string) => {
    const lineIndex = lines.findIndex(l => l.id === lineId);
    if (lineIndex <= 0) return;
    
    const currentLine = lines[lineIndex];
    const previousLine = lines[lineIndex - 1];
    
    const mergedLine: NoteLine = {
      ...previousLine,
      text: previousLine.text + currentLine.text,
      timestamp: Date.now(),
    };
    
    const newLines = [...lines];
    newLines[lineIndex - 1] = mergedLine;
    newLines.splice(lineIndex, 1);
    
    updateCurrentPageLines(newLines);
  }, [lines, updateCurrentPageLines]);

  const firstSelectedLineId = selectedLines.size > 0 ? Array.from(selectedLines)[0] : null;

  // Page navigation with animation
  const handleNextPage = useCallback(() => {
    if (canGoNext) {
      setPageDirection('right');
      triggerHaptic('light');
      playClick();
      nextPage();
    }
  }, [canGoNext, nextPage, triggerHaptic, playClick]);

  const handlePrevPage = useCallback(() => {
    if (canGoPrev) {
      setPageDirection('left');
      triggerHaptic('light');
      playClick();
      prevPage();
    }
  }, [canGoPrev, prevPage, triggerHaptic, playClick]);

  const handleAddPage = useCallback(() => {
    setPageDirection('right');
    triggerHaptic('medium');
    playSuccess();
    addNewPage();
    toast.success('New page added!');
  }, [addNewPage, triggerHaptic, playSuccess]);

  const handleDeletePage = useCallback(() => {
    if (totalPages > 1) {
      deletePage(currentPageIndex);
      triggerHaptic('medium');
      toast.success('Page deleted');
    }
  }, [deletePage, currentPageIndex, totalPages, triggerHaptic]);

  const handleGoToPage = useCallback((index: number) => {
    const direction = index > currentPageIndex ? 'right' : 'left';
    setPageDirection(direction);
    triggerHaptic('light');
    playClick();
    goToPage(index);
  }, [currentPageIndex, goToPage, triggerHaptic, playClick]);

  const handleExportPDF = useCallback(async () => {
    const text = getPlainText();
    if (!text.trim() && !settings.table.enabled && diagrams.length === 0) {
      toast.error('Please add some content first');
      return;
    }

    const elements = previewRef.current?.getPageElements();
    if (!elements || elements.length === 0) {
      toast.error('No pages to export');
      return;
    }

    setIsExporting(true);
    setExportProgress(null);
    triggerHaptic('medium');

    const toastId = toast.loading(
      elements.length > 1 
        ? `Exporting: Page 1 of ${elements.length}...` 
        : 'Exporting page...'
    );

    try {
      await exportToPDF(elements, 'handwritten-notes', settings.pageSize, (progress) => {
        setExportProgress(progress);
        if (elements.length > 1) {
          toast.loading(
            `Exporting: Page ${progress.current} of ${progress.total} (${progress.percentage}%)`,
            { id: toastId }
          );
        }
      });

      const successMsg = elements.length > 1 
        ? 'Pages exported as ZIP successfully!' 
        : 'Page exported as PNG successfully!';
      toast.success(successMsg, { id: toastId });
      playSuccess();
      triggerHaptic('success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Export failed: ${message}`, { id: toastId });
      triggerHaptic('error');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  }, [getPlainText, settings.table.enabled, settings.pageSize, diagrams.length, triggerHaptic, playSuccess]);

  const handleReset = useCallback(() => {
    resetSettings();
    triggerHaptic('medium');
    toast.success('Settings reset to defaults');
  }, [resetSettings, triggerHaptic]);

  const handleColorChange = useCallback((color: typeof currentColor) => {
    if (selectedLines.size > 0) {
      updateSelectedLinesColor(color);
    }
    setCurrentColor(color);
    triggerHaptic('selection');
    playClick();
  }, [selectedLines, updateSelectedLinesColor, triggerHaptic, playClick]);

  const handleUndo = useCallback(() => {
    if (firstSelectedLineId) {
      undoLine(firstSelectedLineId);
      triggerHaptic('light');
    }
  }, [firstSelectedLineId, undoLine, triggerHaptic]);

  const handleRedo = useCallback(() => {
    if (firstSelectedLineId) {
      redoLine(firstSelectedLineId);
      triggerHaptic('light');
    }
  }, [firstSelectedLineId, redoLine, triggerHaptic]);

  // Handler for importing text from OCR
  const handleImportText = useCallback((importedLines: string[]) => {
    const flattened = importedLines
      .flatMap((chunk) => String(chunk ?? '').split(/\r?\n/))
      .map((l) => l.replace(/[\t ]+$/g, ''));

    const safeLines = flattened.length > 0 ? flattened : [''];

    const newLines = safeLines.map((text, i) => ({
      id: generateLineId(),
      text,
      color: getDefaultColorForLine(i) as LineInkColor,
      timestamp: Date.now() + i,
    }));
    
    if (newLines.length > 0) {
      updateCurrentPageLines(newLines);
      toast.success(`Imported ${newLines.length} lines!`);
    }
  }, [updateCurrentPageLines]);

  // Mood change handler - convert to app mood system
  const handleMoodChange = useCallback((newMood: MoodType) => {
    changeMood(newMood);
    triggerHaptic('selection');
  }, [changeMood, triggerHaptic]);

  const controlPanelProps = {
    settings,
    updateSettings,
    updateMargins,
    updateHeaderFooter,
    tableData,
    onTableDataChange: updateTableData,
    diagrams,
    onAddDiagram: addDiagram,
    onRemoveDiagram: removeDiagram,
    onUpdateDiagram: updateDiagram,
    premiumLocked: !premium.isPremium,
    onPremiumTap: () => requirePremium('ai_style_matcher'),
    onImportText: handleImportText,
  };

  return (
    <div className={cn(
      "min-h-screen overflow-x-hidden transition-colors duration-500",
      moodStyles.background,
      "pt-[190px] pb-32" // Space for fixed headers and bottom preview
    )}>
      {/* Fixed Top Bar */}
      <EditorHeader
        onExport={handleExportPDF}
        onUndo={handleUndo}
        canUndo={firstSelectedLineId ? canUndo(firstSelectedLineId) : false}
        isExporting={isExporting}
      />

      {/* Mood Toolbar */}
      <MoodToolbar
        currentMood={mood as MoodType}
        onMoodChange={handleMoodChange}
      />

      {/* Page Control Bar */}
      <PageControlBar
        currentPage={currentPageIndex + 1}
        totalPages={totalPages}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        onAddPage={handleAddPage}
        onDeletePage={handleDeletePage}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
      />

      {/* Desktop: AI Solver floating button */}
      {!isMobile && <AISolverButton />}

      {/* Desktop: Right Vertical Floating Toolbar */}
      {!isMobile && (
        <FloatingToolbar
          isListening={quickDictation.isListening}
          onToggleDictation={() => {
            if (!premium.isPremium) return requirePremium('voice_dictation');
            if (!quickDictation.isSupported) return;
            if (quickDictation.isListening) quickDictation.stop();
            else quickDictation.start();
          }}
          onOpenPalette={() => setShowPenPanel(true)}
          onOpenSettings={() => setShowStylePanel(true)}
          dictationSupported={quickDictation.isSupported}
          premiumLocked={!premium.isPremium}
          onPremiumTap={() => requirePremium('ai_writing')}
          currentText={getPlainText()}
          onInsertText={(text) => handlePaste(text)}
        />
      )}

      {/* Mobile Floating Action Buttons */}
      {isMobile && (
        <div className="fixed bottom-28 right-4 z-30 flex flex-col gap-3">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 25 }}
            whileTap={{ scale: 0.92 }}
          >
            <AnimatedButton
              variant="outline"
              size="icon"
              onClick={() => {
                if (!premium.isPremium) return requirePremium('voice_dictation');
                if (!quickDictation.isSupported) return;
                if (quickDictation.isListening) quickDictation.stop();
                else quickDictation.start();
              }}
              className="h-14 w-14 rounded-2xl shadow-soft-lg glass-card border-border/50"
            >
              {quickDictation.isListening ? (
                <MicOff className="w-5 h-5 text-primary" />
              ) : (
                <Mic className="w-5 h-5 text-primary" />
              )}
            </AnimatedButton>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 400, damping: 25 }}
            whileTap={{ scale: 0.92 }}
          >
            <AnimatedButton
              variant="outline"
              size="icon"
              onClick={() => setShowPenPanel(true)}
              className="h-14 w-14 rounded-2xl shadow-soft-lg glass-card border-border/50"
            >
              <Palette className="w-5 h-5 text-primary" />
            </AnimatedButton>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 25 }}
            whileTap={{ scale: 0.92 }}
          >
            <AnimatedButton
              variant="outline"
              size="icon"
              onClick={() => setShowStylePanel(true)}
              className="h-14 w-14 rounded-2xl shadow-soft-lg glass-card border-border/50"
            >
              <Settings2 className="w-5 h-5 text-primary" />
            </AnimatedButton>
          </motion.div>
        </div>
      )}

      {/* Slide Panels for Mobile */}
      <SlidePanel
        isOpen={showPenPanel}
        onClose={() => setShowPenPanel(false)}
        title="Pen Palette"
        icon={<Palette className="w-4 h-4 text-primary" />}
        side="right"
      >
        <PenPalette
          currentColor={currentColor}
          onColorChange={handleColorChange}
          selectedCount={selectedLines.size}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={firstSelectedLineId ? canUndo(firstSelectedLineId) : false}
          canRedo={firstSelectedLineId ? canRedo(firstSelectedLineId) : false}
          realPenMode={realPenMode}
          onRealPenModeChange={setRealPenMode}
          currentText={getPlainText()}
          onInsertText={(text) => handlePaste(text)}
          premiumLocked={!premium.isPremium}
          onPremiumTap={() => requirePremium('ai_writing')}
        />
      </SlidePanel>

      <SlidePanel
        isOpen={showStylePanel}
        onClose={() => setShowStylePanel(false)}
        title="Page Style"
        icon={<Settings2 className="w-4 h-4 text-primary" />}
        side="right"
      >
        <ControlPanel {...controlPanelProps} />
      </SlidePanel>

      {/* Main Content - Centered Notebook */}
      <main className="container mx-auto px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Desktop Layout: Side by side */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-6">
            {/* Editor Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className={cn(
                "rounded-[24px] border border-border/50",
                "shadow-xl p-5",
                "bg-card/95 backdrop-blur-xl",
                moodStyles.paper
              )}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <PenLine className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Write</h3>
                    <p className="text-[11px] text-muted-foreground">
                      {lines.length} line(s) • Page {currentPageIndex + 1}/{totalPages}
                    </p>
                  </div>
                </div>
                
                <NotebookCanvas
                  pageDirection={pageDirection}
                  pageId={currentPage.id}
                >
                  <LineBasedEditor
                    lines={lines}
                    selectedLines={selectedLines}
                    currentColor={currentColor}
                    realPenMode={realPenMode}
                    onLineTextChange={updateLineText}
                    onLineColorChange={updateLineColor}
                    onSelectLine={selectLine}
                    onAddLine={addLine}
                    onRemoveLine={removeLine}
                    onPaste={handlePaste}
                    onMergeLinesUp={mergeLinesUp}
                  />
                </NotebookCanvas>
              </div>
            </motion.div>

            {/* Preview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="rounded-[24px] border border-border/50 overflow-hidden shadow-2xl min-h-[600px]">
                <NotebookPreview 
                  ref={previewRef} 
                  lines={lines}
                  settings={settings}
                  realPenMode={realPenMode}
                  pageNumber={currentPageIndex + 1}
                  totalPages={totalPages}
                />
              </div>
            </motion.div>
          </div>

          {/* Mobile Layout: Single notebook */}
          <div className="lg:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <NotebookCanvas
                pageDirection={pageDirection}
                pageId={currentPage.id}
                className="min-h-[500px]"
              >
                <LineBasedEditor
                  lines={lines}
                  selectedLines={selectedLines}
                  currentColor={currentColor}
                  realPenMode={realPenMode}
                  onLineTextChange={updateLineText}
                  onLineColorChange={updateLineColor}
                  onSelectLine={selectLine}
                  onAddLine={addLine}
                  onRemoveLine={removeLine}
                  onPaste={handlePaste}
                  onMergeLinesUp={mergeLinesUp}
                />
              </NotebookCanvas>
            </motion.div>

            {/* Hidden preview for export */}
            <div className="hidden">
              <NotebookPreview 
                ref={previewRef} 
                lines={lines}
                settings={settings}
                realPenMode={realPenMode}
                pageNumber={currentPageIndex + 1}
                totalPages={totalPages}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Live Preview Panel */}
      <LivePreviewPanel
        lines={lines}
        settings={settings}
        realPenMode={realPenMode}
        isVisible={showLivePreview}
        onToggle={() => setIsLivePreviewExpanded(prev => !prev)}
        isExpanded={isLivePreviewExpanded}
      />

      {/* Paywall Modal */}
      <PaywallModal
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
      />
    </div>
  );
};

export default Index;
