import React from 'react';
import { motion } from 'framer-motion';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { NoteSettings } from '@/types/notes';
import { NotebookPage } from '@/hooks/useNotebookPages';
import { NotebookPreview } from '@/components/NotebookPreview';
import { cn } from '@/lib/utils';

interface StepPreviewProps {
  settings: NoteSettings;
  pages: NotebookPage[];
  currentPageIndex: number;
  totalPages: number;
  onGoToPage: (index: number) => void;
  onExportPDF: () => void;
  isExporting: boolean;
  isPremium: boolean;
}

export const StepPreview: React.FC<StepPreviewProps> = ({
  settings, pages, currentPageIndex, totalPages, onGoToPage, onExportPDF, isExporting, isPremium,
}) => {
  // Combine all pages' lines for the preview
  const allLines = pages.flatMap(p => p.lines);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Page navigation */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-2 border-b border-border/30">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onGoToPage(currentPageIndex - 1)}
            disabled={currentPageIndex === 0}
            className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 hover:bg-muted"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          <span className="text-xs font-medium text-muted-foreground">
            Page {currentPageIndex + 1} of {totalPages}
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onGoToPage(currentPageIndex + 1)}
            disabled={currentPageIndex >= totalPages - 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 hover:bg-muted"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}

      {/* Full-screen preview */}
      <div className="flex-1 overflow-auto">
        <NotebookPreview
          lines={allLines}
          settings={settings}
          realPenMode={false}
        />
      </div>

      {/* Export bar */}
      <div className="px-4 py-3 border-t border-border/30 bg-background/95 backdrop-blur-sm mb-16">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onExportPDF}
          disabled={isExporting}
          className={cn(
            "w-full h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2",
            "bg-primary text-primary-foreground shadow-lg shadow-primary/25",
            "disabled:opacity-50 active:shadow-md"
          )}
        >
          <Download className="w-4.5 h-4.5" />
          {isExporting ? 'Creating PDF...' : 'Export as PDF'}
        </motion.button>
      </div>
    </div>
  );
};
