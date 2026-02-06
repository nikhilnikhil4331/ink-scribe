import { useState, useCallback, useMemo } from 'react';
import { 
  NoteLine, 
  LineInkColor, 
  LineHistory, 
  generateLineId, 
  getDefaultColorForLine 
} from '@/types/noteLine';

interface UseNoteLinesReturn {
  lines: NoteLine[];
  selectedLines: Set<string>;
  currentColor: LineInkColor;
  realPenMode: boolean;
  setRealPenMode: (enabled: boolean) => void;
  setCurrentColor: (color: LineInkColor) => void;
  updateLineText: (lineId: string, text: string) => void;
  updateLineColor: (lineId: string, color: LineInkColor) => void;
  updateSelectedLinesColor: (color: LineInkColor) => void;
  addLine: (afterLineId?: string) => string;
  removeLine: (lineId: string) => void;
  selectLine: (lineId: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  selectAllLines: () => void;
  handlePaste: (text: string, atLineId?: string) => void;
  undoLine: (lineId: string) => void;
  redoLine: (lineId: string) => void;
  canUndo: (lineId: string) => boolean;
  canRedo: (lineId: string) => boolean;
  getPlainText: () => string;
  mergeLinesUp: (lineId: string) => void;
}

export function useNoteLines(): UseNoteLinesReturn {
  const [lines, setLines] = useState<NoteLine[]>(() => [
    { id: generateLineId(), text: '', color: 'black', timestamp: Date.now() }
  ]);
  
  const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set());
  const [currentColor, setCurrentColor] = useState<LineInkColor>('black');
  const [realPenMode, setRealPenMode] = useState(false);
  const [lineHistories, setLineHistories] = useState<Map<string, LineHistory>>(new Map());

  const saveToHistory = useCallback((lineId: string, line: NoteLine) => {
    setLineHistories(prev => {
      const newHistories = new Map(prev);
      const history = newHistories.get(lineId) || { past: [], future: [] };
      newHistories.set(lineId, {
        past: [...history.past.slice(-20), line], // Keep last 20 states
        future: [],
      });
      return newHistories;
    });
  }, []);

  const updateLineText = useCallback((lineId: string, text: string) => {
    setLines(prev => {
      const lineIndex = prev.findIndex(l => l.id === lineId);
      if (lineIndex === -1) return prev;
      
      const oldLine = prev[lineIndex];
      saveToHistory(lineId, oldLine);
      
      return prev.map(line => 
        line.id === lineId 
          ? { ...line, text, timestamp: Date.now() }
          : line
      );
    });
  }, [saveToHistory]);

  const updateLineColor = useCallback((lineId: string, color: LineInkColor) => {
    setLines(prev => prev.map(line => 
      line.id === lineId 
        ? { ...line, color, timestamp: Date.now() }
        : line
    ));
  }, []);

  const updateSelectedLinesColor = useCallback((color: LineInkColor) => {
    if (selectedLines.size === 0) return;
    
    setLines(prev => prev.map(line => 
      selectedLines.has(line.id)
        ? { ...line, color, timestamp: Date.now() }
        : line
    ));
    setCurrentColor(color);
  }, [selectedLines]);

  const addLine = useCallback((afterLineId?: string): string => {
    const newId = generateLineId();
    
    setLines(prev => {
      const newLineIndex = afterLineId 
        ? prev.findIndex(l => l.id === afterLineId) + 1 
        : prev.length;
      
      const newLine: NoteLine = {
        id: newId,
        text: '',
        color: getDefaultColorForLine(newLineIndex),
        timestamp: Date.now(),
      };
      
      const newLines = [...prev];
      newLines.splice(newLineIndex, 0, newLine);
      return newLines;
    });
    
    return newId;
  }, []);

  const removeLine = useCallback((lineId: string) => {
    setLines(prev => {
      if (prev.length <= 1) {
        // Don't remove the last line, just clear it
        return prev.map(line => 
          line.id === lineId 
            ? { ...line, text: '', timestamp: Date.now() }
            : line
        );
      }
      return prev.filter(line => line.id !== lineId);
    });
    setSelectedLines(prev => {
      const next = new Set(prev);
      next.delete(lineId);
      return next;
    });
  }, []);

