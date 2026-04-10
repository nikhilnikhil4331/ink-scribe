import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Block, BlockType, createBlock, detectBlockPrefix, generateBlockId } from '@/types/block';
import { SlashCommandMenu } from './SlashCommandMenu';
import { LineInkColor } from '@/types/noteLine';

interface BlockEditorProps {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
  currentColor?: LineInkColor;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ blocks, onBlocksChange, currentColor = 'blue' }) => {
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [slashMenu, setSlashMenu] = useState<{ blockId: string; query: string; position: { top: number; left: number } } | null>(null);
  const inputRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());

  // Focus a block by id
  const focusBlock = useCallback((id: string, cursorPos?: number) => {
    requestAnimationFrame(() => {
      const el = inputRefs.current.get(id);
      if (el) {
        el.focus();
        if (cursorPos !== undefined) {
          el.setSelectionRange(cursorPos, cursorPos);
        }
      }
    });
  }, []);

  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    onBlocksChange(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  }, [blocks, onBlocksChange]);

  const addBlockAfter = useCallback((afterId: string, type: BlockType = 'text', content = ''): string => {
    const newBlock = createBlock(type, content);
    const idx = blocks.findIndex(b => b.id === afterId);
    const newBlocks = [...blocks];
    newBlocks.splice(idx + 1, 0, newBlock);
    onBlocksChange(newBlocks);
    focusBlock(newBlock.id, 0);
    return newBlock.id;
  }, [blocks, onBlocksChange, focusBlock]);

  const removeBlock = useCallback((id: string) => {
    if (blocks.length <= 1) {
      // Don't remove last block, just clear it
      updateBlock(id, { content: '', type: 'text' });
      return;
    }
    const idx = blocks.findIndex(b => b.id === id);
    const prevBlock = blocks[idx - 1];
    onBlocksChange(blocks.filter(b => b.id !== id));
    if (prevBlock) {
      focusBlock(prevBlock.id, prevBlock.content.length);
    }
  }, [blocks, onBlocksChange, updateBlock, focusBlock]);

  const handleTextChange = useCallback((blockId: string, text: string) => {
    // Check for slash command
    if (text === '/') {
      const el = inputRefs.current.get(blockId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setSlashMenu({
          blockId,
          query: '',
          position: { top: rect.bottom + 4, left: rect.left },
        });
      }
      updateBlock(blockId, { content: text });
      return;
    }

    // Update slash menu query
    if (slashMenu?.blockId === blockId && text.startsWith('/')) {
      setSlashMenu(prev => prev ? { ...prev, query: text.slice(1) } : null);
      updateBlock(blockId, { content: text });
      return;
    }

    // Close slash menu if '/' removed
    if (slashMenu?.blockId === blockId && !text.startsWith('/')) {
      setSlashMenu(null);
    }

    // Detect prefix shortcuts (e.g., "# ", "- ", "[] ")
    const prefixMatch = detectBlockPrefix(text);
    if (prefixMatch) {
      updateBlock(blockId, { type: prefixMatch.type, content: prefixMatch.remaining });
      focusBlock(blockId, prefixMatch.remaining.length);
      return;
    }

    updateBlock(blockId, { content: text });
  }, [updateBlock, slashMenu, focusBlock]);

  const handleSlashSelect = useCallback((type: BlockType) => {
    if (!slashMenu) return;
    const { blockId } = slashMenu;
    if (type === 'divider') {
      updateBlock(blockId, { type: 'divider', content: '' });
      addBlockAfter(blockId);
    } else {
      updateBlock(blockId, { type, content: '' });
      focusBlock(blockId, 0);
    }
    setSlashMenu(null);
  }, [slashMenu, updateBlock, addBlockAfter, focusBlock]);

  const handleKeyDown = useCallback((blockId: string, e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    // Don't handle if slash menu is open (it has its own keyboard handler)
    if (slashMenu?.blockId === blockId) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const el = e.currentTarget;
      const cursorPos = el.selectionStart;
      const before = block.content.slice(0, cursorPos);
      const after = block.content.slice(cursorPos);

      // If enter on a list/todo block with no content, convert to text
      if (!block.content.trim() && ['bullet', 'numbered', 'todo'].includes(block.type)) {
        updateBlock(blockId, { type: 'text' });
        return;
      }

      // Split block at cursor
      updateBlock(blockId, { content: before });
      // Continue list type for bullets/numbered/todo
      const nextType = ['bullet', 'numbered', 'todo'].includes(block.type) ? block.type : 'text';
      addBlockAfter(blockId, nextType, after);
    }

    if (e.key === 'Backspace' && e.currentTarget.selectionStart === 0 && e.currentTarget.selectionEnd === 0) {
      // If block type is not text, convert to text first
      if (block.type !== 'text') {
        e.preventDefault();
        updateBlock(blockId, { type: 'text' });
        return;
      }
      // Merge with previous block
      const idx = blocks.findIndex(b => b.id === blockId);
      if (idx > 0) {
        e.preventDefault();
        const prevBlock = blocks[idx - 1];
        if (prevBlock.type === 'divider') {
          removeBlock(prevBlock.id);
          return;
        }
        const mergePos = prevBlock.content.length;
        updateBlock(prevBlock.id, { content: prevBlock.content + block.content });
        removeBlock(blockId);
        focusBlock(prevBlock.id, mergePos);
      }
    }

    if (e.key === 'ArrowUp' && e.currentTarget.selectionStart === 0) {
      const idx = blocks.findIndex(b => b.id === blockId);
      if (idx > 0) {
        e.preventDefault();
        focusBlock(blocks[idx - 1].id, blocks[idx - 1].content.length);
      }
    }

    if (e.key === 'ArrowDown') {
      const el = e.currentTarget;
      if (el.selectionStart === el.value.length) {
        const idx = blocks.findIndex(b => b.id === blockId);
        if (idx < blocks.length - 1) {
          e.preventDefault();
          focusBlock(blocks[idx + 1].id, 0);
        }
      }
    }

    // Tab for indent (todo/bullet/numbered only)
    if (e.key === 'Tab' && ['bullet', 'numbered', 'todo'].includes(block.type)) {
      e.preventDefault();
      const currentIndent = block.indent || 0;
      if (e.shiftKey) {
        updateBlock(blockId, { indent: Math.max(0, currentIndent - 1) });
      } else {
        updateBlock(blockId, { indent: Math.min(3, currentIndent + 1) });
      }
    }
  }, [blocks, slashMenu, updateBlock, addBlockAfter, removeBlock, focusBlock]);

  const handleAddBlock = useCallback(() => {
    const lastBlock = blocks[blocks.length - 1];
    addBlockAfter(lastBlock.id);
  }, [blocks, addBlockAfter]);

  return (
    <div className="block-editor relative">
      <Reorder.Group
        axis="y"
        values={blocks}
        onReorder={onBlocksChange}
        className="space-y-0.5"
      >
        {blocks.map((block, idx) => (
          <BlockContainer
            key={block.id}
            block={block}
            index={idx}
            totalBlocks={blocks.length}
            isFocused={focusedBlockId === block.id}
            onFocus={() => setFocusedBlockId(block.id)}
            onTextChange={(text) => handleTextChange(block.id, text)}
            onKeyDown={(e) => handleKeyDown(block.id, e)}
            onToggleTodo={() => updateBlock(block.id, { checked: !block.checked })}
            onDelete={() => removeBlock(block.id)}
            inputRef={(el) => {
              if (el) inputRefs.current.set(block.id, el);
              else inputRefs.current.delete(block.id);
            }}
          />
        ))}
      </Reorder.Group>

      {/* Add block button */}
      <button
        onClick={handleAddBlock}
        className="flex items-center gap-2 w-full px-3 py-2 mt-1 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors group"
      >
        <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
          Add a block, or type <kbd className="px-1 py-0.5 text-[10px] bg-muted rounded font-mono">/</kbd> for commands
        </span>
      </button>

      {/* Slash Command Menu */}
      <SlashCommandMenu
        isOpen={!!slashMenu}
        query={slashMenu?.query || ''}
        position={slashMenu?.position || { top: 0, left: 0 }}
        onSelect={handleSlashSelect}
        onClose={() => setSlashMenu(null)}
      />
    </div>
  );
};

