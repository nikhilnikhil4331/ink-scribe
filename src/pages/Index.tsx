import React, { useState, useRef, useCallback } from 'react';
import { LineBasedEditor } from '@/components/LineBasedEditor';
import { NotebookPreview, NotebookPreviewHandle } from '@/components/NotebookPreview';
import { PenPalette } from '@/components/PenPalette';
import { ControlPanel } from '@/components/ControlPanel';
import { Toolbar } from '@/components/Toolbar';
import { useNoteSettings } from '@/hooks/useNoteSettings';
import { useNoteLines } from '@/hooks/useNoteLines';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useDiagrams } from '@/hooks/useDiagrams';
import { useTableData } from '@/hooks/useTableData';
import { exportToPDF, exportAllPagesToImages } from '@/utils/export';
import { toast } from 'sonner';
import { PenLine, Settings2, Eye, Edit3, Sparkles, ChevronRight, FileDown, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const { settings, updateSettings, updateMargins, updateHeaderFooter, resetSettings } = useNoteSettings();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { diagrams, addDiagram, removeDiagram, updateDiagram } = useDiagrams();
  const { tableData, updateTableData } = useTableData(settings.table.rows, settings.table.columns);
  const previewRef = useRef<NotebookPreviewHandle>(null);

  const {
    lines,
    selectedLines,
    currentColor,
    realPenMode,
    setRealPenMode,
    setCurrentColor,
    updateLineText,
    updateLineColor,
    updateSelectedLinesColor,
    addLine,
    removeLine,
    selectLine,
    clearSelection,
    handlePaste,
    undoLine,
    redoLine,
    canUndo,
    canRedo,
    getPlainText,
    mergeLinesUp,
  } = useNoteLines();

  // Get first selected line for undo/redo
  const firstSelectedLineId = selectedLines.size > 0 ? Array.from(selectedLines)[0] : null;

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
    try {
      await exportToPDF(elements, 'handwritten-notes', settings.pageSize);
      toast.success('PDF exported successfully!');
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  }, [getPlainText, settings.table.enabled, settings.pageSize, diagrams.length]);

  const handleExportImages = useCallback(async (format: 'png' | 'jpeg') => {
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
    try {
      await exportAllPagesToImages(elements, format, 'handwritten-note');
      toast.success(`${format.toUpperCase()} images exported successfully!`);
    } catch (error) {
      toast.error(`Failed to export ${format.toUpperCase()}`);
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  }, [getPlainText, settings.table.enabled, diagrams.length]);

  const handleReset = useCallback(() => {
    resetSettings();
    toast.success('Settings reset to defaults');
  }, [resetSettings]);

  const handleColorChange = useCallback((color: typeof currentColor) => {
    if (selectedLines.size > 0) {
      updateSelectedLinesColor(color);
    }
    setCurrentColor(color);
  }, [selectedLines, updateSelectedLinesColor, setCurrentColor]);

  const handleUndo = useCallback(() => {
    if (firstSelectedLineId) {
      undoLine(firstSelectedLineId);
    }
  }, [firstSelectedLineId, undoLine]);

  const handleRedo = useCallback(() => {
    if (firstSelectedLineId) {
      redoLine(firstSelectedLineId);
    }
  }, [firstSelectedLineId, redoLine]);

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
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/20">
              <PenLine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground tracking-tight">Nik Note</h1>
              <p className="text-[11px] text-muted-foreground font-medium">Realistic handwritten notes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowControls(!showControls)}
              className="gap-2 hidden lg:flex hover:bg-secondary/80 rounded-xl"
            >
              <Settings2 className="w-4 h-4" />
              <span className="text-sm">{showControls ? 'Hide' : 'Show'} Controls</span>
              <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${showControls ? 'rotate-180' : ''}`} />
            </Button>
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-6 py-6">
        {/* Mobile Tabs */}
        <div className="lg:hidden">
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4 p-1 h-12 bg-secondary/50 rounded-2xl">
              <TabsTrigger value="editor" className="gap-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Edit3 className="w-4 h-4" />
                <span className="text-xs font-medium">Write</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Eye className="w-4 h-4" />
                <span className="text-xs font-medium">Preview</span>
              </TabsTrigger>
              <TabsTrigger value="colors" className="gap-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <PenLine className="w-4 h-4" />
                <span className="text-xs font-medium">Pens</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Settings2 className="w-4 h-4" />
                <span className="text-xs font-medium">Style</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="mt-0">
              <div className="panel-card p-4 animate-fade-in">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="section-icon">
                    <Edit3 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Notebook</h3>
                    <p className="text-[11px] text-muted-foreground">{lines.length} line(s) • Click to select</p>
                  </div>
                </div>
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
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-0">
              <div className="bg-muted/30 rounded-2xl border border-border/50 min-h-[500px] animate-fade-in overflow-hidden">
                <NotebookPreview 
                  ref={previewRef} 
                  lines={lines}
                  settings={settings}
                  realPenMode={realPenMode}
                />
              </div>
            </TabsContent>

            <TabsContent value="colors" className="mt-0">
              <div className="animate-fade-in">
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
                />
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-0">
              <div className="panel-card animate-fade-in overflow-hidden">
                <ControlPanel {...controlPanelProps} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Layout - Notebook Left, Preview Center, Palette Right */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-5">
          {/* Notebook Editor */}
          <div className="col-span-4 animate-fade-in">
            <div className="panel-card p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="section-icon">
                    <Edit3 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Notebook</h3>
                    <p className="text-[11px] text-muted-foreground">{lines.length} line(s) • Ctrl+click to multi-select</p>
                  </div>
                </div>
              </div>
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
            </div>
          </div>

          {/* Preview */}
          <div className={`${showControls ? 'col-span-5' : 'col-span-6'} animate-fade-in transition-all duration-500 ease-out`}>
            <div className="bg-gradient-to-b from-muted/20 to-muted/40 rounded-2xl border border-border/50 min-h-[calc(100vh-10rem)] overflow-hidden shadow-inner">
              <NotebookPreview 
                ref={previewRef} 
                lines={lines}
                settings={settings}
                realPenMode={realPenMode}
              />
            </div>
          </div>

          {/* Pen Palette + Controls */}
          <div className={`${showControls ? 'col-span-3' : 'col-span-2'} animate-slide-in-right space-y-4`}>
            {/* Pen Palette */}
            <div className="sticky top-24">
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
              />

              {/* Quick Export Buttons */}
              <div className="mt-4 p-4 bg-card rounded-2xl border border-border/80 shadow-sm">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Export</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="gap-1.5 rounded-xl text-xs"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportImages('png')}
                    disabled={isExporting}
                    className="gap-1.5 rounded-xl text-xs"
                  >
                    <Image className="w-3.5 h-3.5" />
                    PNG
                  </Button>
                </div>
              </div>

              {/* Advanced Controls toggle */}
              {showControls && (
                <div className="mt-4 panel-card max-h-[400px] overflow-y-auto">
                  <ControlPanel {...controlPanelProps} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Floating hint for first-time users */}
      {lines.length === 1 && lines[0].text === '' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 animate-fade-in hidden lg:flex items-center gap-2 bg-card border border-border/80 shadow-lg rounded-full px-5 py-3">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm text-muted-foreground">Start typing in the notebook to see your handwritten notes</span>
        </div>
      )}
    </div>
  );
};

export default Index;
