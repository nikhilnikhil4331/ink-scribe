import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LineBasedEditor } from '@/components/LineBasedEditor';
import { NotebookPreview, NotebookPreviewHandle } from '@/components/NotebookPreview';
import { MobileLivePreview } from '@/components/MobileLivePreview';
import { PenPalette } from '@/components/PenPalette';
import { ControlPanel } from '@/components/ControlPanel';
import { Toolbar } from '@/components/Toolbar';
import { PageBar } from '@/components/PageBar';
import { MoodSelector } from '@/components/MoodSelector';
import { SlidePanel } from '@/components/SlidePanel';
import { AnimatedButton } from '@/components/AnimatedButton';
import { MobileBottomNav, MobileTab } from '@/components/MobileBottomNav';
import { MobileStyleSheet } from '@/components/MobileStyleSheet';
import { QuickStylesBar } from '@/components/QuickStylesBar';
import { useNoteSettings } from '@/hooks/useNoteSettings';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useDiagrams } from '@/hooks/useDiagrams';
import { useTableData } from '@/hooks/useTableData';
import { useNotebookPages } from '@/hooks/useNotebookPages';
import { useHaptics } from '@/hooks/useHaptics';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useMood } from '@/hooks/useMood';
import { useIsMobile } from '@/hooks/use-mobile';
import { exportToPDF, ExportProgress } from '@/utils/export';
import { toast } from 'sonner';
import { Settings2, Eye, Edit3, FileDown, Palette, Mic, MicOff, Crown, LogIn, Brain, Gem, MoreVertical, Moon, Sun, RotateCcw, Share2, Image, FileText } from 'lucide-react';
import { shareAsImage, shareAsPDF } from '@/utils/share';
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar';
import { PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NoteLine, LineInkColor, generateLineId, getDefaultColorForLine, LineHistory } from '@/types/noteLine';
import { InlineDiagram } from '@/types/noteLine';
import { useAutoPagination } from '@/hooks/useAutoPagination';
import { useSpeechDictation } from '@/hooks/useSpeechDictation';
import { PaywallModal } from '@/components/premium/PaywallModal';
import { usePremium, PremiumFeature } from '@/hooks/usePremium';
import { AIWritingAssistant } from '@/components/AIWritingAssistant';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { HeaderProfileButton } from '@/components/HeaderProfileButton';
import { DiagramToolbar } from '@/components/DiagramToolbar';
import { useInlineContent } from '@/hooks/useInlineContent';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [glassMode, setGlassMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pageDirection, setPageDirection] = useState<'left' | 'right' | 'none'>('none');
  const [showPenPanel, setShowPenPanel] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showMobileLivePreview, setShowMobileLivePreview] = useState(true);
  const [isMobileLivePreviewExpanded, setIsMobileLivePreviewExpanded] = useState(false);

  // Mobile tab state
  const [mobileTab, setMobileTab] = useState<MobileTab>('write');
  const [showMobileStyleSheet, setShowMobileStyleSheet] = useState(false);
  const [editorFocused, setEditorFocused] = useState(false);

  const { settings, updateSettings, updateMargins, updateHeaderFooter, resetSettings } = useNoteSettings();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { diagrams, addDiagram, removeDiagram, updateDiagram } = useDiagrams();
  const { tableData, updateTableData } = useTableData(settings.table.rows, settings.table.columns);
  const { content: inlineContent, addImage, addDiagram: addInlineDiagram, updateContent, removeContent } = useInlineContent();
  const { mood, changeMood, styles: moodStyles } = useMood();
  const previewRef = useRef<NotebookPreviewHandle>(null);
  const isPastingRef = useRef(false);
  const exportContainerRef = useRef<HTMLDivElement>(null);
  const [exportMount, setExportMount] = useState(false);
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
    onFinalTranscript: (text) => { handlePaste(text); }
  });

  const {
    pages, currentPageIndex, currentPage, totalPages,
    goToPage, nextPage, prevPage, addNewPage, deletePage,
    updateCurrentPageLines, flowOverflowFrom, canGoNext, canGoPrev
  } = useNotebookPages();

  const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set());
  const [currentColor, setCurrentColor] = useState<LineInkColor>('black');
  const [realPenMode, setRealPenMode] = useState(false);
  const [lineHistories, setLineHistories] = useState<Map<string, LineHistory>>(new Map());
  const lines = currentPage.lines;

  useEffect(() => { setSelectedLines(new Set()); }, [currentPageIndex]);

  // When mobile Style tab is tapped, open sheet; AI tab navigates
  const handleMobileTabChange = useCallback((tab: MobileTab) => {
    if (tab === 'style') {
      setShowMobileStyleSheet(true);
      return;
    }
    if (tab === 'ai') {
      navigate('/ai-solver');
      return;
    }
    setMobileTab(tab);
  }, [navigate]);

  // Track editor focus for QuickStylesBar
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'TEXTAREA') setEditorFocused(true);
    };
    const handleFocusOut = (e: FocusEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        setTimeout(() => setEditorFocused(false), 200);
      }
    };
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Line operations
  const saveToHistory = useCallback((lineId: string, line: NoteLine) => {
    setLineHistories((prev) => {
      const newHistories = new Map(prev);
      const history = newHistories.get(lineId) || { past: [], future: [] };
      newHistories.set(lineId, { past: [...history.past.slice(-20), line], future: [] });
      return newHistories;
    });
  }, []);

  const updateLineText = useCallback((lineId: string, text: string) => {
    const lineIndex = lines.findIndex((l) => l.id === lineId);
    if (lineIndex === -1) return;
    saveToHistory(lineId, lines[lineIndex]);
    const newLines = lines.map((line) => line.id === lineId ? { ...line, text, timestamp: Date.now() } : line);
    updateCurrentPageLines(newLines);
  }, [lines, saveToHistory, updateCurrentPageLines]);

  const updateLineColor = useCallback((lineId: string, color: LineInkColor) => {
    const newLines = lines.map((line) => line.id === lineId ? { ...line, color, timestamp: Date.now() } : line);
    updateCurrentPageLines(newLines);
  }, [lines, updateCurrentPageLines]);

  const updateSelectedLinesColor = useCallback((color: LineInkColor) => {
    if (selectedLines.size === 0) return;
    const newLines = lines.map((line) => selectedLines.has(line.id) ? { ...line, color, timestamp: Date.now() } : line);
    updateCurrentPageLines(newLines);
    setCurrentColor(color);
  }, [lines, selectedLines, updateCurrentPageLines]);

  const addLine = useCallback((afterLineId?: string): string => {
    const newId = generateLineId();
    const newLineIndex = afterLineId ? lines.findIndex((l) => l.id === afterLineId) + 1 : lines.length;
    const newLine: NoteLine = { id: newId, text: '', color: getDefaultColorForLine(newLineIndex), timestamp: Date.now() };
    const newLines = [...lines];
    newLines.splice(newLineIndex, 0, newLine);
    updateCurrentPageLines(newLines);
    return newId;
  }, [lines, updateCurrentPageLines]);

  const removeLine = useCallback((lineId: string) => {
    if (lines.length <= 1) {
      const newLines = lines.map((line) => line.id === lineId ? { ...line, text: '', timestamp: Date.now() } : line);
      updateCurrentPageLines(newLines);
    } else {
      updateCurrentPageLines(lines.filter((line) => line.id !== lineId));
    }
    setSelectedLines((prev) => { const next = new Set(prev); next.delete(lineId); return next; });
  }, [lines, updateCurrentPageLines]);

  const selectLine = useCallback((lineId: string, multiSelect = false) => {
    setSelectedLines((prev) => {
      if (multiSelect) { const next = new Set(prev); if (next.has(lineId)) next.delete(lineId); else next.add(lineId); return next; }
      return new Set([lineId]);
    });
    const line = lines.find((l) => l.id === lineId);
    if (line) setCurrentColor(line.color);
  }, [lines]);

  const clearSelection = useCallback(() => { setSelectedLines(new Set()); }, []);

  const autoPagination = useAutoPagination({ settings, lines, updateLines: updateCurrentPageLines, addNewPage, totalPages, currentPageIndex, goToPage });

  const handlePaste = useCallback((rawText: string, atLineId?: string) => {
    const normalized = (rawText ?? '').replace(/\r/g, '');
    const pastedLines = normalized.split('\n');
    if (pastedLines.length <= 1) return;
    const insertIndex = atLineId ? lines.findIndex((l) => l.id === atLineId) : lines.length - 1;
    if (insertIndex === -1) return;
    const newLinesData = pastedLines.map((lineText, i) => ({ id: generateLineId(), text: lineText, color: getDefaultColorForLine(insertIndex + i), timestamp: Date.now() + i }));
    const currentLine = lines[insertIndex];
    const baseBefore = (currentLine?.text ?? '') === '' ? lines.slice(0, insertIndex) : lines.slice(0, insertIndex + 1);
    const baseAfter = (currentLine?.text ?? '') === '' ? lines.slice(insertIndex + 1) : lines.slice(insertIndex + 1);
    const batchSize = normalized.length > 500 ? 12 : 30;
    isPastingRef.current = true;
    let inserted: NoteLine[] = [];
    let lastWorking: NoteLine[] = [...baseBefore, ...baseAfter];
    const tick = () => {
      const nextBatch = newLinesData.slice(inserted.length, inserted.length + batchSize);
      inserted = inserted.concat(nextBatch);
      lastWorking = [...baseBefore, ...inserted, ...baseAfter];
      updateCurrentPageLines(lastWorking);
      if (inserted.length < newLinesData.length) { setTimeout(tick, 0); return; }
      requestAnimationFrame(() => { requestAnimationFrame(() => {
        isPastingRef.current = false;
        const perPage = autoPagination.linesPerPage;
        if (lastWorking.length > perPage) flowOverflowFrom(currentPageIndex, perPage);
      }); });
    };
    tick();
  }, [lines, updateCurrentPageLines, autoPagination.linesPerPage, flowOverflowFrom, currentPageIndex]);

  useEffect(() => {
    if (isPastingRef.current) return;
    if (lines.length > autoPagination.linesPerPage) flowOverflowFrom(currentPageIndex, autoPagination.linesPerPage);
  }, [lines.length, autoPagination.linesPerPage, currentPageIndex, flowOverflowFrom]);

  const undoLine = useCallback((lineId: string) => {
    const history = lineHistories.get(lineId);
    if (!history || history.past.length === 0) return;
    const currentLine = lines.find((l) => l.id === lineId);
    if (!currentLine) return;
    const previousState = history.past[history.past.length - 1];
    setLineHistories((prev) => { const n = new Map(prev); const h = n.get(lineId)!; n.set(lineId, { past: h.past.slice(0, -1), future: [currentLine, ...h.future] }); return n; });
    updateCurrentPageLines(lines.map((line) => line.id === lineId ? previousState : line));
  }, [lines, lineHistories, updateCurrentPageLines]);

  const redoLine = useCallback((lineId: string) => {
    const history = lineHistories.get(lineId);
    if (!history || history.future.length === 0) return;
    const currentLine = lines.find((l) => l.id === lineId);
    if (!currentLine) return;
    const nextState = history.future[0];
    setLineHistories((prev) => { const n = new Map(prev); const h = n.get(lineId)!; n.set(lineId, { past: [...h.past, currentLine], future: h.future.slice(1) }); return n; });
    updateCurrentPageLines(lines.map((line) => line.id === lineId ? nextState : line));
  }, [lines, lineHistories, updateCurrentPageLines]);

  const canUndo = useCallback((lineId: string) => { const h = lineHistories.get(lineId); return h ? h.past.length > 0 : false; }, [lineHistories]);
  const canRedo = useCallback((lineId: string) => { const h = lineHistories.get(lineId); return h ? h.future.length > 0 : false; }, [lineHistories]);
  const getPlainText = useCallback(() => lines.map((l) => l.text).join('\n'), [lines]);

  const mergeLinesUp = useCallback((lineId: string) => {
    const lineIndex = lines.findIndex((l) => l.id === lineId);
    if (lineIndex <= 0) return;
    const currentLine = lines[lineIndex];
    const previousLine = lines[lineIndex - 1];
    const mergedLine: NoteLine = { ...previousLine, text: previousLine.text + currentLine.text, timestamp: Date.now() };
    const newLines = [...lines]; newLines[lineIndex - 1] = mergedLine; newLines.splice(lineIndex, 1);
    updateCurrentPageLines(newLines);
  }, [lines, updateCurrentPageLines]);

  const firstSelectedLineId = selectedLines.size > 0 ? Array.from(selectedLines)[0] : null;

  // Page navigation
  const handleNextPage = useCallback(() => { if (canGoNext) { setPageDirection('right'); triggerHaptic('light'); playClick(); nextPage(); } }, [canGoNext, nextPage, triggerHaptic, playClick]);
  const handlePrevPage = useCallback(() => { if (canGoPrev) { setPageDirection('left'); triggerHaptic('light'); playClick(); prevPage(); } }, [canGoPrev, prevPage, triggerHaptic, playClick]);
  const handleAddPage = useCallback(() => { setPageDirection('right'); triggerHaptic('medium'); playSuccess(); addNewPage(); toast.success('New page added!'); }, [addNewPage, triggerHaptic, playSuccess]);
  const handleDeletePage = useCallback((index: number) => { if (totalPages > 1) { deletePage(index); triggerHaptic('medium'); toast.success('Page deleted'); } }, [deletePage, totalPages, triggerHaptic]);
  const handleGoToPage = useCallback((index: number) => { setPageDirection(index > currentPageIndex ? 'right' : 'left'); triggerHaptic('light'); playClick(); goToPage(index); }, [currentPageIndex, goToPage, triggerHaptic, playClick]);

  const handleExportPDF = useCallback(async () => {
    const text = getPlainText();
    if (!text.trim() && !settings.table.enabled && diagrams.length === 0) { toast.error('Please add some content first'); return; }
    setExportMount(true);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const exportElements = Array.from(exportContainerRef.current?.querySelectorAll('[data-export-page="true"]') ?? []) as HTMLElement[];
    const elements = exportElements.length > 0 ? exportElements : previewRef.current?.getPageElements() ?? [];
    if (!elements || elements.length === 0) { setExportMount(false); toast.error('No pages to export'); return; }
    setIsExporting(true); setExportProgress(null); triggerHaptic('medium');
    const toastId = toast.loading(elements.length > 1 ? `Creating PDF: Page 1 of ${elements.length}...` : 'Creating PDF...');
    try {
      await exportToPDF(elements, 'handwritten-notes', settings.pageSize, (progress) => {
        setExportProgress(progress);
        if (elements.length > 1) toast.loading(`Creating PDF: Page ${progress.current} of ${progress.total} (${progress.percentage}%)`, { id: toastId });
      });
      toast.success(elements.length > 1 ? `PDF with ${elements.length} pages exported successfully!` : 'PDF exported successfully!', { id: toastId });
      playSuccess(); triggerHaptic('success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Export failed: ${message}. Try again.`, { id: toastId, action: { label: 'Retry', onClick: () => handleExportPDF() } });
      triggerHaptic('error');
    } finally { setIsExporting(false); setExportProgress(null); setExportMount(false); }
  }, [getPlainText, settings.table.enabled, settings.pageSize, diagrams.length, triggerHaptic, playSuccess]);

  const handleReset = useCallback(() => { resetSettings(); triggerHaptic('medium'); toast.success('Settings reset to defaults'); }, [resetSettings, triggerHaptic]);


  const handleShareImage = useCallback(async () => {
    setShowShareMenu(false);
    const el = document.querySelector('[data-export-page="true"]') as HTMLElement ?? previewRef.current?.getPageElements()?.[0];
    if (!el) { toast.error('Switch to Preview first'); return; }
    setIsSharing(true);
    try { await shareAsImage(el, 'NikNote'); toast.success('Shared as image!'); }
    catch (e: any) { if (e?.name !== 'AbortError') toast.error('Share failed'); }
    finally { setIsSharing(false); }
  }, []);

  const handleSharePDF = useCallback(async () => {
    setShowShareMenu(false);
    const els = Array.from(document.querySelectorAll('[data-export-page="true"]')) as HTMLElement[];
    if (!els.length) { toast.error('Switch to Preview first'); return; }
    setIsSharing(true);
    try { await shareAsPDF(els, 'NikNote'); toast.success('PDF ready!'); }
    catch (e: any) { if (e?.name !== 'AbortError') toast.error('Share failed'); }
    finally { setIsSharing(false); }
  }, []);
  const handleColorChange = useCallback((color: typeof currentColor) => {
    if (selectedLines.size > 0) updateSelectedLinesColor(color);
    setCurrentColor(color); triggerHaptic('selection'); playClick();
  }, [selectedLines, updateSelectedLinesColor, triggerHaptic, playClick]);

  const handleUndo = useCallback(() => { if (firstSelectedLineId) { undoLine(firstSelectedLineId); triggerHaptic('light'); } }, [firstSelectedLineId, undoLine, triggerHaptic]);
  const handleRedo = useCallback(() => { if (firstSelectedLineId) { redoLine(firstSelectedLineId); triggerHaptic('light'); } }, [firstSelectedLineId, redoLine, triggerHaptic]);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) { try { await addImage(file); toast.success('Image added!'); triggerHaptic('success'); } catch { toast.error('Failed to add image'); } }
    };
    input.click();
  }, [addImage, triggerHaptic]);

  const handleAddInlineDiagram = useCallback((diagram: InlineDiagram) => { addInlineDiagram(diagram); toast.success('Shape added!'); triggerHaptic('light'); }, [addInlineDiagram, triggerHaptic]);

  const handleImportText = useCallback((importedLines: string[]) => {
    const flattened = importedLines.flatMap((chunk) => String(chunk ?? '').split(/\r?\n/)).map((l) => l.replace(/[\t ]+$/g, ''));
    const safeLines = flattened.length > 0 ? flattened : [''];
    const newLines = safeLines.map((text, i) => ({ id: generateLineId(), text, color: getDefaultColorForLine(i) as LineInkColor, timestamp: Date.now() + i }));
    if (newLines.length > 0) { updateCurrentPageLines(newLines); toast.success(`Imported ${newLines.length} lines!`); }
  }, [updateCurrentPageLines]);

  const controlPanelProps = {
    settings, updateSettings, updateMargins, updateHeaderFooter, tableData,
    onTableDataChange: updateTableData, diagrams, onAddDiagram: addDiagram,
    onRemoveDiagram: removeDiagram, onUpdateDiagram: updateDiagram,
    premiumLocked: !premium.isPremium, onPremiumTap: () => requirePremium('ai_style_matcher'),
    onImportText: handleImportText
  };

  const pageVariants = {
    enter: (direction: string) => ({ x: direction === 'right' ? 300 : direction === 'left' ? -300 : 0, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (direction: string) => ({ x: direction === 'right' ? -300 : direction === 'left' ? 300 : 0, opacity: 0, scale: 0.95 })
  };

  return (
    <div className={cn("min-h-screen overflow-x-hidden transition-colors duration-500 relative my-0 py-0 flex flex-col", moodStyles.background, glassMode && "glass-mode")}>
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="sticky top-0 z-50 glass border-b border-white/15 h-14 sm:h-16 flex-shrink-0"
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 h-full flex items-center justify-between overflow-hidden">
          {/* Left: Logo (mobile) or empty (desktop already has mood selector) */}
          {isMobile ? (
            <h1 className="text-lg font-bold text-foreground tracking-tight">NikNote</h1>
          ) : (
            <div />
          )}

          {/* Center: Mood Selector + Glass Toggle (desktop only) */}
          <div className="hidden md:flex items-center gap-2">
            <MoodSelector currentMood={mood} onMoodChange={changeMood} />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setGlassMode((prev) => !prev)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 text-xs font-medium",
                glassMode ? "glass-liquid text-white shadow-lg" : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
              title="Toggle Glass Mode"
            >
              <Gem className="w-4 h-4" />
              <span className="hidden lg:inline">Glass</span>
            </motion.button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Mobile: Export PDF + ⋮ Menu */}
            {isMobile ? (
              <>
                <button
                  className="glass-liquid gap-2 px-3 py-2 text-white font-medium text-xs flex items-center disabled:opacity-50 transition-all duration-200 rounded-xl"
                  disabled={isExporting}
                  onClick={handleExportPDF}
                >
                  <FileDown className="w-4 h-4" />
                  <span>{isExporting ? 'Exporting...' : 'PDF'}</span>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {/* Mood Selector items */}
                    <DropdownMenuItem onClick={() => changeMood('calm')}>☀️ Calm Mode</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeMood('focus')}>✨ Focus Mode</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeMood('dark')}>🌙 Dark Mode</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeMood('vintage')}>☕ Vintage Mode</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeMood('study')}>📖 Study Mode</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setGlassMode(p => !p)}>
                      <Gem className="w-4 h-4 mr-2" /> {glassMode ? 'Disable' : 'Enable'} Glass Mode
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleReset}>
                      <RotateCcw className="w-4 h-4 mr-2" /> Reset Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleDark}>
                      {isDark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                      {isDark ? 'Light Mode' : 'Dark Mode'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/ai-solver')}>
                      <Brain className="w-4 h-4 mr-2" /> AI Solver
                    </DropdownMenuItem>
                    {!premium.isPremium && (
                      <DropdownMenuItem onClick={() => navigate('/payment')}>
                        <Crown className="w-4 h-4 mr-2" /> Upgrade to Pro
                      </DropdownMenuItem>
                    )}
                    {user ? (
                      <DropdownMenuItem onClick={() => navigate('/account')}>
                        👤 Account
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => navigate('/login')}>
                        <LogIn className="w-4 h-4 mr-2" /> Sign In
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Desktop: Full toolbar */}
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="sm" onClick={() => navigate('/ai-solver')} className="gap-1.5 rounded-full border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/50 h-9 px-3 sm:px-4 shadow-sm transition-all duration-200">
                    <Brain className="w-4 h-4" />
                    <span className="hidden sm:inline text-xs font-medium">AI Solver</span>
                  </Button>
                </motion.div>

                {!premium.isPremium && (
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="sm" onClick={() => navigate('/payment')} className="gap-1.5 rounded-full border-amber-500/30 bg-amber-500/5 text-amber-600 hover:bg-amber-500/10 hover:border-amber-500/50 h-9 px-3 sm:px-4 shadow-sm transition-all duration-200">
                      <Crown className="w-4 h-4" />
                      <span className="hidden sm:inline text-xs font-medium">Upgrade</span>
                    </Button>
                  </motion.div>
                )}

                {user ? <HeaderProfileButton /> : (
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="gap-1.5 rounded-full hover:bg-secondary h-9 px-3 sm:px-4 transition-all duration-200">
                      <LogIn className="w-4 h-4" />
                      <span className="hidden sm:inline text-xs font-medium">Sign In</span>
                    </Button>
                  </motion.div>
                )}

                <Toolbar onExportPDF={handleExportPDF} onReset={handleReset} isDark={isDark} onToggleDark={toggleDark} isExporting={isExporting} />
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* Page Bar */}
      <div className="sticky top-14 sm:top-16 z-40 glass-subtle border-b border-white/10 py-1.5 sm:py-2 px-2 sm:px-4 h-14 sm:h-16 flex-shrink-0 overflow-hidden">
        <div className="container mx-auto max-w-4xl h-full flex items-center">
          <PageBar currentPage={currentPageIndex + 1} totalPages={totalPages} onPrevPage={handlePrevPage} onNextPage={handleNextPage} onAddPage={handleAddPage} onDeletePage={handleDeletePage} canGoPrev={canGoPrev} canGoNext={canGoNext} onGoToPage={handleGoToPage} />
        </div>
      </div>

      {/* Mobile Mood Selector — REMOVED on mobile (moved to ⋮ dropdown) */}
      {!isMobile && (
        <div className="md:hidden px-4 py-2 flex items-center gap-2">
          <MoodSelector currentMood={mood} onMoodChange={changeMood} />
        </div>
      )}

      {/* Mobile Floating Buttons — HIDDEN on mobile (replaced by bottom nav + style sheet) */}
      {!isMobile && (
        <div className="fixed bottom-6 right-4 z-30 flex flex-col gap-3 lg:hidden">
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 25 }} whileTap={{ scale: 0.92 }}>
            <AnimatedButton variant="outline" size="icon" onClick={() => { if (!premium.isPremium) return requirePremium('voice_dictation'); if (!quickDictation.isSupported) return; if (quickDictation.isListening) quickDictation.stop(); else quickDictation.start(); }} className="h-14 w-14 rounded-2xl shadow-soft-lg glass-card border-border/50">
              {quickDictation.isListening ? <MicOff className="w-5 h-5 text-primary" /> : <Mic className="w-5 h-5 text-primary" />}
            </AnimatedButton>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.15, type: 'spring', stiffness: 400, damping: 25 }} whileTap={{ scale: 0.92 }}>
            <AIWritingAssistant currentText={getPlainText()} onInsertText={(text) => handlePaste(text)} locked={!premium.isPremium} onLockedTap={() => requirePremium('ai_writing')} />
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 25 }} whileTap={{ scale: 0.92 }}>
            <AnimatedButton variant="outline" size="icon" onClick={() => setShowPenPanel(true)} className="h-14 w-14 rounded-2xl shadow-soft-lg glass-card border-border/50">
              <Palette className="w-5 h-5 text-primary" />
            </AnimatedButton>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.25, type: 'spring', stiffness: 400, damping: 25 }} whileTap={{ scale: 0.92 }}>
            <AnimatedButton variant="outline" size="icon" onClick={() => setShowStylePanel(true)} className="h-14 w-14 rounded-2xl shadow-soft-lg glass-card border-border/50">
              <Settings2 className="w-5 h-5 text-primary" />
            </AnimatedButton>
          </motion.div>
        </div>
      )}

      {/* Slide Panels for non-mobile */}
      <SlidePanel isOpen={showPenPanel} onClose={() => setShowPenPanel(false)} title="Pen Palette" icon={<Palette className="w-4 h-4 text-primary" />} side="right">
        <PenPalette currentColor={currentColor} onColorChange={handleColorChange} selectedCount={selectedLines.size} onUndo={handleUndo} onRedo={handleRedo} canUndo={firstSelectedLineId ? canUndo(firstSelectedLineId) : false} canRedo={firstSelectedLineId ? canRedo(firstSelectedLineId) : false} realPenMode={realPenMode} onRealPenModeChange={setRealPenMode} currentText={getPlainText()} onInsertText={(text) => handlePaste(text)} premiumLocked={!premium.isPremium} onPremiumTap={() => requirePremium('ai_writing')} />
      </SlidePanel>

      <SlidePanel isOpen={showStylePanel} onClose={() => setShowStylePanel(false)} title="Page Style" icon={<Settings2 className="w-4 h-4 text-primary" />} side="right">
        <ControlPanel {...controlPanelProps} />
      </SlidePanel>

      {/* Mobile Style Bottom Sheet */}
      <MobileStyleSheet
        isOpen={showMobileStyleSheet}
        onClose={() => setShowMobileStyleSheet(false)}
        settings={settings}
        updateSettings={updateSettings}
        currentColor={currentColor}
        onColorChange={handleColorChange}
        realPenMode={realPenMode}
        onRealPenModeChange={setRealPenMode}
        isListening={quickDictation.isListening}
        onToggleVoice={() => {
          if (!premium.isPremium) { requirePremium('voice_dictation'); return; }
          if (!quickDictation.isSupported) return;
          if (quickDictation.isListening) quickDictation.stop(); else quickDictation.start();
        }}
      />

      {/* Main Content */}
      <main className={cn(
        "container mx-auto px-2 sm:px-4 lg:px-6 sm:py-6 my-0",
        isMobile ? "pb-20 pt-2" : "pb-28 sm:pb-8 py-[75px]"
      )}>
        {/* ==================== MOBILE LAYOUT ==================== */}
        {isMobile && (
          <div className="lg:hidden">
            <AnimatePresence mode="wait">
              {mobileTab === 'write' && (
                <motion.div
                  key="write"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={cn("glass-panel-elevated p-3", moodStyles.paper)}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Edit3 className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Notebook</h3>
                        <p className="text-[10px] text-muted-foreground">{lines.length} line(s) • Page {currentPageIndex + 1}/{totalPages}</p>
                      </div>
                    </div>
                    <DiagramToolbar onAddDiagram={handleAddInlineDiagram} onAddImage={handleImageUpload} />
                    <div className="mt-2">
                      <AnimatePresence mode="wait" custom={pageDirection}>
                        <motion.div key={currentPage.id} custom={pageDirection} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                          <LineBasedEditor lines={lines} selectedLines={selectedLines} currentColor={currentColor} realPenMode={realPenMode} onLineTextChange={updateLineText} onLineColorChange={updateLineColor} onSelectLine={selectLine} onAddLine={addLine} onRemoveLine={removeLine} onPaste={handlePaste} onMergeLinesUp={mergeLinesUp} />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}

              {mobileTab === 'preview' && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="glass-panel-elevated min-h-[70vh] overflow-hidden relative">
                    <AnimatePresence mode="wait" custom={pageDirection}>
                      <motion.div key={currentPage.id} custom={pageDirection} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                        <NotebookPreview
                          ref={previewRef}
                          lines={lines}
                          settings={settings}
                          realPenMode={realPenMode}
                          pageNumber={currentPageIndex + 1}
                          totalPages={totalPages}
                          inlineContent={inlineContent}
                          onUpdateContent={updateContent}
                          onDeleteContent={removeContent}
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Share floating button */}
                    <div className="absolute bottom-3 right-3 z-10">
                      <div className="relative">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowShareMenu(v => !v)}
                          disabled={isSharing}
                          className="h-10 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-secondary text-secondary-foreground border border-border/40 shadow-md disabled:opacity-50"
                        >
                          <Share2 className="w-3.5 h-3.5" /> Share
                        </motion.button>
                        {showShareMenu && (
                          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-12 right-0 bg-popover border border-border rounded-xl shadow-xl p-1 min-w-[140px] z-50">
                            <button onClick={handleShareImage} className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-muted transition-colors text-foreground">
                              <Image className="w-3.5 h-3.5 text-muted-foreground" /> As Image
                            </button>
                            <button onClick={handleSharePDF} className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-muted transition-colors text-foreground">
                              <FileText className="w-3.5 h-3.5 text-muted-foreground" /> As PDF
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ==================== DESKTOP LAYOUT (unchanged) ==================== */}
        {!isMobile && (
          <>
            {/* Tablet/small desktop tabs */}
            <div className="lg:hidden">
              <Tabs defaultValue="editor" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 p-1.5 h-12 glass-panel rounded-2xl">
                  <TabsTrigger value="editor" className="gap-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    <Edit3 className="w-4 h-4" /><span className="text-xs font-medium">Write</span>
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    <Eye className="w-4 h-4" /><span className="text-xs font-medium">Preview</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="editor" className="mt-0 relative">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("glass-panel-elevated p-4", moodStyles.paper)}>
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center"><Edit3 className="w-4 h-4 text-primary" /></div>
                      <div><h3 className="font-semibold text-sm text-foreground">Notebook</h3><p className="text-[11px] text-muted-foreground">{lines.length} line(s) • Page {currentPageIndex + 1}/{totalPages}</p></div>
                    </div>
                    <div className="mb-3"><DiagramToolbar onAddDiagram={handleAddInlineDiagram} onAddImage={handleImageUpload} /></div>
                    <AnimatePresence mode="wait" custom={pageDirection}>
                      <motion.div key={currentPage.id} custom={pageDirection} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 300, damping: 30 }} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={(_, info) => { if (info.offset.x > 80 || info.velocity.x > 400) handlePrevPage(); else if (info.offset.x < -80 || info.velocity.x < -400) handleNextPage(); }}>
                        <LineBasedEditor lines={lines} selectedLines={selectedLines} currentColor={currentColor} realPenMode={realPenMode} onLineTextChange={updateLineText} onLineColorChange={updateLineColor} onSelectLine={selectLine} onAddLine={addLine} onRemoveLine={removeLine} onPaste={handlePaste} onMergeLinesUp={mergeLinesUp} />
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                  <MobileLivePreview lines={lines} settings={settings} realPenMode={realPenMode} isVisible={showMobileLivePreview} onToggle={() => setIsMobileLivePreviewExpanded((prev) => !prev)} isExpanded={isMobileLivePreviewExpanded} />
                </TabsContent>
                <TabsContent value="preview" className="mt-0">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel-elevated min-h-[500px] overflow-hidden">
                    <AnimatePresence mode="wait" custom={pageDirection}>
                      <motion.div key={currentPage.id} custom={pageDirection} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 300, damping: 30 }} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={(_, info) => { if (info.offset.x > 80 || info.velocity.x > 400) handlePrevPage(); else if (info.offset.x < -80 || info.velocity.x < -400) handleNextPage(); }}>
                        <NotebookPreview ref={previewRef} lines={lines} settings={settings} realPenMode={realPenMode} pageNumber={currentPageIndex + 1} totalPages={totalPages} inlineContent={inlineContent} onUpdateContent={updateContent} onDeleteContent={removeContent} />
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Desktop 3-column layout */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-5">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="col-span-4">
                <div className={cn("glass-panel-elevated p-4 sticky top-36", moodStyles.paper)}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center"><Edit3 className="w-4 h-4 text-primary" /></div>
                      <div><h3 className="font-semibold text-sm text-foreground">Notebook</h3><p className="text-[11px] text-muted-foreground">{lines.length} line(s) • Page {currentPageIndex + 1}/{totalPages}</p></div>
                    </div>
                  </div>
                  <AnimatePresence mode="wait" custom={pageDirection}>
                    <motion.div key={currentPage.id} custom={pageDirection} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                      <LineBasedEditor lines={lines} selectedLines={selectedLines} currentColor={currentColor} realPenMode={realPenMode} onLineTextChange={updateLineText} onLineColorChange={updateLineColor} onSelectLine={selectLine} onAddLine={addLine} onRemoveLine={removeLine} onPaste={handlePaste} onMergeLinesUp={mergeLinesUp} />
                    </motion.div>
                  </AnimatePresence>
                  <div className="mt-4"><DiagramToolbar onAddDiagram={handleAddInlineDiagram} onAddImage={handleImageUpload} /></div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`${showControls ? 'col-span-5' : 'col-span-6'} transition-all duration-500 ease-out`}>
                <div className="glass-panel-elevated min-h-[calc(100vh-10rem)] overflow-hidden">
                  <AnimatePresence mode="wait" custom={pageDirection}>
                    <motion.div key={currentPage.id} custom={pageDirection} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="h-full" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={(_, info) => { if (info.offset.x > 80 || info.velocity.x > 400) handlePrevPage(); else if (info.offset.x < -80 || info.velocity.x < -400) handleNextPage(); }}>
                      <NotebookPreview ref={previewRef} lines={lines} settings={settings} realPenMode={realPenMode} pageNumber={currentPageIndex + 1} totalPages={totalPages} inlineContent={inlineContent} onUpdateContent={updateContent} onDeleteContent={removeContent} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className={`${showControls ? 'col-span-3' : 'col-span-2'} space-y-4`}>
                <div className="sticky top-36">
                  <PenPalette currentColor={currentColor} onColorChange={handleColorChange} selectedCount={selectedLines.size} onUndo={handleUndo} onRedo={handleRedo} canUndo={firstSelectedLineId ? canUndo(firstSelectedLineId) : false} canRedo={firstSelectedLineId ? canRedo(firstSelectedLineId) : false} realPenMode={realPenMode} onRealPenModeChange={setRealPenMode} currentText={getPlainText()} onInsertText={(text) => handlePaste(text)} premiumLocked={!premium.isPremium} onPremiumTap={() => requirePremium('ai_writing')} />
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-4 p-4 glass-panel">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Export</h4>
                    <AnimatedButton variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting} className="gap-1.5 rounded-xl text-xs w-full"><FileDown className="w-3.5 h-3.5" />Export PDF</AnimatedButton>
                  </motion.div>
                  <Button variant="ghost" size="sm" onClick={() => setShowControls(!showControls)} className="w-full mt-3 gap-2 rounded-xl"><Settings2 className="w-4 h-4" />{showControls ? 'Hide' : 'Show'} Controls</Button>
                  {showControls && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4">
                      <ControlPanel {...controlPanelProps} />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </main>

      {/* Quick Styles Bar (mobile only, when editor focused) */}
      {isMobile && mobileTab === 'write' && (
        <QuickStylesBar
          isVisible={editorFocused}
          currentColor={currentColor}
          currentFont={settings.font}
          onColorChange={handleColorChange}
          onFontChange={(font) => updateSettings({ font })}
          onOpenStyleSheet={() => setShowMobileStyleSheet(true)}
        />
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileBottomNav activeTab={mobileTab} onTabChange={handleMobileTabChange} />
      )}

      {/* Offscreen export DOM */}
      {exportMount && (
        <div ref={exportContainerRef} className="fixed left-[-10000px] top-0 pointer-events-none opacity-0" aria-hidden="true">
          <div className="flex flex-col gap-6">
            {pages.map((page, idx) => (
              <div key={page.id} style={{ width: 794, height: 1123 }}>
                <NotebookPreview lines={page.lines} settings={settings} realPenMode={realPenMode} pageNumber={idx + 1} totalPages={pages.length} forExport />
              </div>
            ))}
          </div>
        </div>
      )}

      <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
};

export default Index;
