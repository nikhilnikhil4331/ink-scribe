import { useState, useCallback, useMemo, useRef } from 'react';
import { Block, createBlock, BlockType } from '@/types/block';
import { NoteLine, generateLineId, LineInkColor } from '@/types/noteLine';

/**
 * Hook to manage block-based editor state.
 * Also provides a bridge to convert blocks ↔ lines for backward compatibility
 * with the existing preview/export system.
 */
export const useBlockEditor = () => {
  const [blocks, setBlocks] = useState<Block[]>([createBlock('text', '')]);
  const currentColorRef = useRef<LineInkColor>('black');

  const updateBlocks = useCallback((newBlocks: Block[]) => {
    setBlocks(newBlocks.length > 0 ? newBlocks : [createBlock('text', '')]);
  }, []);

  // Set the current ink color — used for new blocks and color changes
  const setCurrentColor = useCallback((color: LineInkColor) => {
    currentColorRef.current = color;
  }, []);

  // Update color of ALL blocks (when user picks a new color with no selection)
  const updateAllBlockColors = useCallback((color: LineInkColor) => {
    currentColorRef.current = color;
    setBlocks(prev => prev.map(b => ({ ...b, color })));
  }, []);

  // Convert blocks to NoteLine[] for preview compatibility
  const lines: NoteLine[] = useMemo(() => {
    return blocks
      .filter(b => b.type !== 'divider')
      .map((block, i) => {
        let text = block.content;
        // Prepend prefix for preview rendering
        switch (block.type) {
          case 'heading1': text = `# ${text}`; break;
          case 'heading2': text = `## ${text}`; break;
          case 'heading3': text = `### ${text}`; break;
          case 'bullet': text = `• ${text}`; break;
          case 'numbered': text = `${i + 1}. ${text}`; break;
          case 'todo': text = block.checked ? `☑ ${text}` : `☐ ${text}`; break;
          case 'quote': text = `"${text}"`; break;
          case 'callout': text = `💡 ${text}`; break;
          case 'code': text = `  ${text}`; break;
        }
        return {
          id: `line-${block.id}`,
          text,
          color: (block.color || currentColorRef.current) as LineInkColor,
          timestamp: Date.now(),
        };
      });
  }, [blocks]);

  // Get plain text for export/AI
  const getPlainText = useCallback(() => {
    return blocks.map(b => b.content).join('\n');
  }, [blocks]);

  // Import text (paste) into blocks
  const importText = useCallback((text: string) => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length === 0) return;
    const newBlocks = lines.map(line => createBlock('text', line));
    setBlocks(prev => {
      // If only one empty block, replace it
      if (prev.length === 1 && !prev[0].content.trim()) return newBlocks;
      return [...prev, ...newBlocks];
    });
  }, []);

  return {
    blocks,
    setBlocks: updateBlocks,
    lines,
    getPlainText,
    importText,
    setCurrentColor,
    updateAllBlockColors,
  };
};
