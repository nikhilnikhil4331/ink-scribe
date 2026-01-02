import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { NoteSettings } from '@/types/notes';
import { HandwrittenText } from './HandwrittenText';
import { splitTextIntoPages, calculateLinesPerPage } from '@/utils/handwriting';

interface PagePreviewProps {
  text: string;
  settings: NoteSettings;
}

export interface PagePreviewHandle {
  getPageElements: () => HTMLElement[];
}

export const PagePreview = forwardRef<PagePreviewHandle, PagePreviewProps>(
  ({ text, settings }, ref) => {
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

    return (
      <div ref={containerRef} className="h-full overflow-y-auto p-6 scrollbar-hide">
        <div className="flex flex-col items-center gap-6">
          {pages.map((pageText, index) => (
            <div
              key={index}
              ref={(el) => { pageRefs.current[index] = el; }}
              className="w-full max-w-[595px] animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <HandwrittenText
                text={pageText}
                settings={settings}
                pageNumber={index + 1}
                totalPages={pages.length}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
);

PagePreview.displayName = 'PagePreview';
