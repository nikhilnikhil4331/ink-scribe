import React, { useState, useRef, useCallback } from 'react';
import { TextEditor } from '@/components/TextEditor';
import { PagePreview, PagePreviewHandle } from '@/components/PagePreview';
import { ControlPanel } from '@/components/ControlPanel';
import { Toolbar } from '@/components/Toolbar';
import { useNoteSettings } from '@/hooks/useNoteSettings';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useDiagrams } from '@/hooks/useDiagrams';
import { useTableData } from '@/hooks/useTableData';
import { exportToPDF, exportAllPagesToImages } from '@/utils/export';
import { toast } from 'sonner';
import { PenLine, Settings2, Eye, Edit3, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const [text, setText] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const { settings, updateSettings, updateMargins, updateHeaderFooter, resetSettings } = useNoteSettings();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { diagrams, addDiagram, removeDiagram, updateDiagram } = useDiagrams();
  const { tableData, updateTableData } = useTableData(settings.table.rows, settings.table.columns);
  const previewRef = useRef<PagePreviewHandle>(null);

  const handleExportPDF = useCallback(async () => {
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
      await exportToPDF(elements, 'handwritten-notes');
      toast.success('PDF exported successfully!');
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  }, [text, settings.table.enabled, diagrams.length]);

  const handleExportImages = useCallback(async (format: 'png' | 'jpeg') => {
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
  }, [text, settings.table.enabled, diagrams.length]);

  const handleReset = useCallback(() => {
    resetSettings();
    toast.success('Settings reset to defaults');
  }, [resetSettings]);

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
              <h1 className="font-bold text-lg text-foreground tracking-tight">HandWrite</h1>
              <p className="text-[11px] text-muted-foreground font-medium">Transform text to handwriting</p>
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
            <TabsList className="grid w-full grid-cols-3 mb-4 p-1 h-12 bg-secondary/50 rounded-2xl">
              <TabsTrigger value="editor" className="gap-2 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Edit3 className="w-4 h-4" />
                <span className="text-sm font-medium">Editor</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">Preview</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Settings2 className="w-4 h-4" />
                <span className="text-sm font-medium">Settings</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="mt-0">
              <div className="panel-card p-5 animate-fade-in">
                <TextEditor value={text} onChange={setText} />
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-0">
              <div className="bg-muted/30 rounded-2xl border border-border/50 min-h-[500px] animate-fade-in overflow-hidden">
                <PagePreview 
                  ref={previewRef} 
                  text={text} 
                  settings={settings}
                  tableData={tableData}
                  diagrams={diagrams}
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

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-5">
          {/* Editor */}
          <div className="col-span-4 animate-fade-in">
            <div className="panel-card p-5 sticky top-24">
              <TextEditor value={text} onChange={setText} />
            </div>
          </div>

          {/* Preview */}
          <div className={`${showControls ? 'col-span-5' : 'col-span-8'} animate-fade-in transition-all duration-500 ease-out`}>
            <div className="bg-gradient-to-b from-muted/20 to-muted/40 rounded-2xl border border-border/50 min-h-[calc(100vh-10rem)] overflow-hidden shadow-inner">
              <PagePreview 
                ref={previewRef} 
                text={text} 
                settings={settings}
                tableData={tableData}
                diagrams={diagrams}
              />
            </div>
          </div>

          {/* Controls */}
          {showControls && (
            <div className="col-span-3 animate-slide-in-right">
              <div className="panel-card sticky top-24 max-h-[calc(100vh-8rem)] overflow-hidden">
                <ControlPanel {...controlPanelProps} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating hint for first-time users */}
      {!text && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 animate-fade-in hidden lg:flex items-center gap-2 bg-card border border-border/80 shadow-lg rounded-full px-5 py-3">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm text-muted-foreground">Start typing in the editor to see your handwritten notes</span>
        </div>
      )}
    </div>
  );
};

export default Index;
