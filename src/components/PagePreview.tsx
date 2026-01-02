import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { NoteSettings, DiagramImage } from '@/types/notes';
import { HandwrittenText } from './HandwrittenText';
import { splitTextIntoPages, calculateLinesPerPage } from '@/utils/handwriting';
import { FileText } from 'lucide-react';

interface PagePreviewProps {
  text: string;
  settings: NoteSettings;
  tableData?: string[][];
  diagrams?: DiagramImage[];
}

export interface PagePreviewHandle {
  getPageElements: () => HTMLElement[];
}

export const PagePreview = forwardRef<PagePreviewHandle, PagePreviewProps>(
  ({ text, settings, tableData = [], diagrams = [] }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Calculate pages
    const pageHeight = 842; // A4 height in pixels at 72 DPI
    const linesPerPage = calculateLinesPerPage(
      pageHeight,
      settings.lineSpacing,
      settings.margins.top,
      settings.margins.bottom,
      settings.headerFooter.showHeader,
      settings.headerFooter.showPageNumber
    );

    const pages = splitTextIntoPages(text, Math.max(1, linesPerPage));

    useImperativeHandle(ref, () => ({
      getPageElements: () => {
        return pageRefs.current.filter((el): el is HTMLDivElement => el !== null);
      },
    }));

    const isEmpty = !text.trim() && !tableData.some(row => row.some(cell => cell.trim())) && diagrams.length === 0;

    return (
      <div ref={containerRef} className="h-full overflow-y-auto p-6 scroll-smooth">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-medium text-foreground mb-1">No Content Yet</h3>
            <p className="text-sm text-muted-foreground max-w-[240px]">
              Start typing in the editor to see your handwritten notes appear here
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            {pages.map((pageText, index) => (
              <div
                key={index}
                ref={(el) => { pageRefs.current[index] = el; }}
                className="w-full max-w-[595px] animate-scale-in hover-lift"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <HandwrittenText
                  text={pageText}
                  settings={settings}
                  pageNumber={index + 1}
                  totalPages={pages.length}
                  tableData={index === 0 ? tableData : undefined}
                  diagrams={index === 0 ? diagrams : undefined}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

PagePreview.displayName = 'PagePreview';
