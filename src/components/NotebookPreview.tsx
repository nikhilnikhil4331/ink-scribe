import React, { useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import { NoteLine, LINE_INK_COLORS, generateRealPenVariation } from '@/types/noteLine';
import { NoteSettings, FONT_OPTIONS } from '@/types/notes';

interface NotebookPreviewProps {
  lines: NoteLine[];
  settings: NoteSettings;
  realPenMode: boolean;
  pageNumber?: number;
  totalPages?: number;
}

export interface NotebookPreviewHandle {
  getPageElements: () => HTMLElement[];
}

const LINES_PER_PAGE = 22; // Approximate lines per A4 page

export const NotebookPreview = forwardRef<NotebookPreviewHandle, NotebookPreviewProps>(
  ({ lines, settings, realPenMode, pageNumber = 1, totalPages = 1 }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

    const fontClass = FONT_OPTIONS.find(f => f.value === settings.font)?.className || 'font-handwriting-1';

    // Split lines into pages
    const pages = useMemo(() => {
      const result: NoteLine[][] = [];
      for (let i = 0; i < lines.length; i += LINES_PER_PAGE) {
        result.push(lines.slice(i, i + LINES_PER_PAGE));
      }
      return result.length > 0 ? result : [[]];
    }, [lines]);

    useImperativeHandle(ref, () => ({
      getPageElements: () => {
        return pageRefs.current.filter((el): el is HTMLDivElement => el !== null);
      },
    }));

    const paperStyle = useMemo<React.CSSProperties>(() => {
      switch (settings.pageStyle) {
        case 'ruled':
          return {
            backgroundColor: 'hsl(var(--paper-ruled))',
            backgroundImage:
              'repeating-linear-gradient(transparent, transparent 31px, hsl(var(--line-color)) 31px, hsl(var(--line-color)) 32px)',
            backgroundPosition: '0 0',
          };
        case 'single-line':
          return {
            backgroundColor: 'hsl(var(--paper))',
            backgroundImage:
              'repeating-linear-gradient(transparent, transparent 47px, hsl(var(--line-color)) 47px, hsl(var(--line-color)) 48px)',
            backgroundPosition: '0 0',
          };
        case 'graph':
          return {
            backgroundColor: 'hsl(var(--paper))',
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 19px, hsl(var(--line-color) / 0.5) 19px, hsl(var(--line-color) / 0.5) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, hsl(var(--line-color) / 0.5) 19px, hsl(var(--line-color) / 0.5) 20px)',
            backgroundPosition: '0 0',
          };
        case 'dotted':
          return {
            backgroundColor: 'hsl(var(--paper))',
            backgroundImage: 'radial-gradient(circle, hsl(var(--line-color)) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          };
        case 'college':
          return {
            backgroundColor: 'hsl(var(--paper-ruled))',
            backgroundImage:
              'repeating-linear-gradient(transparent, transparent 23px, hsl(var(--line-color)) 23px, hsl(var(--line-color)) 24px)',
            backgroundPosition: '0 0',
          };
        case 'legal':
          return {
            backgroundColor: 'hsl(50 80% 88%)',
            backgroundImage:
              'repeating-linear-gradient(transparent, transparent 31px, hsl(210 40% 70%) 31px, hsl(210 40% 70%) 32px)',
            backgroundPosition: '0 0',
          };
        case 'plain':
        default:
          return {
            backgroundColor: 'hsl(var(--paper))',
          };
      }
    }, [settings.pageStyle]);

    const getLineStyle = (line: NoteLine, lineIndex: number): React.CSSProperties => {
      const inkColor = LINE_INK_COLORS.find(c => c.value === line.color);
      const baseHsl = inkColor?.hsl || '220 20% 12%';
      const [h, s, l] = baseHsl.split(' ').map(v => parseFloat(v));
      const variation = generateRealPenVariation(lineIndex, realPenMode);

      // Natural text jitter
      const jitterX = settings.baselineJitter ? (Math.sin(lineIndex * 7) * 2) : 0;
      const jitterY = settings.baselineJitter ? (Math.cos(lineIndex * 11) * 1.5) : 0;
      const rotation = settings.strokeRandomness ? (Math.sin(lineIndex * 13) * 0.3) : 0;

      if (realPenMode) {
        const adjustedH = h + variation.hueShift;
        const adjustedL = Math.max(10, Math.min(50, l + (variation.thickness - 1) * 20));
        return {
          color: `hsl(${adjustedH} ${s}% ${adjustedL}%)`,
          opacity: variation.opacity,
          fontWeight: variation.thickness > 1 ? 500 : 400,
          transform: `translate(${jitterX}px, ${jitterY}px) rotate(${rotation}deg)`,
        };
      }

      return {
        color: `hsl(${baseHsl})`,
        transform: `translate(${jitterX}px, ${jitterY}px) rotate(${rotation}deg)`,
      };
    };

    return (
      <div ref={containerRef} className="h-full overflow-y-auto p-6 scroll-smooth relative">
        <div className="flex flex-col items-center gap-6">
          {pages.map((pageLines, pageIndex) => (
            <div
              key={pageIndex}
              ref={(el) => { pageRefs.current[pageIndex] = el; }}
              className="w-full max-w-[595px] animate-scale-in hover-lift"
              style={{ animationDelay: `${pageIndex * 50}ms` }}
            >
              <div
                className="w-full aspect-[210/297] paper-shadow relative overflow-hidden"
                style={{
                  ...paperStyle,
                  paddingTop: `${settings.margins.top}px`,
                  paddingRight: `${settings.margins.right}px`,
                  paddingBottom: `${settings.margins.bottom}px`,
                  paddingLeft: `${settings.margins.left}px`,
                }}
              >
                {/* Margin line */}
                {settings.margins.left > 30 && (
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-margin" 
                    style={{ 
                      left: `${settings.margins.left - 10}px`,
                      backgroundColor: 'hsl(var(--margin-color) / 0.6)'
                    }} 
                  />
                )}

                {/* Header */}
                {settings.headerFooter.showHeader && (
                  <div 
                    className={`${fontClass} text-sm mb-4 flex justify-between`} 
                    style={{ 
                      fontSize: settings.fontSize * 0.6,
                      color: 'hsl(var(--ink-black))'
                    }}
                  >
                    {settings.headerFooter.name && <span>Name: {settings.headerFooter.name}</span>}
                    {settings.headerFooter.rollNo && <span>Roll No: {settings.headerFooter.rollNo}</span>}
                    {settings.headerFooter.subject && <span>Subject: {settings.headerFooter.subject}</span>}
                  </div>
                )}

                {/* Lines content */}
                <div className={`${fontClass} leading-relaxed`} style={{ fontSize: `${settings.fontSize}px` }}>
                  {pageLines.map((line, lineIndex) => {
                    const globalLineIndex = pageIndex * LINES_PER_PAGE + lineIndex;
                    return (
                      <div
                        key={line.id}
                        style={{
                          height: `${settings.lineSpacing}px`,
                          display: 'flex',
                          alignItems: 'center',
                          ...getLineStyle(line, globalLineIndex),
                        }}
                      >
                        {line.text.split(' ').map((word, wordIndex) => (
                          <span 
                            key={wordIndex}
                            style={{
                              marginRight: `${settings.wordSpacing}px`,
                              display: 'inline-block',
                            }}
                          >
                            {word}
                          </span>
                        ))}
                        {line.text === '' && (
                          <span className="opacity-0">.</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Page number */}
                {settings.headerFooter.showPageNumber && (
                  <div 
                    className={`absolute bottom-4 left-0 right-0 ${fontClass} text-center`}
                    style={{ 
                      fontSize: settings.fontSize * 0.5,
                      color: 'hsl(var(--ink-black))',
                      paddingLeft: settings.margins.left,
                      paddingRight: settings.margins.right,
                    }}
                  >
                    <span>Page {pageIndex + 1} of {pages.length}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Empty state */}
          {lines.length === 0 || (lines.length === 1 && lines[0].text === '') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h3 className="font-medium text-foreground mb-1">Start Writing</h3>
              <p className="text-sm text-muted-foreground max-w-[240px]">
                Type in the notebook on the left to see your handwritten notes appear here
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

NotebookPreview.displayName = 'NotebookPreview';
