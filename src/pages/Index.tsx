import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BlockEditor } from '@/components/editor/BlockEditor';
import { useBlockEditor } from '@/hooks/useBlockEditor';
import { NotebookPreview, NotebookPreviewHandle } from '@/components/NotebookPreview';
import { PenPalette } from '@/components/PenPalette';
import { ControlPanel } from '@/components/ControlPanel';
import { PageBar } from '@/components/PageBar';
import { MoodSelector } from '@/components/MoodSelector';
import { SlidePanel } from '@/components/SlidePanel';
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
import {
  Settings2, Edit3, FileDown, Palette, Crown, LogIn,
  Gem, MoreVertical, Moon, Sun, RotateCcw, Share2, Image, FileText, Sparkles
} from 'lucide-react';
import { shareAsImage, shareAsPDF } from '@/utils/share';
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar';
import { PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NoteLine, LineInkColor, generateLineId, getDefaultColorForLine, LineHistory } from '@/types/noteLine';
import { InlineDiagram } from '@/types/noteLine';
import { useAutoPagination } from '@/hooks/useAutoPagination';
import { useSpeechDictation } from '@/hooks/useSpeechDictation';
import { PaywallModal } from '@/components/premium/PaywallModal';
import { usePremium, PremiumFeature } from '@/hooks/usePremium';