// Individual block container with drag handle and rendering
interface BlockContainerProps {
  block: Block;
  index: number;
  totalBlocks: number;
  isFocused: boolean;
  onFocus: () => void;
  onTextChange: (text: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onToggleTodo: () => void;
  onDelete: () => void;
  inputRef: (el: HTMLTextAreaElement | null) => void;
}

const BlockContainer: React.FC<BlockContainerProps> = ({
  block, index, isFocused, onFocus, onTextChange, onKeyDown, onToggleTodo, onDelete, inputRef,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [block.content]);

  // Set both refs
  const setRef = useCallback((el: HTMLTextAreaElement | null) => {
    (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
    inputRef(el);
  }, [inputRef]);

  if (block.type === 'divider') {
    return (
      <Reorder.Item value={block} dragListener={false}>
        <div className="group relative flex items-center py-3 px-2">
          <DragHandle />
          <hr className="flex-1 border-t border-border/60" />
          <DeleteButton onDelete={onDelete} />
        </div>
      </Reorder.Item>
    );
  }

  const indentPx = (block.indent || 0) * 24;

  return (
    <Reorder.Item value={block} dragListener={false}>
      <div
        className={cn(
          "group relative flex items-start gap-0 rounded-lg transition-colors min-h-[32px]",
          isFocused && "bg-muted/30"
        )}
        style={{ paddingLeft: indentPx }}
      >
        <DragHandle />

        {/* Block type prefix */}
        <BlockPrefix block={block} onToggleTodo={onToggleTodo} />

        {/* Content area */}
        <textarea
          ref={setRef}
          value={block.content}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          placeholder={getPlaceholder(block.type)}
          rows={1}
          className={cn(
            "flex-1 bg-transparent border-0 outline-none resize-none py-1.5 px-1 text-foreground placeholder:text-muted-foreground/40 leading-relaxed",
            getBlockTextClass(block.type)
          )}
        />

        <DeleteButton onDelete={onDelete} />
      </div>
    </Reorder.Item>
  );
};

// Drag handle (visible on hover)
const DragHandle: React.FC = () => (
  <div className="flex items-center justify-center w-6 h-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing flex-shrink-0 mt-0.5">
    <GripVertical className="w-4 h-4 text-muted-foreground/50" />
  </div>
);

// Delete button (visible on hover)
const DeleteButton: React.FC<{ onDelete: () => void }> = ({ onDelete }) => (
  <button
    onClick={onDelete}
    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex-shrink-0 mt-0.5"
    tabIndex={-1}
  >
    <Trash2 className="w-3.5 h-3.5" />
  </button>
);

// Block type prefix (bullet, number, checkbox, quote bar, etc.)
const BlockPrefix: React.FC<{ block: Block; onToggleTodo: () => void }> = ({ block, onToggleTodo }) => {
  switch (block.type) {
    case 'bullet':
      return (
        <div className="flex items-center justify-center w-6 h-8 flex-shrink-0 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-foreground/70" />
        </div>
      );
    case 'numbered':
      return (
        <div className="flex items-center justify-center w-6 h-8 flex-shrink-0 mt-0.5 text-sm text-muted-foreground font-medium">
          {/* Index would need to be passed — for now show bullet */}
          •
        </div>
      );
    case 'todo':
      return (
        <button
          onClick={onToggleTodo}
          className="flex items-center justify-center w-6 h-8 flex-shrink-0 mt-0.5"
          tabIndex={-1}
        >
          <div className={cn(
            "w-4 h-4 rounded border-2 transition-colors flex items-center justify-center",
            block.checked
              ? "bg-primary border-primary text-primary-foreground"
              : "border-muted-foreground/40 hover:border-primary"
          )}>
            {block.checked && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </button>
      );
    case 'quote':
      return (
        <div className="flex items-stretch flex-shrink-0 mt-1 mr-1">
          <div className="w-1 rounded-full bg-primary/40" />
        </div>
      );
    case 'callout':
      return (
        <div className="flex items-center justify-center w-6 h-8 flex-shrink-0 mt-0.5 text-base">
          💡
        </div>
      );
    default:
      return null;
  }
};

// Text styling classes per block type
const getBlockTextClass = (type: BlockType): string => {
  switch (type) {
    case 'heading1': return 'text-2xl font-bold';
    case 'heading2': return 'text-xl font-semibold';
    case 'heading3': return 'text-lg font-semibold';
    case 'quote': return 'text-base italic text-muted-foreground';
    case 'callout': return 'text-sm bg-accent/30 rounded-lg px-2 py-1';
    case 'code': return 'text-sm font-mono bg-muted/50 rounded px-2 py-1';
    case 'todo': return 'text-sm';
    default: return 'text-sm';
  }
};

// Placeholder text
const getPlaceholder = (type: BlockType): string => {
  switch (type) {
    case 'heading1': return 'Heading 1';
    case 'heading2': return 'Heading 2';
    case 'heading3': return 'Heading 3';
    case 'text': return "Type '/' for commands";
    case 'bullet': return 'List item';
    case 'numbered': return 'List item';
    case 'todo': return 'To-do';
    case 'quote': return 'Quote';
    case 'callout': return 'Callout';
    case 'code': return 'Code';
    default: return '';
  }
};
