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
import { PenLine, Settings2, Eye, Edit3 } from 'lucide-react';
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <PenLine className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-lg text-foreground">HandWrite</h1>
              <p className="text-xs text-muted-foreground">Transform text to handwriting</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowControls(!showControls)}
              className="gap-2 hidden md:flex"
            >
              <Settings2 className="w-4 h-4" />
              {showControls ? 'Hide' : 'Show'} Controls
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
      <main className="container mx-auto px-4 py-6">
        {/* Mobile Tabs */}
        <div className="md:hidden">
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="editor" className="gap-2">
                <Edit3 className="w-4 h-4" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings2 className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="mt-0">
              <div className="bg-card rounded-xl border border-border p-4 animate-fade-in">
                <TextEditor value={text} onChange={setText} />
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-0">
              <div className="bg-muted/50 rounded-xl border border-border min-h-[500px] animate-fade-in">
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
              <div className="bg-card rounded-xl border border-border animate-fade-in">
                <ControlPanel {...controlPanelProps} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-12 gap-6">
          {/* Editor */}
          <div className="col-span-4 animate-fade-in">
            <div className="bg-card rounded-xl border border-border p-5 sticky top-24">
              <TextEditor value={text} onChange={setText} />
            </div>
          </div>

          {/* Preview */}
          <div className={`${showControls ? 'col-span-5' : 'col-span-8'} animate-fade-in transition-all duration-300`}>
            <div className="bg-muted/30 rounded-xl border border-border min-h-[calc(100vh-10rem)]">
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
              <div className="bg-card rounded-xl border border-border sticky top-24 max-h-[calc(100vh-8rem)] overflow-hidden">
                <ControlPanel {...controlPanelProps} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
