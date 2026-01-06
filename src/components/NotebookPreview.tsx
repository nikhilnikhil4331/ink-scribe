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

const LINES_PER_PAGE = 22;

export const NotebookPreview = forwardRef<NotebookPreviewHandle, NotebookPreviewProps>(
  ({ lines, settings, realPenMode, pageNumber = 1, totalPages = 1 }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

    const fontClass = FONT_OPTIONS.find(f => f.value === settings.font)?.className || 'font-handwriting-1';

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

    const showSpiral = settings.pageStyle === 'spiral';
    const showHolePunches = settings.pageStyle === 'hole-punched';
    const showCornellLayout = settings.pageStyle === 'cornell';
    const isBlueprint = settings.pageStyle === 'blueprint';
    const isKraft = settings.pageStyle === 'kraft';
    const isVintage = settings.pageStyle === 'vintage';

    const paperStyle = useMemo<React.CSSProperties>(() => {
      switch (settings.pageStyle) {
        case 'ruled':
          return {
            backgroundColor: 'hsl(var(--paper-ruled))',
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, hsl(var(--line-color)) 31px, hsl(var(--line-color)) 32px)',
          };
        case 'single-line':
          return {
            backgroundColor: 'hsl(var(--paper))',
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 47px, hsl(var(--line-color)) 47px, hsl(var(--line-color)) 48px)',
          };
        case 'graph':
          return {
            backgroundColor: 'hsl(var(--paper))',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, hsl(var(--line-color) / 0.5) 19px, hsl(var(--line-color) / 0.5) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, hsl(var(--line-color) / 0.5) 19px, hsl(var(--line-color) / 0.5) 20px)',
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
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, hsl(var(--line-color)) 23px, hsl(var(--line-color)) 24px)',
          };
        case 'legal':
          return {
            backgroundColor: 'hsl(50 80% 88%)',
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, hsl(210 40% 70%) 31px, hsl(210 40% 70%) 32px)',
          };
        case 'spiral':
          return {
            backgroundColor: 'hsl(var(--paper-ruled))',
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, hsl(var(--line-color)) 31px, hsl(var(--line-color)) 32px)',
          };
        case 'hole-punched':
          return {
            backgroundColor: 'hsl(var(--paper))',
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, hsl(var(--line-color)) 31px, hsl(var(--line-color)) 32px)',
          };
        case 'vintage':
          return {
            backgroundColor: 'hsl(35 40% 85%)',
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, hsl(25 30% 65% / 0.4) 31px, hsl(25 30% 65% / 0.4) 32px)',
          };
        case 'kraft':
          return {
            backgroundColor: 'hsl(30 35% 55%)',
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, hsl(30 25% 40% / 0.5) 31px, hsl(30 25% 40% / 0.5) 32px)',
          };
        case 'blueprint':
          return {
            backgroundColor: 'hsl(210 60% 25%)',
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, hsl(210 50% 45% / 0.6) 19px, hsl(210 50% 45% / 0.6) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, hsl(210 50% 45% / 0.6) 19px, hsl(210 50% 45% / 0.6) 20px)',
          };
        case 'music-sheet':
          return {
            backgroundColor: 'hsl(var(--paper))',
            backgroundImage: 'repeating-linear-gradient(transparent 0px, transparent 7px, hsl(var(--line-color)) 7px, hsl(var(--line-color)) 8px, transparent 8px, transparent 15px, hsl(var(--line-color)) 15px, hsl(var(--line-color)) 16px, transparent 16px, transparent 23px, hsl(var(--line-color)) 23px, hsl(var(--line-color)) 24px, transparent 24px, transparent 31px, hsl(var(--line-color)) 31px, hsl(var(--line-color)) 32px, transparent 32px, transparent 39px, hsl(var(--line-color)) 39px, hsl(var(--line-color)) 40px, transparent 40px, transparent 60px)',
          };
        case 'cornell':
          return {
            backgroundColor: 'hsl(var(--paper-ruled))',
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, hsl(var(--line-color)) 31px, hsl(var(--line-color)) 32px)',
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

    const getTextColor = (): string => {
      if (isBlueprint) return 'hsl(200 80% 80%)';
      if (isKraft) return 'hsl(30 15% 25%)';
      return 'hsl(var(--ink-black))';
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
                className={`w-full aspect-[210/297] paper-shadow relative overflow-hidden ${isBlueprint ? 'rounded-none' : ''}`}
                style={{
                  ...paperStyle,
                  paddingTop: `${settings.margins.top}px`,
                  paddingRight: `${settings.margins.right}px`,
                  paddingBottom: `${settings.margins.bottom}px`,
                  paddingLeft: showSpiral ? `${settings.margins.left + 30}px` : `${settings.margins.left}px`,
                }}
              >
                {/* Spiral binding */}
                {showSpiral && (
                  <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col items-center justify-start pt-4 gap-3 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-500">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="w-5 h-5 rounded-full border-2 border-gray-500 dark:border-gray-400 bg-white dark:bg-gray-700 shadow-inner"
                        style={{ boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.1)' }}
                      />
                    ))}
                  </div>
                )}

                {/* Hole punches */}
                {showHolePunches && (
                  <div className="absolute left-3 top-0 bottom-0 flex flex-col items-center justify-center gap-[180px]">
                    {[0, 1, 2].map((i) => (
                      <div 
                        key={i} 
                        className="w-6 h-6 rounded-full bg-gray-400/20 dark:bg-gray-600/30 shadow-inner"
                        style={{ boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.1)' }}
                      />
                    ))}
                  </div>
                )}

                {/* Cornell notes layout */}
                {showCornellLayout && (
                  <>
                    <div className="absolute top-[80px] bottom-[120px] w-0.5" style={{ left: '25%', backgroundColor: 'hsl(var(--margin-color) / 0.6)' }} />
                    <div className="absolute left-0 right-0 h-0.5" style={{ bottom: '120px', backgroundColor: 'hsl(var(--margin-color) / 0.6)' }} />
                    <div className="absolute text-[8px] font-medium text-muted-foreground/50 uppercase tracking-wider" style={{ top: '65px', left: '10px' }}>Cues</div>
                    <div className="absolute text-[8px] font-medium text-muted-foreground/50 uppercase tracking-wider" style={{ top: '65px', left: '27%' }}>Notes</div>
                    <div className="absolute text-[8px] font-medium text-muted-foreground/50 uppercase tracking-wider" style={{ bottom: '105px', left: '10px' }}>Summary</div>
                  </>
                )}

                {/* Margin line */}
                {settings.margins.left > 30 && !showSpiral && (
                  <div className="absolute top-0 bottom-0 w-0.5" style={{ left: `${settings.margins.left - 10}px`, backgroundColor: 'hsl(var(--margin-color) / 0.6)' }} />
                )}

                {/* Vintage paper effects */}
                {isVintage && (
                  <>
                    <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-br from-amber-900/20 via-transparent to-amber-800/10" />
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-amber-800/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-amber-900/15 to-transparent" />
                  </>
                )}

                {/* Header */}
                {settings.headerFooter.showHeader && (
                  <div className={`${fontClass} text-sm mb-4 flex justify-between`} style={{ fontSize: settings.fontSize * 0.6, color: getTextColor() }}>
                    {settings.headerFooter.name && <span>Name: {settings.headerFooter.name}</span>}
                    {settings.headerFooter.rollNo && <span>Roll No: {settings.headerFooter.rollNo}</span>}
                    {settings.headerFooter.subject && <span>Subject: {settings.headerFooter.subject}</span>}
                  </div>
                )}

                {/* Lines content */}
                <div className={`${fontClass} leading-relaxed`} style={{ fontSize: `${settings.fontSize}px`, marginLeft: showCornellLayout ? '26%' : 0 }}>
                  {pageLines.map((line, lineIndex) => {
                    const globalLineIndex = pageIndex * LINES_PER_PAGE + lineIndex;
                    const lineStyle = { ...getLineStyle(line, globalLineIndex) };
                    
                    if (isBlueprint) lineStyle.color = 'hsl(200 80% 85%)';
                    else if (isKraft) lineStyle.color = 'hsl(30 15% 20%)';
                    
                    return (
                      <div key={line.id} style={{ height: `${settings.lineSpacing}px`, display: 'flex', alignItems: 'center', ...lineStyle }}>
                        {line.text.split(' ').map((word, wordIndex) => (
                          <span key={wordIndex} style={{ marginRight: `${settings.wordSpacing}px`, display: 'inline-block' }}>{word}</span>
                        ))}
                        {line.text === '' && <span className="opacity-0">.</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Page number */}
                {settings.headerFooter.showPageNumber && (
                  <div className={`absolute bottom-4 left-0 right-0 ${fontClass} text-center`} style={{ fontSize: settings.fontSize * 0.5, color: getTextColor(), paddingLeft: settings.margins.left, paddingRight: settings.margins.right }}>
                    <span>Page {pageIndex + 1} of {pages.length}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Empty state */}
          {(lines.length === 0 || (lines.length === 1 && lines[0].text === '')) && (
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
