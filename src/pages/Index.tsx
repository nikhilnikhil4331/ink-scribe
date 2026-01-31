import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LineBasedEditor } from '@/components/LineBasedEditor';
import { NotebookPreview, NotebookPreviewHandle } from '@/components/NotebookPreview';
import { PenPalette } from '@/components/PenPalette';
import { ControlPanel } from '@/components/ControlPanel';
import { Toolbar } from '@/components/Toolbar';
import { PageBar } from '@/components/PageBar';
import { MoodSelector } from '@/components/MoodSelector';
import { SlidePanel } from '@/components/SlidePanel';
import { AnimatedButton } from '@/components/AnimatedButton';
import { useNoteSettings } from '@/hooks/useNoteSettings';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useDiagrams } from '@/hooks/useDiagrams';
import { useTableData } from '@/hooks/useTableData';
import { useNotebookPages } from '@/hooks/useNotebookPages';
import { useHaptics } from '@/hooks/useHaptics';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useMood } from '@/hooks/useMood';
import { exportToPDF, exportAllPagesToImages, ExportProgress } from '@/utils/export';
import { toast } from 'sonner';
import { PenLine, Settings2, Eye, Edit3, FileDown, Palette, Mic, MicOff, Sparkles, Crown, LogIn, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NoteLine, LineInkColor, generateLineId, getDefaultColorForLine, LineHistory } from '@/types/noteLine';
import { useSpeechDictation } from '@/hooks/useSpeechDictation';
import { PaywallModal } from '@/components/premium/PaywallModal';
import { usePremium, PremiumFeature } from '@/hooks/usePremium';
import { AIWritingAssistant } from '@/components/AIWritingAssistant';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { HeaderProfileButton } from '@/components/HeaderProfileButton';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [pageDirection, setPageDirection] = useState<'left' | 'right' | 'none'>('none');
  const [showPenPanel, setShowPenPanel] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);

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

  const handleDeletePage = useCallback((index: number) => {
    if (totalPages > 1) {
      deletePage(index);
      triggerHaptic('medium');
      toast.success('Page deleted');
    }
  }, [deletePage, totalPages, triggerHaptic]);

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

  const handleExportImages = useCallback(
    async (format: 'png' | 'jpeg') => {
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
          ? `Exporting ${format.toUpperCase()}: Image 1 of ${elements.length}...` 
          : `Exporting ${format.toUpperCase()}...`
      );

      try {
        await exportAllPagesToImages(elements, format, 'handwritten-note', (progress) => {
          setExportProgress(progress);
          if (elements.length > 1) {
            toast.loading(
              `Exporting ${format.toUpperCase()}: Image ${progress.current} of ${progress.total} (${progress.percentage}%)`,
              { id: toastId }
            );
          }
        });

        toast.success(`${format.toUpperCase()} exported successfully!`, { id: toastId });
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
    },
    [getPlainText, settings.table.enabled, diagrams.length, triggerHaptic, playSuccess]
  );

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
  };

  // Page transition variants
  const pageVariants = {
    enter: (direction: string) => ({
      x: direction === 'right' ? 300 : direction === 'left' ? -300 : 0,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: string) => ({
      x: direction === 'right' ? -300 : direction === 'left' ? 300 : 0,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div className={cn("min-h-screen overflow-x-hidden transition-colors duration-500", moodStyles.background)}>
      {/* Header - Apple-style glassmorphism */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="sticky top-0 z-50 glass border-b border-border/30 h-14 sm:h-16 flex-shrink-0"
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 h-full flex items-center justify-between overflow-hidden">
          {/* Logo - Premium design */}
          <motion.div 
            className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25 flex-shrink-0">
              <PenLine className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div className="hidden xs:block">
              <h1 className="font-display font-bold text-base sm:text-lg text-foreground tracking-tight leading-tight">Nikhil Notes</h1>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium leading-tight">Handwritten notes</p>
            </div>
          </motion.div>

          {/* Center: Mood Selector */}
          <div className="hidden md:block">
            <MoodSelector currentMood={mood} onMoodChange={changeMood} />
          </div>

          {/* Right: Actions - iOS-style buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* AI Solver Button */}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/ai-solver')}
                className="gap-1.5 rounded-full border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/50 h-9 px-3 sm:px-4 shadow-sm transition-all duration-200"
              >
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-medium">AI Solver</span>
              </Button>
            </motion.div>
            
            {!premium.isPremium && (
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/payment')}
                  className="gap-1.5 rounded-full border-amber-500/30 bg-amber-500/5 text-amber-600 hover:bg-amber-500/10 hover:border-amber-500/50 h-9 px-3 sm:px-4 shadow-sm transition-all duration-200"
                >
                  <Crown className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-medium">Upgrade</span>
                </Button>
              </motion.div>
            )}
            
            {user ? (
              <HeaderProfileButton />
            ) : (
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="gap-1.5 rounded-full hover:bg-secondary h-9 px-3 sm:px-4 transition-all duration-200"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs font-medium">Sign In</span>
                </Button>
              </motion.div>
            )}

            <Toolbar
              onExportPDF={handleExportPDF}
              onExportPNG={() => handleExportImages('png')}
              onExportJPEG={() => handleExportImages('jpeg')}
              onReset={handleReset}
              isDark={isDark}
              onToggleDark={toggleDark}
              isExporting={isExporting}
            />
          </div>
        </div>
      </motion.header>

      {/* Page Bar - Fixed height to prevent mobile overflow */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/50 backdrop-blur-sm py-1.5 sm:py-2 px-2 sm:px-4 h-14 sm:h-16 flex-shrink-0 overflow-hidden">
        <div className="container mx-auto max-w-4xl h-full flex items-center">
          <PageBar
            currentPage={currentPageIndex + 1}
            totalPages={totalPages}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            onAddPage={handleAddPage}
            onDeletePage={handleDeletePage}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            onGoToPage={handleGoToPage}
          />
        </div>
      </div>

      {/* Mobile Mood Selector */}
      <div className="md:hidden px-4 py-2">
        <MoodSelector currentMood={mood} onMoodChange={changeMood} />
      </div>

      {/* Mobile Floating Buttons - iOS-style FAB stack */}
      <div className="fixed bottom-6 right-4 z-30 flex flex-col gap-3 lg:hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 25 }}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
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
            title={premium.isPremium ? 'Dictation' : 'Premium'}
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
          whileHover={{ scale: 1.05 }}
        >
          <div>
            <AIWritingAssistant
              currentText={getPlainText()}
              onInsertText={(text) => handlePaste(text)}
              locked={!premium.isPremium}
              onLockedTap={() => requirePremium('ai_writing')}
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 25 }}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
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
          transition={{ delay: 0.25, type: 'spring', stiffness: 400, damping: 25 }}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
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

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 pb-28 sm:pb-8">
        {/* Mobile Tabs */}
        <div className="lg:hidden">
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 p-1 h-12 bg-secondary/50 rounded-2xl">
              <TabsTrigger value="editor" className="gap-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Edit3 className="w-4 h-4" />
                <span className="text-xs font-medium">Write</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Eye className="w-4 h-4" />
                <span className="text-xs font-medium">Preview</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="mt-0">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("rounded-2xl border border-border/50 shadow-xl p-4", moodStyles.paper)}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Edit3 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Notebook</h3>
                    <p className="text-[11px] text-muted-foreground">{lines.length} line(s) • Page {currentPageIndex + 1}/{totalPages}</p>
                  </div>
                </div>
                <AnimatePresence mode="wait" custom={pageDirection}>
                  <motion.div
                    key={currentPage.id}
                    custom={pageDirection}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => {
                      if (info.offset.x > 80 || info.velocity.x > 400) {
                        handlePrevPage();
                      } else if (info.offset.x < -80 || info.velocity.x < -400) {
                        handleNextPage();
                      }
                    }}
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
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-0">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border/50 min-h-[500px] overflow-hidden shadow-xl"
              >
                <AnimatePresence mode="wait" custom={pageDirection}>
                  <motion.div
                    key={currentPage.id}
                    custom={pageDirection}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => {
                      if (info.offset.x > 80 || info.velocity.x > 400) {
                        handlePrevPage();
                      } else if (info.offset.x < -80 || info.velocity.x < -400) {
                        handleNextPage();
                      }
                    }}
                  >
                    <NotebookPreview 
                      ref={previewRef} 
                      lines={lines}
                      settings={settings}
                      realPenMode={realPenMode}
                      pageNumber={currentPageIndex + 1}
                      totalPages={totalPages}
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-5">
          {/* Notebook Editor */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-4"
          >
            <div className={cn("rounded-2xl border border-border/50 shadow-xl p-4 sticky top-36", moodStyles.paper)}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Edit3 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Notebook</h3>
                    <p className="text-[11px] text-muted-foreground">{lines.length} line(s) • Page {currentPageIndex + 1}/{totalPages}</p>
                  </div>
                </div>
              </div>
              <AnimatePresence mode="wait" custom={pageDirection}>
                <motion.div
                  key={currentPage.id}
                  custom={pageDirection}
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${showControls ? 'col-span-5' : 'col-span-6'} transition-all duration-500 ease-out`}
          >
            <div className="rounded-2xl border border-border/50 min-h-[calc(100vh-10rem)] overflow-hidden shadow-2xl">
              <AnimatePresence mode="wait" custom={pageDirection}>
                <motion.div
                  key={currentPage.id}
                  custom={pageDirection}
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="h-full"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 80 || info.velocity.x > 400) {
                      handlePrevPage();
                    } else if (info.offset.x < -80 || info.velocity.x < -400) {
                      handleNextPage();
                    }
                  }}
                >
                  <NotebookPreview 
                    ref={previewRef} 
                    lines={lines}
                    settings={settings}
                    realPenMode={realPenMode}
                    pageNumber={currentPageIndex + 1}
                    totalPages={totalPages}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Pen Palette + Controls */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`${showControls ? 'col-span-3' : 'col-span-2'} space-y-4`}
          >
            <div className="sticky top-36">
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

              {/* Quick Export */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 p-4 bg-card rounded-2xl border border-border/80 shadow-sm"
              >
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Export</h4>
                <div className="grid grid-cols-2 gap-2">
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="gap-1.5 rounded-xl text-xs"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    Export
                  </AnimatedButton>
                  <AnimatedButton
                    variant="default"
                    size="sm"
                    onClick={() => handleExportImages('png')}
                    disabled={isExporting}
                    className="gap-1.5 rounded-xl text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    PNG
                  </AnimatedButton>
                </div>
              </motion.div>

              {/* Settings Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowControls(!showControls)}
                className="w-full mt-3 gap-2 rounded-xl"
              >
                <Settings2 className="w-4 h-4" />
                {showControls ? 'Hide' : 'Show'} Controls
              </Button>

              {showControls && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <ControlPanel {...controlPanelProps} />
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Paywall Modal */}
      <PaywallModal
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
      />
    </div>
  );
};

export default Index;