import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { HeaderProfileButton } from '@/components/HeaderProfileButton';
import { DiagramToolbar } from '@/components/DiagramToolbar';
import { useInlineContent } from '@/hooks/useInlineContent';
import { Toolbar } from '@/components/Toolbar';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(!isMobile); }, [isMobile]);

  const [pageDirection, setPageDirection] = useState<'left' | 'right' | 'none'>('none');
  const [showPenPanel, setShowPenPanel] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);

  // Mobile state
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

  const blockEditor = useBlockEditor();
  const previewLines = blockEditor.blocks.some(b => b.content.trim()) ? blockEditor.lines : lines;

  useEffect(() => { setSelectedLines(new Set()); }, [currentPageIndex]);

  // Mobile tab handler
  const handleMobileTabChange = useCallback((tab: MobileTab) => {
    if (tab === 'style') { setShowMobileStyleSheet(true); return; }
    if (tab === 'ai') { navigate('/ai-solver'); return; }
    setMobileTab(tab);
  }, [navigate]);

  // Editor focus tracking
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
      const n = new Map(prev);
      const h = n.get(lineId) || { past: [], future: [] };
      n.set(lineId, { past: [...h.past.slice(-20), line], future: [] });
      return n;
    });
  }, []);

  const updateLineText = useCallback((lineId: string, text: string) => {
    const idx = lines.findIndex(l => l.id === lineId);
    if (idx === -1) return;
    saveToHistory(lineId, lines[idx]);
    updateCurrentPageLines(lines.map(l => l.id === lineId ? { ...l, text, timestamp: Date.now() } : l));
  }, [lines, saveToHistory, updateCurrentPageLines]);

  const updateLineColor = useCallback((lineId: string, color: LineInkColor) => {
    updateCurrentPageLines(lines.map(l => l.id === lineId ? { ...l, color, timestamp: Date.now() } : l));
  }, [lines, updateCurrentPageLines]);

  const updateSelectedLinesColor = useCallback((color: LineInkColor) => {
    if (selectedLines.size === 0) return;
    updateCurrentPageLines(lines.map(l => selectedLines.has(l.id) ? { ...l, color, timestamp: Date.now() } : l));
    setCurrentColor(color);
  }, [lines, selectedLines, updateCurrentPageLines]);

  const addLine = useCallback((afterLineId?: string): string => {
    const newId = generateLineId();
    const idx = afterLineId ? lines.findIndex(l => l.id === afterLineId) + 1 : lines.length;
    const newLine: NoteLine = { id: newId, text: '', color: getDefaultColorForLine(idx), timestamp: Date.now() };
    const newLines = [...lines];
    newLines.splice(idx, 0, newLine);
    updateCurrentPageLines(newLines);
    return newId;
  }, [lines, updateCurrentPageLines]);

  const removeLine = useCallback((lineId: string) => {
    if (lines.length <= 1) {
      updateCurrentPageLines(lines.map(l => l.id === lineId ? { ...l, text: '', timestamp: Date.now() } : l));
    } else {
      updateCurrentPageLines(lines.filter(l => l.id !== lineId));
    }
    setSelectedLines(prev => { const n = new Set(prev); n.delete(lineId); return n; });
  }, [lines, updateCurrentPageLines]);

  const selectLine = useCallback((lineId: string, multiSelect = false) => {
    setSelectedLines(prev => {
      if (multiSelect) { const n = new Set(prev); if (n.has(lineId)) n.delete(lineId); else n.add(lineId); return n; }
      return new Set([lineId]);
    });
    const line = lines.find(l => l.id === lineId);
    if (line) setCurrentColor(line.color);
  }, [lines]);

  const clearSelection = useCallback(() => { setSelectedLines(new Set()); }, []);

  const autoPagination = useAutoPagination({ settings, lines, updateLines: updateCurrentPageLines, addNewPage, totalPages, currentPageIndex, goToPage });

  const handlePaste = useCallback((rawText: string, atLineId?: string) => {
    const normalized = (rawText ?? '').replace(/\r/g, '');
    const pastedLines = normalized.split('\n');
    if (pastedLines.length <= 1) return;
    const insertIndex = atLineId ? lines.findIndex(l => l.id === atLineId) : lines.length - 1;
    if (insertIndex === -1) return;
    const newLinesData = pastedLines.map((text, i) => ({ id: generateLineId(), text, color: getDefaultColorForLine(insertIndex + i), timestamp: Date.now() + i }));
    const currentLine = lines[insertIndex];
    const baseBefore = (currentLine?.text ?? '') === '' ? lines.slice(0, insertIndex) : lines.slice(0, insertIndex + 1);
    const baseAfter = (currentLine?.text ?? '') === '' ? lines.slice(insertIndex + 1) : lines.slice(insertIndex + 1);
    isPastingRef.current = true;
    let inserted: NoteLine[] = [];
    let lastWorking: NoteLine[] = [...baseBefore, ...baseAfter];
    const batchSize = normalized.length > 500 ? 12 : 30;
    const tick = () => {
      const nextBatch = newLinesData.slice(inserted.length, inserted.length + batchSize);
      inserted = inserted.concat(nextBatch);
      lastWorking = [...baseBefore, ...inserted, ...baseAfter];
      updateCurrentPageLines(lastWorking);
      if (inserted.length < newLinesData.length) { setTimeout(tick, 0); return; }
      requestAnimationFrame(() => { requestAnimationFrame(() => {
        isPastingRef.current = false;
        if (lastWorking.length > autoPagination.linesPerPage) flowOverflowFrom(currentPageIndex, autoPagination.linesPerPage);
      }); });
    };
    tick();
  }, [lines, updateCurrentPageLines, autoPagination.linesPerPage, flowOverflowFrom, currentPageIndex]);

  useEffect(() => {
    if (isPastingRef.current) return;
    if (lines.length > autoPagination.linesPerPage) flowOverflowFrom(currentPageIndex, autoPagination.linesPerPage);
  }, [lines.length, autoPagination.linesPerPage, currentPageIndex, flowOverflowFrom]);

  const undoLine = useCallback((lineId: string) => {
    const h = lineHistories.get(lineId);
    if (!h || h.past.length === 0) return;
    const cur = lines.find(l => l.id === lineId);
    if (!cur) return;
    const prev = h.past[h.past.length - 1];
    setLineHistories(p => { const n = new Map(p); const hh = n.get(lineId)!; n.set(lineId, { past: hh.past.slice(0, -1), future: [cur, ...hh.future] }); return n; });
    updateCurrentPageLines(lines.map(l => l.id === lineId ? prev : l));
  }, [lines, lineHistories, updateCurrentPageLines]);

  const redoLine = useCallback((lineId: string) => {
    const h = lineHistories.get(lineId);
    if (!h || h.future.length === 0) return;
    const cur = lines.find(l => l.id === lineId);
    if (!cur) return;
    const next = h.future[0];
    setLineHistories(p => { const n = new Map(p); const hh = n.get(lineId)!; n.set(lineId, { past: [...hh.past, cur], future: hh.future.slice(1) }); return n; });
    updateCurrentPageLines(lines.map(l => l.id === lineId ? next : l));
  }, [lines, lineHistories, updateCurrentPageLines]);

  const canUndo = useCallback((lineId: string) => { const h = lineHistories.get(lineId); return h ? h.past.length > 0 : false; }, [lineHistories]);
  const canRedo = useCallback((lineId: string) => { const h = lineHistories.get(lineId); return h ? h.future.length > 0 : false; }, [lineHistories]);
  const getPlainText = useCallback(() => lines.map(l => l.text).join('\n'), [lines]);

  const mergeLinesUp = useCallback((lineId: string) => {
    const idx = lines.findIndex(l => l.id === lineId);
    if (idx <= 0) return;
    const merged: NoteLine = { ...lines[idx - 1], text: lines[idx - 1].text + lines[idx].text, timestamp: Date.now() };
    const newLines = [...lines]; newLines[idx - 1] = merged; newLines.splice(idx, 1);
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
    if (!text.trim() && !settings.table.enabled && diagrams.length === 0) {
      toast.error('Please add some content first');
      return;
    }
    
    setIsExporting(true);
    setExportProgress(null);
    triggerHaptic('medium');
    
    const toastId = toast.loading('Preparing PDF...');
    
    try {
      // FIX: Mount offscreen export container with proper dimensions
      setExportMount(true);
      
      // Wait for React to render the offscreen pages
      await new Promise<void>(r => setTimeout(r, 500));
      await document.fonts.ready;
      
      // Try to find export pages in offscreen container first
      let elements: HTMLElement[] = [];
      
      if (exportContainerRef.current) {
        const offscreenPages = exportContainerRef.current.querySelectorAll('[data-export-page="true"]');
        elements = Array.from(offscreenPages) as HTMLElement[];
      }
      
      // Fallback: Use visible preview pages
      if (elements.length === 0) {
        elements = previewRef.current?.getPageElements() ?? [];
      }
      
      // Last fallback: Search entire document for visible export pages
      if (elements.length === 0) {
        const allExportPages = document.querySelectorAll('[data-export-page="true"]');
        elements = Array.from(allExportPages).filter(el => {
          const rect = (el as HTMLElement).getBoundingClientRect();
          return rect.width > 50 && rect.height > 50;
        }) as HTMLElement[];
      }
      
      if (elements.length === 0) {
        throw new Error('No pages found. Make sure the preview is visible with content.');
      }
      
      toast.loading(`Creating PDF: ${elements.length} page(s)...`, { id: toastId });
      
      await exportToPDF(elements, 'handwritten-notes', settings.pageSize, (progress) => {
        setExportProgress(progress);
        toast.loading(`Creating PDF: Page ${progress.current} of ${progress.total} (${progress.percentage}%)`, { id: toastId });
      });
      
      toast.success(elements.length > 1 ? `PDF with ${elements.length} pages exported! 📄` : 'PDF exported! 📄', { id: toastId });
      playSuccess();
      triggerHaptic('success');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error('PDF export error:', msg);
      toast.error(`Export failed: ${msg}`, {
        id: toastId,
        action: { label: 'Retry', onClick: () => handleExportPDF() }
      });
      triggerHaptic('error');
    } finally {
      setIsExporting(false);
      setExportProgress(null);
      setExportMount(false);
    }
  }, [getPlainText, settings.table.enabled, settings.pageSize, diagrams.length, triggerHaptic, playSuccess]);

  const handleReset = useCallback(() => { resetSettings(); triggerHaptic('medium'); toast.success('Settings reset'); }, [resetSettings, triggerHaptic]);

  const handleShareImage = useCallback(async () => {
    setShowShareMenu(false);
    const el = document.querySelector('[data-export-page="true"]') as HTMLElement ?? previewRef.current?.getPageElements()?.[0];
    if (!el) { toast.error('Switch to Preview first'); return; }
    setIsSharing(true);
    try { await shareAsImage(el, 'NikNote'); toast.success('Shared!'); }
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
      if (file) { try { await addImage(file); toast.success('Image added!'); triggerHaptic('success'); } catch { toast.error('Failed'); } }
    };
    input.click();
  }, [addImage, triggerHaptic]);

  const handleAddInlineDiagram = useCallback((diagram: InlineDiagram) => { addInlineDiagram(diagram); toast.success('Shape added!'); triggerHaptic('light'); }, [addInlineDiagram, triggerHaptic]);

  const handleImportText = useCallback((importedLines: string[]) => {
    const flattened = importedLines.flatMap(chunk => String(chunk ?? '').split(/\r?\n/)).map(l => l.replace(/[\t ]+$/g, ''));
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
    enter: (d: string) => ({ x: d === 'right' ? 300 : d === 'left' ? -300 : 0, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: string) => ({ x: d === 'right' ? -300 : d === 'left' ? 300 : 0, opacity: 0, scale: 0.95 })
  };

  // ===================== RENDER =====================
  return (
    <div className={cn("h-[100dvh] flex flex-col overflow-hidden transition-all duration-500", moodStyles.background, glassMode && "glass-mode")}>

      {/* ============ HEADER — Floating Glass Bar ============ */}
      <header className="sticky top-0 z-50 mx-3 mt-2 rounded-2xl bg-white/20 backdrop-blur-2xl border border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.08)] h-14 flex-shrink-0">
        <div className="h-full px-4 lg:px-5 flex items-center justify-between gap-2">
          {/* Left: toggle + logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-white/20" onClick={() => setSidebarOpen(p => !p)}>
              <PanelLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1.5">
              <span className="text-lg">✨</span>
              <h1 className="text-lg font-bold tracking-tight select-none" style={{ fontFamily: "'Satisfy', cursive" }}>
                <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent">Niknote</span>
              </h1>
            </div>
          </div>

          {/* Center: Mood pills (desktop) */}
          {!isMobile && (
            <div className="flex items-center gap-1.5 flex-shrink min-w-0">
              <MoodSelector currentMood={mood} onMoodChange={changeMood} />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGlassMode(p => !p)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200",
                  glassMode
                    ? "bg-white/30 text-foreground shadow-sm backdrop-blur-sm"
                    : "bg-white/10 text-foreground/70 hover:bg-white/20 hover:text-foreground"
                )}
              >
                <Gem className="w-4 h-4" />
                <span className="hidden lg:inline">Glass</span>
              </motion.button>
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isMobile ? (
              <>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate('/ai-solver')}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-semibold text-white bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 shadow-[0_0_16px_rgba(127,90,240,0.4)]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI</span>
                </motion.button>

                <button
                  className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-[11px] font-medium bg-white/15 backdrop-blur-sm text-foreground disabled:opacity-50"
                  disabled={isExporting}
                  onClick={handleExportPDF}
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>{isExporting ? '...' : 'PDF'}</span>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-white/20">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white/80 backdrop-blur-2xl border-white/30">
                    <DropdownMenuItem onClick={() => changeMood('calm')}>☀️ Calm</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeMood('focus')}>✨ Focus</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeMood('dark')}>🌙 Dark</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeMood('vintage')}>☕ Vintage</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeMood('study')}>📖 Study</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setGlassMode(p => !p)}>
                      <Gem className="w-4 h-4 mr-2" /> {glassMode ? 'Disable' : 'Enable'} Glass
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleDark}>
                      {isDark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                      {isDark ? 'Light' : 'Dark'} Mode
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleReset}><RotateCcw className="w-4 h-4 mr-2" /> Reset</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/notebooks')}><FileText className="w-4 h-4 mr-2" /> My Notebooks</DropdownMenuItem>
                    {!premium.isPremium && <DropdownMenuItem onClick={() => navigate('/payment')}><Crown className="w-4 h-4 mr-2" /> Upgrade</DropdownMenuItem>}
                    {user ? <DropdownMenuItem onClick={() => navigate('/account')}>👤 Account</DropdownMenuItem>
                      : <DropdownMenuItem onClick={() => navigate('/login')}><LogIn className="w-4 h-4 mr-2" /> Sign In</DropdownMenuItem>}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Desktop: AI Solver glow button */}
                <motion.div whileTap={{ scale: 0.93 }} whileHover={{ scale: 1.04 }}>
                  <button
                    onClick={() => navigate('/ai-solver')}
                    className="relative group flex items-center gap-2 h-9 px-5 rounded-full font-semibold text-xs text-white bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(127,90,240,0.4)] hover:shadow-[0_0_30px_rgba(127,90,240,0.6)] transition-all"
                  >
                    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 blur-md transition-opacity -z-10" />
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    AI Solver
                  </button>
                </motion.div>

                {user ? <HeaderProfileButton /> : (
                  <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="gap-1.5 rounded-full h-9 px-3 hover:bg-white/20">
                    <LogIn className="w-4 h-4" />
                    <span className="text-xs font-medium">Sign In</span>
                  </Button>
                )}

                <Toolbar onExportPDF={handleExportPDF} onReset={handleReset} isDark={isDark} onToggleDark={toggleDark} isExporting={isExporting} />
              </>
            )}
          </div>
        </div>
      </header>

      {/* ============ MOBILE SIDEBAR DRAWER ============ */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] z-[61]"
            >
              <WorkspaceSidebar isOpen={true} onToggle={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ============ BODY: 3-PANE LAYOUT ============ */}
      <div className="flex flex-1 overflow-hidden min-h-0 mt-2 mx-3 mb-3 gap-3">

        {/* LEFT SIDEBAR — desktop only */}
        {!isMobile && (
          <AnimatePresence>
            {sidebarOpen && (
              <div className="rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
                <WorkspaceSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
              </div>
            )}
          </AnimatePresence>
        )}

        {/* ======== CENTER CONTENT ======== */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden gap-3">

          {/* Page Bar */}
          <div className="flex-shrink-0 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/25 shadow-sm px-3 py-1.5">
            <div className="max-w-4xl mx-auto">
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

          {/* ---- MOBILE CONTENT ---- */}
          {isMobile && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 pb-20">
                <AnimatePresence mode="wait">
                  {mobileTab === 'write' && (
                    <motion.div key="write" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <div className={cn("rounded-2xl border border-white/25 bg-white/30 backdrop-blur-xl p-3 shadow-sm", moodStyles.paper)}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Edit3 className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm">Niknote</h3>
                              <p className="text-[10px] text-muted-foreground">
                                {blockEditor.blocks.reduce((t, b) => t + b.content.trim().split(/\s+/).filter(Boolean).length, 0)} words • {blockEditor.blocks.length} blocks • Page {currentPageIndex + 1}/{totalPages}
                              </p>
                            </div>
                          </div>
                          <DiagramToolbar onAddDiagram={handleAddInlineDiagram} onAddImage={handleImageUpload} />
                        </div>
                        <AnimatePresence mode="wait" custom={pageDirection}>
                          <motion.div key={currentPage.id} custom={pageDirection} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                            <BlockEditor blocks={blockEditor.blocks} onBlocksChange={blockEditor.setBlocks} currentColor={currentColor} />
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                  {mobileTab === 'preview' && (
                    <motion.div key="preview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                      <div className="rounded-2xl border border-white/25 bg-white/30 backdrop-blur-xl shadow-sm overflow-hidden min-h-[70vh] relative">
                        <AnimatePresence mode="wait" custom={pageDirection}>
                          <motion.div key={currentPage.id} custom={pageDirection} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                            <NotebookPreview ref={previewRef} lines={previewLines} settings={settings} realPenMode={realPenMode} pageNumber={currentPageIndex + 1} totalPages={totalPages} inlineContent={inlineContent} onUpdateContent={updateContent} onDeleteContent={removeContent} />
                          </motion.div>
                        </AnimatePresence>
                        <div className="absolute bottom-3 right-3 z-10">
                          <div className="relative">
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowShareMenu(v => !v)} disabled={isSharing} className="h-10 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-white/30 backdrop-blur-sm text-foreground border border-white/25 shadow-md disabled:opacity-50">
                              <Share2 className="w-3.5 h-3.5" /> Share
                            </motion.button>
                            {showShareMenu && (
                              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-12 right-0 bg-white/80 backdrop-blur-2xl border border-white/30 rounded-xl shadow-xl p-1 min-w-[140px] z-50">
                                <button onClick={handleShareImage} className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-white/40 transition-colors text-foreground"><Image className="w-3.5 h-3.5 text-muted-foreground" /> As Image</button>
                                <button onClick={handleSharePDF} className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg hover:bg-white/40 transition-colors text-foreground"><FileText className="w-3.5 h-3.5 text-muted-foreground" /> As PDF</button>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* ---- DESKTOP 3-PANE CONTENT ---- */}
          {!isMobile && (
            <div className="flex-1 flex overflow-hidden min-h-0 gap-3">
              {/* Editor pane — glass card */}
              <div className="w-[380px] xl:w-[420px] flex-shrink-0 rounded-2xl bg-white/25 backdrop-blur-xl border border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col">
                <ScrollArea className="flex-1">
                  <div className="p-4">
                    <div className={cn("rounded-xl bg-white/40 backdrop-blur-sm p-4", moodStyles.paper)}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Edit3 className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-foreground">Niknote</h3>
                            <p className="text-[11px] text-muted-foreground">{lines.length} line(s) • Page {currentPageIndex + 1}/{totalPages}</p>
                          </div>
                        </div>
                      </div>
                      <AnimatePresence mode="wait" custom={pageDirection}>
                        <motion.div key={currentPage.id} custom={pageDirection} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                          <BlockEditor blocks={blockEditor.blocks} onBlocksChange={blockEditor.setBlocks} currentColor={currentColor} />
                        </motion.div>
                      </AnimatePresence>
                      <div className="mt-4">
                        <DiagramToolbar onAddDiagram={handleAddInlineDiagram} onAddImage={handleImageUpload} />
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>

              {/* Preview pane (center) — glass card */}
              <div className="flex-1 overflow-hidden flex flex-col min-w-0 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
                <ScrollArea className="flex-1">
                  <div className="p-4">
                    <div className="rounded-xl bg-white/40 backdrop-blur-sm overflow-hidden min-h-[calc(100vh-14rem)]">
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
                            if (info.offset.x > 80 || info.velocity.x > 400) handlePrevPage();
                            else if (info.offset.x < -80 || info.velocity.x < -400) handleNextPage();
                          }}
                        >
                          <NotebookPreview
                            ref={previewRef}
                            lines={previewLines}
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
                    </div>
                  </div>
                </ScrollArea>
              </div>

              {/* Right: Pen Palette pane — glass card */}
              <div className="w-[280px] xl:w-[300px] flex-shrink-0 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col">
                <ScrollArea className="flex-1">
                  <div className="p-3">
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
                    <div className="mt-3 p-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/20">
                      <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Export</h4>
                      <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting} className="gap-1.5 rounded-xl text-xs w-full bg-white/30 border-white/25 hover:bg-white/40">
                        <FileDown className="w-3.5 h-3.5" /> Export PDF
                      </Button>
                    </div>

                    {/* Page Controls toggle */}
                    <div className="mt-3">
                      <Button variant="ghost" size="sm" onClick={() => setShowControls(!showControls)} className="w-full gap-2 rounded-xl text-xs hover:bg-white/20">
                        <Settings2 className="w-4 h-4" /> {showControls ? 'Hide' : 'Show'} Controls
                      </Button>
                      <AnimatePresence>
                        {showControls && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
                            <ControlPanel {...controlPanelProps} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* ============ MOBILE PANELS ============ */}
      <SlidePanel isOpen={showPenPanel} onClose={() => setShowPenPanel(false)} title="Pen Palette" icon={<Palette className="w-4 h-4 text-primary" />} side="right">
        <PenPalette currentColor={currentColor} onColorChange={handleColorChange} selectedCount={selectedLines.size} onUndo={handleUndo} onRedo={handleRedo} canUndo={firstSelectedLineId ? canUndo(firstSelectedLineId) : false} canRedo={firstSelectedLineId ? canRedo(firstSelectedLineId) : false} realPenMode={realPenMode} onRealPenModeChange={setRealPenMode} currentText={getPlainText()} onInsertText={(text) => handlePaste(text)} premiumLocked={!premium.isPremium} onPremiumTap={() => requirePremium('ai_writing')} />
      </SlidePanel>

      <SlidePanel isOpen={showStylePanel} onClose={() => setShowStylePanel(false)} title="Page Style" icon={<Settings2 className="w-4 h-4 text-primary" />} side="right">
        <ControlPanel {...controlPanelProps} />
      </SlidePanel>

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

      {/* Quick Styles Bar (mobile) */}
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

      {/* Mobile Bottom Nav */}
      {isMobile && <MobileBottomNav activeTab={mobileTab} onTabChange={handleMobileTabChange} />}

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