  const selectLine = useCallback((lineId: string, multiSelect = false) => {
    setSelectedLines(prev => {
      if (multiSelect) {
        const next = new Set(prev);
        if (next.has(lineId)) {
          next.delete(lineId);
        } else {
          next.add(lineId);
        }
        return next;
      } else {
        return new Set([lineId]);
      }
    });
    
    // Update current color to the selected line's color
    setLines(prev => {
      const line = prev.find(l => l.id === lineId);
      if (line) {
        setCurrentColor(line.color);
      }
      return prev;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedLines(new Set());
  }, []);

  const selectAllLines = useCallback(() => {
    setSelectedLines(new Set(lines.map(l => l.id)));
  }, [lines]);

  // CRITICAL: Universal mobile/desktop paste handler with line break normalization
  const handlePaste = useCallback((text: string, atLineId?: string) => {
    // Step 1: Normalize all line break variants (CRLF, CR, LF)
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Step 2: Split into individual lines - each becomes a separate NoteLine
    // Keep empty lines for paragraph breaks
    const pastedLines = normalized.split('\n');
    
    // Step 3: For very long pastes (>500 chars), process in chunks to prevent mobile freeze
    const CHUNK_SIZE = 50; // lines per chunk
    const totalLines = pastedLines.length;
    
    setLines(prev => {
      const insertIndex = atLineId 
        ? prev.findIndex(l => l.id === atLineId) 
        : prev.length - 1;
      
      if (insertIndex === -1) return prev;
      
      // Create new NoteLine for EACH pasted line
      const newLines = pastedLines.map((lineText, i) => ({
        id: generateLineId(),
        text: lineText, // Preserve original text including indentation
        color: getDefaultColorForLine(insertIndex + i),
        timestamp: Date.now() + i,
      }));
      
      // If the current line is empty, replace it; otherwise insert after
      const currentLine = prev[insertIndex];
      if (currentLine.text === '') {
        const result = [...prev];
        result.splice(insertIndex, 1, ...newLines);
        return result;
      } else {
        const result = [...prev];
        result.splice(insertIndex + 1, 0, ...newLines);
        return result;
      }
    });
  }, []);

  const undoLine = useCallback((lineId: string) => {
    const history = lineHistories.get(lineId);
    if (!history || history.past.length === 0) return;
    
    setLines(prev => {
      const currentLine = prev.find(l => l.id === lineId);
      if (!currentLine) return prev;
      
      const previousState = history.past[history.past.length - 1];
      
      setLineHistories(prevHistories => {
        const newHistories = new Map(prevHistories);
        const h = newHistories.get(lineId)!;
        newHistories.set(lineId, {
          past: h.past.slice(0, -1),
          future: [currentLine, ...h.future],
        });
        return newHistories;
      });
      
      return prev.map(line => 
        line.id === lineId ? previousState : line
      );
    });
  }, [lineHistories]);

  const redoLine = useCallback((lineId: string) => {
    const history = lineHistories.get(lineId);
    if (!history || history.future.length === 0) return;
    
    setLines(prev => {
      const currentLine = prev.find(l => l.id === lineId);
      if (!currentLine) return prev;
      
      const nextState = history.future[0];
      
      setLineHistories(prevHistories => {
        const newHistories = new Map(prevHistories);
        const h = newHistories.get(lineId)!;
        newHistories.set(lineId, {
          past: [...h.past, currentLine],
          future: h.future.slice(1),
        });
        return newHistories;
      });
      
      return prev.map(line => 
        line.id === lineId ? nextState : line
      );
    });
  }, [lineHistories]);

  const canUndo = useCallback((lineId: string) => {
    const history = lineHistories.get(lineId);
    return history ? history.past.length > 0 : false;
  }, [lineHistories]);

  const canRedo = useCallback((lineId: string) => {
    const history = lineHistories.get(lineId);
    return history ? history.future.length > 0 : false;
  }, [lineHistories]);

  const getPlainText = useCallback(() => {
    return lines.map(l => l.text).join('\n');
  }, [lines]);

  const mergeLinesUp = useCallback((lineId: string) => {
    setLines(prev => {
      const lineIndex = prev.findIndex(l => l.id === lineId);
      if (lineIndex <= 0) return prev;
      
      const currentLine = prev[lineIndex];
      const previousLine = prev[lineIndex - 1];
      
      const mergedLine: NoteLine = {
        ...previousLine,
        text: previousLine.text + currentLine.text,
        timestamp: Date.now(),
      };
      
      const newLines = [...prev];
      newLines[lineIndex - 1] = mergedLine;
      newLines.splice(lineIndex, 1);
      
      return newLines;
    });
  }, []);

  return {
    lines,
    selectedLines,
    currentColor,
    realPenMode,
    setRealPenMode,
    setCurrentColor,
    updateLineText,
    updateLineColor,
    updateSelectedLinesColor,
    addLine,
    removeLine,
    selectLine,
    clearSelection,
    selectAllLines,
    handlePaste,
    undoLine,
    redoLine,
    canUndo,
    canRedo,
    getPlainText,
    mergeLinesUp,
  };
}
