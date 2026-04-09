import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, ChevronLeft, ChevronRight, Loader2, Crown } from 'lucide-react';
import { NoteSettings } from '@/types/notes';
import { NotebookPreview } from '@/components/NotebookPreview';
import { Button } from '@/components/ui/button';
import { NoteLine } from '@/types/noteLine';
import { cn } from '@/lib/utils';

interface Page {
  id: string;
  lines: NoteLine[];
}

interface StepPreviewProps {
  settings: NoteSettings;
  pages: Page[];
  currentPageIndex: number;
  totalPages: number;
  onGoToPage: (index: number) => void;
  onExportPDF: () => void;
  isExporting: boolean;
  isPremium: boolean;
}

export const StepPreview: React.FC<StepPreviewProps> = ({
  settings, pages, currentPageIndex, totalPages,
  onGoToPage, onExportPDF, isExporting, isPremium,
}) => {
  const previewContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="h-full flex flex-col bg-muted/20">
      {/* A4 Preview - Scrollable & Zoomable */}
      <div
        ref={previewContainerRef}
        className="flex-1 overflow-auto p-3 flex items-start justify-center"
      >
        <div className="w-full max-w-[400px] mx-auto">
          {pages.map((page, idx) => (
            <div
              key={page.id}
              data-export-page="true"
              className={cn("mb-4", idx !== currentPageIndex && "hidden")}
            >
              <NotebookPreview
                lines={page.lines}
                settings={settings}
                inlineContent={[]}
                diagrams={[]}
                tableData={[]}
                isExporting={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Page Navigation Dots */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-2">
          <button
            onClick={() => onGoToPage(Math.max(0, currentPageIndex - 1))}
            disabled={currentPageIndex === 0}
            className="p-1 rounded-full text-muted-foreground disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => (
              <button
                key={i}
                onClick={() => onGoToPage(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === currentPageIndex ? "bg-primary w-5" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <button
            onClick={() => onGoToPage(Math.min(totalPages - 1, currentPageIndex + 1))}
            disabled={currentPageIndex >= totalPages - 1}
            className="p-1 rounded-full text-muted-foreground disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Bar */}
      <div className="px-3 pb-20 pt-2 flex gap-2">
        <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
          <Button
            onClick={onExportPDF}
            disabled={isExporting}
            className="w-full gap-2 h-12 rounded-xl text-sm font-semibold"
          >
            {isExporting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Exporting...</>
            ) : (
              <><Download className="w-4 h-4" /> Export PDF</>
            )}
          </Button>
        </motion.div>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            className="h-12 w-12 rounded-xl p-0"
            onClick={() => {/* Share functionality */}}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </motion.div>

        {!isPremium && (
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="h-12 px-3 rounded-xl gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50"
            >
              <Crown className="w-4 h-4" />
              <span className="text-xs">Pro</span>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
