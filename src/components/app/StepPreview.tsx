import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, ChevronLeft, ChevronRight, Share2, Image, FileText } from 'lucide-react';
import { NoteSettings } from '@/types/notes';
import { NotebookPage } from '@/hooks/useNotebookPages';
import { NotebookPreview } from '@/components/NotebookPreview';
import { cn } from '@/lib/utils';
import { shareAsImage, shareAsPDF } from '@/utils/share';
import { toast } from 'sonner';

interface StepPreviewProps {
  settings: NoteSettings;
  pages: NotebookPage[];
  currentPageIndex: number;
  totalPages: number;
  onGoToPage: (index: number) => void;
  onExportPDF: () => void;
  isExporting: boolean;
  isPremium: boolean;
  docTitle?: string;
}

export const StepPreview: React.FC<StepPreviewProps> = ({
  settings, pages, currentPageIndex, totalPages, onGoToPage, onExportPDF, isExporting, isPremium, docTitle = 'NikNote',
}) => {
  const allLines = pages.flatMap(p => p.lines);
  const [isSharing, setIsSharing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleShareImage = useCallback(async () => {
    setShowShareMenu(false);
    const el = document.querySelector('[data-export-page="true"]') as HTMLElement;
    if (!el) { toast.error('No preview available'); return; }
    setIsSharing(true);
    try {
      await shareAsImage(el, docTitle);
      toast.success('Shared as image!');
    } catch (e: any) {
      if (e?.name !== 'AbortError') toast.error('Share failed');
    } finally { setIsSharing(false); }
  }, [docTitle]);

  const handleSharePDF = useCallback(async () => {
    setShowShareMenu(false);
    const els = Array.from(document.querySelectorAll('[data-export-page="true"]')) as HTMLElement[];
    if (!els.length) { toast.error('No preview available'); return; }
    setIsSharing(true);
    try {
      await shareAsPDF(els, docTitle);
      toast.success('PDF ready!');
    } catch (e: any) {
      if (e?.name !== 'AbortError') toast.error('Share failed');
    } finally { setIsSharing(false); }
  }, [docTitle]);

  return (
    <div className="h-full flex flex-col bg-background">
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-2 border-b border-border/30">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => onGoToPage(currentPageIndex - 1)} disabled={currentPageIndex === 0} className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 hover:bg-muted">
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          <span className="text-xs font-medium text-muted-foreground">Page {currentPageIndex + 1} of {totalPages}</span>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => onGoToPage(currentPageIndex + 1)} disabled={currentPageIndex >= totalPages - 1} className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 hover:bg-muted">
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <NotebookPreview lines={allLines} settings={settings} realPenMode={false} />
      </div>

      {/* Export & Share bar */}
      <div className="px-4 py-3 border-t border-border/30 bg-background/95 backdrop-blur-sm mb-16">
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onExportPDF}
            disabled={isExporting || isSharing}
            className={cn(
              "flex-1 h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2",
              "bg-primary text-primary-foreground shadow-lg shadow-primary/25",
              "disabled:opacity-50 active:shadow-md"
            )}
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Creating...' : 'Export PDF'}
          </motion.button>

          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowShareMenu(v => !v)}
              disabled={isSharing}
              className={cn(
                "h-12 px-4 rounded-2xl text-sm font-semibold flex items-center gap-2",
                "bg-secondary text-secondary-foreground border border-border/40",
                "disabled:opacity-50"
              )}
            >
              <Share2 className="w-4 h-4" />
              Share
            </motion.button>

            {showShareMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-14 right-0 bg-popover border border-border rounded-xl shadow-xl p-1 min-w-[160px] z-50"
              >
                <button onClick={handleShareImage} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors text-foreground">
                  <Image className="w-4 h-4 text-muted-foreground" /> As Image
                </button>
                <button onClick={handleSharePDF} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors text-foreground">
                  <FileText className="w-4 h-4 text-muted-foreground" /> As PDF
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
