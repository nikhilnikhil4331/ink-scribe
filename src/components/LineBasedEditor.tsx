import React, { useRef, useEffect, useCallback } from 'react';
import { NoteLine, LineInkColor, LINE_INK_COLORS, generateRealPenVariation } from '@/types/noteLine';
import { cn } from '@/lib/utils';

interface LineBasedEditorProps {
  lines: NoteLine[];
  selectedLines: Set<string>;
  currentColor: LineInkColor;
  realPenMode: boolean;
  onLineTextChange: (lineId: string, text: string) => void;
  onLineColorChange: (lineId: string, color: LineInkColor) => void;
  onSelectLine: (lineId: string, multiSelect?: boolean) => void;
  onAddLine: (afterLineId: string) => string;
  onRemoveLine: (lineId: string) => void;
  onPaste: (text: string, atLineId?: string) => void;
  onMergeLinesUp: (lineId: string) => void;
}

interface EditableLineProps {
  line: NoteLine;
  lineIndex: number;
  isSelected: boolean;
  realPenMode: boolean;
  onTextChange: (text: string) => void;
  onSelect: (multiSelect?: boolean) => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
  onPaste: (text: string) => void;
  focusRef?: React.RefObject<HTMLInputElement>;
}

const EditableLine: React.FC<EditableLineProps> = ({
  line,
  lineIndex,
  isSelected,
  realPenMode,
  onTextChange,
  onSelect,
  onEnter,
  onBackspaceEmpty,
  onPaste,
  focusRef,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const variation = generateRealPenVariation(lineIndex, realPenMode);
  const inkColor = LINE_INK_COLORS.find(c => c.value === line.color);
  
  // Apply real pen variation to color
  const getInkStyle = () => {
    const baseHsl = inkColor?.hsl || '220 20% 12%';
    const [h, s, l] = baseHsl.split(' ').map(v => parseFloat(v));
    
    if (realPenMode) {
      const adjustedH = h + variation.hueShift;
      const adjustedL = Math.max(10, Math.min(50, l + (variation.thickness - 1) * 20));
      return {
        color: `hsl(${adjustedH} ${s}% ${adjustedL}%)`,
        opacity: variation.opacity,
        fontWeight: variation.thickness > 1 ? 500 : 400,
      };
    }
    
    return { color: `hsl(${baseHsl})` };
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnter();
    } else if (e.key === 'Backspace' && line.text === '') {
      e.preventDefault();
      onBackspaceEmpty();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.includes('\n')) {
      e.preventDefault();
      onPaste(pastedText);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    onSelect(e.ctrlKey || e.metaKey);
    inputRef.current?.focus();
  };

  // Forward ref for focusing
  useEffect(() => {
    if (focusRef && focusRef.current === null) {
      (focusRef as React.MutableRefObject<HTMLInputElement | null>).current = inputRef.current;
    }
  }, [focusRef]);

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative flex items-center min-h-[40px] px-4 py-1 border-l-4 transition-all duration-150 cursor-text group",
        isSelected 
          ? "bg-primary/5 border-l-primary" 
          : "border-l-transparent hover:bg-muted/30 hover:border-l-muted-foreground/30"
      )}
    >
      {/* Line number */}
      <div className="absolute left-[-2rem] w-6 text-right text-[10px] text-muted-foreground/50 font-mono select-none">
        {lineIndex + 1}
      </div>
      
      {/* Ruled line effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border/40" />
      
      {/* Color indicator dot */}
      <div 
        className="w-2 h-2 rounded-full mr-3 flex-shrink-0 shadow-sm"
        style={{ backgroundColor: inkColor?.hex }}
      />
      
      {/* Editable input */}
      <input
        ref={inputRef}
        type="text"
        value={line.text}
        onChange={(e) => onTextChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={lineIndex === 0 ? "Start writing here..." : ""}
        className={cn(
          "flex-1 bg-transparent border-none outline-none font-handwriting-1 text-xl leading-relaxed placeholder:text-muted-foreground/40",
          "focus:outline-none focus-visible:outline-none focus-visible:ring-0"
        )}
        style={getInkStyle()}
      />
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </div>
      )}
    </div>
  );
};

export const LineBasedEditor: React.FC<LineBasedEditorProps> = ({
  lines,
  selectedLines,
  currentColor,
  realPenMode,
  onLineTextChange,
  onLineColorChange,
  onSelectLine,
  onAddLine,
  onRemoveLine,
  onPaste,
  onMergeLinesUp,
}) => {
  const focusRefs = useRef<Map<string, HTMLInputElement | null>>(new Map());
  const lastAddedLineId = useRef<string | null>(null);

  // Focus newly added line
  useEffect(() => {
    if (lastAddedLineId.current) {
      const input = focusRefs.current.get(lastAddedLineId.current);
      if (input) {
        input.focus();
        lastAddedLineId.current = null;
      }
    }
  }, [lines]);

  const handleAddLine = useCallback((afterLineId: string) => {
    const newLineId = onAddLine(afterLineId);
    lastAddedLineId.current = newLineId;
    return newLineId;
  }, [onAddLine]);

  const handleBackspaceEmpty = useCallback((lineId: string, lineIndex: number) => {
    if (lineIndex > 0) {
      // Focus previous line
      const prevLine = lines[lineIndex - 1];
      setTimeout(() => {
        const input = focusRefs.current.get(prevLine.id);
        if (input) {
          input.focus();
          // Move cursor to end
          input.selectionStart = input.selectionEnd = input.value.length;
        }
      }, 0);
      
      onMergeLinesUp(lineId);
    }
  }, [lines, onMergeLinesUp]);

  return (
    <div className="relative bg-paper rounded-xl border border-border/50 shadow-inner overflow-hidden">
      {/* Paper texture overlay */}
      <div className="absolute inset-0 opacity-30 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOCIgbnVtT2N0YXZlcz0iNCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMDMiLz48L3N2Zz4=')]" />
      
      {/* Margin line */}
      <div className="absolute left-8 top-0 bottom-0 w-px bg-margin-color/40" />
      
      {/* Lines container */}
      <div className="relative py-4 pl-10 pr-4 min-h-[400px] max-h-[600px] overflow-y-auto scrollbar-hide">
        {lines.map((line, index) => (
          <EditableLine
            key={line.id}
            line={line}
            lineIndex={index}
            isSelected={selectedLines.has(line.id)}
            realPenMode={realPenMode}
            onTextChange={(text) => onLineTextChange(line.id, text)}
            onSelect={(multiSelect) => onSelectLine(line.id, multiSelect)}
            onEnter={() => handleAddLine(line.id)}
            onBackspaceEmpty={() => handleBackspaceEmpty(line.id, index)}
            onPaste={(text) => onPaste(text, line.id)}
          />
        ))}
        
        {/* Add new line hint */}
        <div 
          className="flex items-center min-h-[40px] px-4 py-1 text-muted-foreground/30 cursor-pointer hover:bg-muted/20 transition-colors"
          onClick={() => handleAddLine(lines[lines.length - 1]?.id)}
        >
          <div className="w-2 h-2 rounded-full mr-3 bg-muted-foreground/20" />
          <span className="text-sm italic">Click to add new line...</span>
        </div>
      </div>
    </div>
  );
};
