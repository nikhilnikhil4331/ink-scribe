 import React, { useRef, useEffect, useCallback, useState } from 'react';
import { NoteLine, LineInkColor, LINE_INK_COLORS, generateRealPenVariation } from '@/types/noteLine';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
  onArrowUp: () => void;
  onArrowDown: () => void;
  isNewLine?: boolean;
  onMount?: (el: HTMLInputElement | null) => void;
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
  onArrowUp,
  onArrowDown,
  isNewLine,
  onMount,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const variation = generateRealPenVariation(lineIndex, realPenMode);
  const inkColor = LINE_INK_COLORS.find(c => c.value === line.color);
  
  // Register input ref with parent
  useEffect(() => {
    onMount?.(inputRef.current);
    return () => onMount?.(null);
  }, [onMount]);
  
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
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onArrowUp();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onArrowDown();
    }
  };

 // CRITICAL: Handle paste for both mobile and desktop
   // Must intercept ALL multi-line pastes and create separate NoteLines
   const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
     const pastedText = e.clipboardData.getData('text');
     // Check for any newline character (CRLF, LF, or CR)
     if (/\r?\n|\r/.test(pastedText)) {
       e.preventDefault();
       e.stopPropagation();
       // Delegate to parent handler which will split into multiple lines
       onPaste(pastedText);
     }
   };
 
   // MOBILE-SPECIFIC: Handle paste via input event for mobile browsers
   // Some mobile browsers don't fire ClipboardEvent properly
   const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
     const target = e.target as HTMLInputElement;
     const value = target.value;
     
     // Detect if a paste happened that includes newlines (mobile fallback)
     if (/\r?\n|\r/.test(value)) {
       e.preventDefault();
       // Extract just the pasted content by comparing to original line.text
       const originalText = line.text;
       const pastedContent = value.replace(originalText, '');
       
       if (/\r?\n|\r/.test(pastedContent)) {
         onPaste(value); // Pass entire new value to be split
         return;
       }
     }
     
     // Normal text input (no newlines)
     onTextChange(value);
   };

  const handleClick = (e: React.MouseEvent) => {
    onSelect(e.ctrlKey || e.metaKey);
    inputRef.current?.focus();
  };

  return (
    <motion.div
      initial={isNewLine ? { opacity: 0, y: -8, height: 0 } : false}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 30,
        opacity: { duration: 0.15 }
      }}
      onClick={handleClick}
      className={cn(
        "relative flex items-center min-h-[48px] px-4 sm:px-5 py-2 border-l-4 cursor-text group",
        "transition-colors duration-150 ease-out",
        isSelected 
          ? "bg-primary/5 border-l-primary" 
          : "border-l-transparent hover:bg-muted/30 hover:border-l-muted-foreground/20"
      )}
    >
      {/* Line number */}
      <div className="absolute left-[-1.75rem] sm:left-[-2rem] w-6 text-right text-[10px] text-muted-foreground/40 font-mono select-none">
        {lineIndex + 1}
      </div>
      
      {/* Ruled line effect */}
      <div className="absolute bottom-0 left-4 right-4 h-px bg-border/30" />
      
      {/* Color indicator dot */}
      <motion.div 
        className="w-2.5 h-2.5 rounded-full mr-3 flex-shrink-0 shadow-sm"
        style={{ backgroundColor: inkColor?.hex }}
        whileHover={{ scale: 1.2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      />
      
      {/* Editable input - notebook feel */}
 {/* CRITICAL: Mobile-optimized input with proper paste handling */}
       <input
         ref={inputRef}
         type="text"
         value={line.text}
         onChange={handleInput}
         onKeyDown={handleKeyDown}
         onPaste={handlePaste}
         placeholder={lineIndex === 0 ? "Start writing here..." : ""}
         autoComplete="off"
         autoCorrect="on"
         spellCheck="true"
         // Mobile-specific attributes for better paste handling
         inputMode="text"
         enterKeyHint="next"
         className={cn(
          "flex-1 bg-transparent border-none outline-none font-handwriting-1",
          "text-lg sm:text-xl leading-relaxed tracking-wide",
          "placeholder:text-muted-foreground/30 placeholder:italic",
          "focus:outline-none focus-visible:outline-none focus-visible:ring-0",
          "caret-primary caret-[2px]",
          "selection:bg-primary/20"
        )}
        style={{
          ...getInkStyle(),
          caretColor: 'hsl(var(--primary))',
        }}
      />
      
      {/* Selection indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div 
            className="absolute right-3 top-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const lastAddedLineId = useRef<string | null>(null);
  const [newLineIds, setNewLineIds] = useState<Set<string>>(new Set());
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Handle keyboard visibility for mobile
  useEffect(() => {
    const handleResize = () => {
      const isKeyboard = window.innerHeight < window.outerHeight * 0.75;
      setKeyboardVisible(isKeyboard);
    };
    
    window.visualViewport?.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Focus newly added line with smooth scroll
  useEffect(() => {
    if (lastAddedLineId.current) {
      const input = inputRefs.current.get(lastAddedLineId.current);
      if (input) {
        // Small delay to let animation start
        requestAnimationFrame(() => {
          input.focus();
          
          // Smooth scroll the new line into view
          input.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        });
        
        // Clear the new line animation after it's done
        setTimeout(() => {
          setNewLineIds(prev => {
            const next = new Set(prev);
            next.delete(lastAddedLineId.current!);
            return next;
          });
        }, 300);
        
        lastAddedLineId.current = null;
      }
    }
  }, [lines]);

  const setInputRef = useCallback((lineId: string) => (el: HTMLInputElement | null) => {
    if (el) {
      inputRefs.current.set(lineId, el);
    } else {
      inputRefs.current.delete(lineId);
    }
  }, []);

  const handleAddLine = useCallback((afterLineId: string) => {
    const newLineId = onAddLine(afterLineId);
    lastAddedLineId.current = newLineId;
    setNewLineIds(prev => new Set(prev).add(newLineId));
    return newLineId;
  }, [onAddLine]);

  const handleBackspaceEmpty = useCallback((lineId: string, lineIndex: number) => {
    if (lineIndex > 0) {
      const prevLine = lines[lineIndex - 1];
      const prevInput = inputRefs.current.get(prevLine.id);
      
      // Focus previous line and move cursor to end
      if (prevInput) {
        prevInput.focus();
        // Set cursor position to end after focus
        requestAnimationFrame(() => {
          prevInput.selectionStart = prevInput.selectionEnd = prevInput.value.length;
        });
      }
      
      onMergeLinesUp(lineId);
    }
  }, [lines, onMergeLinesUp]);

  const handleArrowUp = useCallback((lineIndex: number) => {
    if (lineIndex > 0) {
      const prevLine = lines[lineIndex - 1];
      const prevInput = inputRefs.current.get(prevLine.id);
      prevInput?.focus();
    }
  }, [lines]);

  const handleArrowDown = useCallback((lineIndex: number) => {
    if (lineIndex < lines.length - 1) {
      const nextLine = lines[lineIndex + 1];
      const nextInput = inputRefs.current.get(nextLine.id);
      nextInput?.focus();
    }
  }, [lines]);

  const handleAddNewLine = useCallback(() => {
    if (lines.length > 0) {
      handleAddLine(lines[lines.length - 1].id);
    }
  }, [lines, handleAddLine]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative bg-paper rounded-xl border border-border/50 shadow-inner overflow-hidden",
        "transition-all duration-200",
        keyboardVisible && "pb-4"
      )}
    >
      {/* Paper texture overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOCIgbnVtT2N0YXZlcz0iNCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMDMiLz48L3N2Zz4=')]" />
      
      {/* Margin line */}
      <div className="absolute left-8 sm:left-10 top-0 bottom-0 w-px bg-destructive/20" />
      
      {/* Lines container with better scroll behavior */}
      <div 
        className={cn(
          "relative py-3 sm:py-4 pl-10 sm:pl-12 pr-2 sm:pr-4",
          "min-h-[350px] sm:min-h-[400px]",
          "max-h-[calc(100vh-320px)] sm:max-h-[600px]",
          "overflow-y-auto overflow-x-hidden",
          "scroll-smooth scrollbar-hide",
          "focus-within:ring-2 focus-within:ring-primary/10 focus-within:ring-inset"
        )}
        style={{
          // Ensure keyboard doesn't hide content on mobile
          paddingBottom: keyboardVisible ? '120px' : undefined,
        }}
      >
        <AnimatePresence initial={false}>
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
              onArrowUp={() => handleArrowUp(index)}
              onArrowDown={() => handleArrowDown(index)}
              isNewLine={newLineIds.has(line.id)}
              onMount={setInputRef(line.id)}
            />
          ))}
        </AnimatePresence>
        
        {/* Add new line hint */}
        <motion.div 
          className={cn(
            "flex items-center min-h-[44px] sm:min-h-[48px] px-4 sm:px-5 py-2",
            "text-muted-foreground/25 cursor-pointer",
            "hover:bg-muted/20 hover:text-muted-foreground/40",
            "transition-all duration-150 rounded-lg mx-1"
          )}
          onClick={handleAddNewLine}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-2.5 h-2.5 rounded-full mr-3 bg-muted-foreground/15 flex-shrink-0" />
          <span className="text-sm italic select-none">Click or press Enter to add line...</span>
        </motion.div>
      </div>

      {/* Bottom fade for scroll indication */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-paper to-transparent pointer-events-none" />
    </div>
  );
};

// Custom hook for ref forwarding to input
EditableLine.displayName = 'EditableLine';
LineBasedEditor.displayName = 'LineBasedEditor';
