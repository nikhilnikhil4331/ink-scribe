// ============================================================
// NikNote 4.0 — Notion-Style Integrated Editor
// Type directly, see handwriting preview alongside
// / commands, @ mentions, all in one unified view
// No separate boxes — Notion-like experience
// ============================================================

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  GripVertical, Trash2, Plus, Palette, ChevronRight,
  Sparkles, Brain, FileDown, Scan, Image, FileText,
  Hash, AtSign, Check, Copy, Loader2, RotateCcw, Wand2,
  BookOpen, Target, GraduationCap, Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Block, BlockType, createBlock, detectBlockPrefix, generateBlockId, SLASH_COMMANDS } from '@/types/block';
import { SlashCommandMenu } from './SlashCommandMenu';
import { LineInkColor, LINE_INK_COLORS } from '@/types/noteLine';
import { toast } from 'sonner';

// ============================================================
// Types
// ============================================================

interface NotionEditorProps {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
  currentColor?: LineInkColor;
  onColorChange?: (color: LineInkColor) => void;
  onAIAction?: (action: string) => void;
  onOCRAction?: () => void;
  onExport?: () => void;
  dna?: any;
  settings?: any;
  pageNumber?: number;
  totalPages?: number;
}

// ============================================================
// Template content for slash commands
// ============================================================

const BLOCK_TEMPLATES: Partial<Record<BlockType, { content: string; extra?: Partial<Block> }>> = {
  text: { content: '' },
  heading1: { content: '' },
  heading2: { content: '' },
  heading3: { content: '' },
  bullet: { content: '' },
  numbered: { content: '' },
  todo: { content: '', extra: { checked: false } },
  quote: { content: '' },
  callout: { content: '', extra: { emoji: '💡' } },
  divider: { content: '' },
  code: { content: '', extra: { language: 'javascript' } },
  toggle: { content: '', extra: { collapsed: true } },
  equation: { content: '' },
  image: { content: '', extra: { url: '', caption: '' } },
  bookmark: { content: '', extra: { url: '' } },
  video: { content: '', extra: { url: '' } },
  audio: { content: '', extra: { url: '' } },
  embed: { content: '', extra: { url: '' } },
  pdf: { content: '', extra: { url: '' } },
  file: { content: '', extra: { url: '' } },
  table: { content: '', extra: { tableData: { headers: ['Column 1', 'Column 2', 'Column 3'], rows: [['', '', ''], ['', '', '']], colCount: 3 } } },
  'ai-generated': { content: '' },
  mermaid: { content: 'graph TD\n  A[Start] --> B[End]' },
  synced: { content: '', extra: { syncId: `sync-${Date.now()}` } },
  breadcrumb: { content: '' },
  'table_of_contents': { content: '' },
  mention: { content: '' },
  comment: { content: '' },
};

// Block type display config
const BLOCK_CONFIG: Record<string, { icon: string; placeholder: string; textClass: string }> = {
  text: { icon: '📝', placeholder: "Type '/' for commands...", textClass: '' },
  heading1: { icon: 'H₁', placeholder: 'Heading 1', textClass: 'text-2xl font-bold' },
  heading2: { icon: 'H₂', placeholder: 'Heading 2', textClass: 'text-xl font-semibold' },
  heading3: { icon: 'H₃', placeholder: 'Heading 3', textClass: 'text-lg font-semibold' },
  bullet: { icon: '•', placeholder: 'List item', textClass: '' },
  numbered: { icon: '1.', placeholder: 'List item', textClass: '' },
  todo: { icon: '☐', placeholder: 'To-do', textClass: '' },
  quote: { icon: '❝', placeholder: 'Quote', textClass: 'italic text-muted-foreground' },
  callout: { icon: '💡', placeholder: 'Callout', textClass: 'bg-amber-50/50 rounded-lg px-2 py-1' },
  code: { icon: '<>', placeholder: 'Code', textClass: 'font-mono bg-muted/50 rounded px-2 py-1 text-xs' },
  toggle: { icon: '▶', placeholder: 'Toggle heading...', textClass: 'font-medium' },
  equation: { icon: '∑', placeholder: 'LaTeX equation...', textClass: 'font-mono bg-indigo-50/50 rounded px-2' },
  divider: { icon: '—', placeholder: '', textClass: '' },
  image: { icon: '🖼️', placeholder: 'Paste image URL...', textClass: '' },
  bookmark: { icon: '🔗', placeholder: 'Paste URL...', textClass: '' },
  'ai-generated': { icon: '✨', placeholder: 'AI will generate...', textClass: 'bg-purple-50/50 rounded px-2' },
  mermaid: { icon: '🔀', placeholder: 'Mermaid diagram...', textClass: 'font-mono text-xs' },
  table: { icon: '📊', placeholder: '', textClass: '' },
  video: { icon: '🎥', placeholder: 'Video URL...', textClass: '' },
  audio: { icon: '🎵', placeholder: 'Audio URL...', textClass: '' },
  pdf: { icon: '📄', placeholder: 'PDF URL...', textClass: '' },
};

// ============================================================
// Component
// ============================================================

export const NotionEditor: React.FC<NotionEditorProps> = ({
  blocks,
  onBlocksChange,
  currentColor = 'black',
  onColorChange,
  onAIAction,
  onOCRAction,
  onExport,
  dna,
  settings,
  pageNumber = 1,
  totalPages = 1,
}) => {
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [slashMenu, setSlashMenu] = useState<{ blockId: string; query: string; position: { top: number; left: number } } | null>(null);
  const [mentionMenu, setMentionMenu] = useState<{ blockId: string; query: string; position: { top: number; left: number } } | null>(null);
  const [showInlineColor, setShowInlineColor] = useState<string | null>(null);
  const [typingBlockId, setTypingBlockId] = useState<string | null>(null);
  const inputRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());
  const typingTimerRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  // Detect mobile and handle virtual keyboard
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle virtual keyboard on mobile — adjust scroll when input focused
  useEffect(() => {
    if (!isMobile) return;
    const handleResize = () => {
      const newHeight = window.visualViewport?.height || window.innerHeight;
      if (newHeight < viewportHeight - 100) {
        // Keyboard opened — scroll focused element into view
        const focused = document.activeElement;
        if (focused && editorRef.current?.contains(focused)) {
          setTimeout(() => {
            (focused as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      }
      setViewportHeight(newHeight);
    };
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, [isMobile, viewportHeight]);

  // Focus block
  const focusBlock = useCallback((id: string, cursorPos?: number) => {
    requestAnimationFrame(() => {
      const el = inputRefs.current.get(id);
      if (el) {
        el.focus();
        if (cursorPos !== undefined) el.setSelectionRange(cursorPos, cursorPos);
      }
    });
  }, []);

  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    onBlocksChange(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  }, [blocks, onBlocksChange]);

  const addBlockAfter = useCallback((afterId: string, type: BlockType = 'text', content = ''): string => {
    const template = BLOCK_TEMPLATES[type];
    const newBlock = createBlock(type, content || template?.content || '');
    newBlock.color = currentColor;
    if (template?.extra) Object.assign(newBlock, template.extra);
    const idx = blocks.findIndex(b => b.id === afterId);
    const newBlocks = [...blocks];
    newBlocks.splice(idx + 1, 0, newBlock);
    onBlocksChange(newBlocks);
    focusBlock(newBlock.id, 0);
    return newBlock.id;
  }, [blocks, onBlocksChange, focusBlock, currentColor]);

  const removeBlock = useCallback((id: string) => {
    if (blocks.length <= 1) {
      updateBlock(id, { content: '', type: 'text' });
      return;
    }
    const idx = blocks.findIndex(b => b.id === id);
    const prev = blocks[idx - 1];
    onBlocksChange(blocks.filter(b => b.id !== id));
    if (prev) focusBlock(prev.id, prev.content.length);
  }, [blocks, onBlocksChange, updateBlock, focusBlock]);

  // Handle text change
  const handleTextChange = useCallback((blockId: string, text: string) => {
    setTypingBlockId(blockId);
    const existing = typingTimerRef.current.get(blockId);
    if (existing) clearTimeout(existing);
    typingTimerRef.current.set(blockId, setTimeout(() => setTypingBlockId(null), 800));

    // Slash command trigger
    if (text === '/') {
      const el = inputRefs.current.get(blockId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setSlashMenu({ blockId, query: '', position: { top: rect.bottom + 4, left: rect.left } });
      }
      updateBlock(blockId, { content: text });
      return;
    }

    // @ mention trigger
    if (text === '@') {
      const el = inputRefs.current.get(blockId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setMentionMenu({ blockId, query: '', position: { top: rect.bottom + 4, left: rect.left } });
      }
      updateBlock(blockId, { content: text });
      return;
    }

    // Slash menu query update
    if (slashMenu?.blockId === blockId && text.startsWith('/')) {
      setSlashMenu(prev => prev ? { ...prev, query: text.slice(1) } : null);
      updateBlock(blockId, { content: text });
      return;
    }

    // Mention menu query update
    if (mentionMenu?.blockId === blockId && text.startsWith('@')) {
      setMentionMenu(prev => prev ? { ...prev, query: text.slice(1) } : null);
      updateBlock(blockId, { content: text });
      return;
    }

    // Close menus
    if (slashMenu?.blockId === blockId && !text.startsWith('/')) setSlashMenu(null);
    if (mentionMenu?.blockId === blockId && !text.startsWith('@')) setMentionMenu(null);

    // Detect prefix shortcuts (# heading, - bullet, etc.)
    const prefixMatch = detectBlockPrefix(text);
    if (prefixMatch) {
      updateBlock(blockId, { type: prefixMatch.type, content: prefixMatch.remaining });
      focusBlock(blockId, prefixMatch.remaining.length);
      return;
    }

    updateBlock(blockId, { content: text });
  }, [updateBlock, slashMenu, mentionMenu, focusBlock]);

  // Slash command select
  const handleSlashSelect = useCallback((type: BlockType) => {
    if (!slashMenu) return;
    const { blockId } = slashMenu;
    const template = BLOCK_TEMPLATES[type];

    if (type === 'divider') {
      updateBlock(blockId, { type: 'divider', content: '' });
      addBlockAfter(blockId);
    } else {
      updateBlock(blockId, {
        type,
        content: template?.content || '',
        ...template?.extra,
      });
      if (['image', 'bookmark', 'video', 'table', 'equation'].includes(type)) {
        setTimeout(() => addBlockAfter(blockId, 'text', ''), 50);
      }
      focusBlock(blockId, 0);
    }
    setSlashMenu(null);
  }, [slashMenu, updateBlock, addBlockAfter, focusBlock]);

  // Mention select
  const handleMentionSelect = useCallback((item: string) => {
    if (!mentionMenu) return;
    const { blockId } = mentionMenu;
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    const newContent = block.content.replace(/@$/, `@${item} `);
    updateBlock(blockId, { content: newContent });
    setMentionMenu(null);
    focusBlock(blockId, newContent.length);
  }, [mentionMenu, blocks, updateBlock, focusBlock]);

  // Keyboard handling
  const handleKeyDown = useCallback((blockId: string, e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    if (slashMenu?.blockId === blockId || mentionMenu?.blockId === blockId) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const el = e.currentTarget;
      const cursorPos = el.selectionStart;
      const before = block.content.slice(0, cursorPos);
      const after = block.content.slice(cursorPos);

      if (!block.content.trim() && ['bullet', 'numbered', 'todo'].includes(block.type)) {
        updateBlock(blockId, { type: 'text' });
        return;
      }

      updateBlock(blockId, { content: before });
      const nextType = ['bullet', 'numbered', 'todo'].includes(block.type) ? block.type : 'text';
      addBlockAfter(blockId, nextType, after);
    }

    if (e.key === 'Backspace' && e.currentTarget.selectionStart === 0 && e.currentTarget.selectionEnd === 0) {
      if (block.type !== 'text') {
        e.preventDefault();
        updateBlock(blockId, { type: 'text' });
        return;
      }
      const idx = blocks.findIndex(b => b.id === blockId);
      if (idx > 0) {
        e.preventDefault();
        const prev = blocks[idx - 1];
        if (prev.type === 'divider') { removeBlock(prev.id); return; }
        const mergePos = prev.content.length;
        updateBlock(prev.id, { content: prev.content + block.content });
        removeBlock(blockId);
        focusBlock(prev.id, mergePos);
      }
    }

    if (e.key === 'ArrowUp' && e.currentTarget.selectionStart === 0) {
      const idx = blocks.findIndex(b => b.id === blockId);
      if (idx > 0) { e.preventDefault(); focusBlock(blocks[idx - 1].id, blocks[idx - 1].content.length); }
    }
    if (e.key === 'ArrowDown' && e.currentTarget.selectionStart === e.currentTarget.value.length) {
      const idx = blocks.findIndex(b => b.id === blockId);
      if (idx < blocks.length - 1) { e.preventDefault(); focusBlock(blocks[idx + 1].id, 0); }
    }
    if (e.key === 'Tab' && ['bullet', 'numbered', 'todo'].includes(block.type)) {
      e.preventDefault();
      const indent = block.indent || 0;
      updateBlock(blockId, { indent: e.shiftKey ? Math.max(0, indent - 1) : Math.min(3, indent + 1) });
    }
  }, [blocks, slashMenu, mentionMenu, updateBlock, addBlockAfter, removeBlock, focusBlock]);

  // Paste handling
  const handlePaste = useCallback((blockId: string, e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;
    const lines = text.replace(/\r/g, '').split('\n');
    if (lines.length <= 1) {
      const el = e.currentTarget as HTMLTextAreaElement;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const block = blocks.find(b => b.id === blockId);
      if (!block) return;
      updateBlock(blockId, { content: block.content.slice(0, start) + text + block.content.slice(end) });
      setTimeout(() => focusBlock(blockId, start + text.length), 0);
      return;
    }
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    const el = e.currentTarget as HTMLTextAreaElement;
    const before = block.content.slice(0, el.selectionStart);
    const after = block.content.slice(el.selectionEnd);
    updateBlock(blockId, { content: before + lines[0] });
    const newBlocks = lines.slice(1).map(line => { const nb = createBlock('text', line); nb.color = currentColor; return nb; });
    if (newBlocks.length > 0) newBlocks[newBlocks.length - 1].content += after;
    const idx = blocks.findIndex(b => b.id === blockId);
    const updated = [...blocks];
    updated.splice(idx + 1, 0, ...newBlocks);
    onBlocksChange(updated);
    if (newBlocks.length > 0) setTimeout(() => focusBlock(newBlocks[newBlocks.length - 1].id, newBlocks[newBlocks.length - 1].content.length), 50);
  }, [blocks, onBlocksChange, updateBlock, focusBlock, currentColor]);

  // Auto-resize textarea
  const setRef = useCallback((id: string, el: HTMLTextAreaElement | null) => {
    if (el) {
      inputRefs.current.set(id, el);
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    } else {
      inputRefs.current.delete(id);
    }
  }, []);

  // Mention items
  const mentionItems = useMemo(() => {
    if (!mentionMenu) return [];
    const q = mentionMenu.query.toLowerCase();
    const items = [
      { id: 'ai-teacher', label: '🧠 AI Teacher', desc: 'Ask AI to explain' },
      { id: 'ai-notes', label: '📝 AI Notes', desc: 'Generate notes' },
      { id: 'ai-quiz', label: '🎯 AI Quiz', desc: 'Create a quiz' },
      { id: 'ai-flashcards', label: '🃏 Flashcards', desc: 'Make flashcards' },
      { id: 'ai-revision', label: '📖 Quick Revision', desc: 'Revision sheet' },
      { id: 'date', label: '📅 Today', desc: new Date().toLocaleDateString('en-IN') },
      { id: 'page', label: '📄 Page Link', desc: 'Link to another page' },
    ];
    return q ? items.filter(i => i.label.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)) : items;
  }, [mentionMenu]);

  // Has content check
  const hasContent = blocks.some(b => b.content.trim());

  return (
    <div ref={editorRef} className="notion-editor relative">
      {/* Page header */}
      <div className="px-1 mb-2">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground/50">
          <span>Page {pageNumber}/{totalPages}</span>
          <div className="flex items-center gap-2">
            {onAIAction && (
              <button onClick={() => onAIAction('explain')} className="flex items-center gap-1 hover:text-primary transition-colors">
                <Sparkles className="w-3 h-3" /> AI
              </button>
            )}
            {onOCRAction && (
              <button onClick={onOCRAction} className="flex items-center gap-1 hover:text-emerald-500 transition-colors">
                <Scan className="w-3 h-3" /> OCR
              </button>
            )}
            {onExport && (
              <button onClick={onExport} className="flex items-center gap-1 hover:text-primary transition-colors">
                <FileDown className="w-3 h-3" /> PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Blocks */}
      <Reorder.Group axis="y" values={blocks} onReorder={onBlocksChange} className="space-y-0">
        {blocks.map((block, idx) => {
          const config = BLOCK_CONFIG[block.type] || BLOCK_CONFIG.text;
          const indentPx = (block.indent || 0) * 24;
          const blockColor = (block.color || currentColor) as LineInkColor;
          const inkData = LINE_INK_COLORS.find(c => c.value === blockColor);
          const isFocused = focusedBlockId === block.id;
          const isTyping = typingBlockId === block.id;

          // Divider block
          if (block.type === 'divider') {
            return (
              <Reorder.Item key={block.id} value={block} dragListener={false}>
                <div className="group relative flex items-center py-2 px-2">
                  <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-50 cursor-grab" />
                  <hr className="flex-1 border-t border-border/40" />
                  <button onClick={() => removeBlock(block.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </Reorder.Item>
            );
          }

          return (
            <Reorder.Item key={block.id} value={block} dragListener={false}>
              <div
                className={cn(
                  "group relative flex items-start gap-0 rounded-lg transition-all min-h-[28px]",
                  isFocused && "bg-muted/20"
                )}
                style={{ paddingLeft: indentPx }}
              >
                {/* Drag handle + type icon */}
                <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
                  <div className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-muted/30 rounded">
                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40" />
                  </div>
                </div>

                {/* Block prefix icon */}
                <div className="flex items-center justify-center w-6 h-7 flex-shrink-0 mt-0.5">
                  {block.type === 'todo' ? (
                    <button
                      onClick={() => updateBlock(block.id, { checked: !block.checked })}
                      className="flex items-center justify-center"
                      tabIndex={-1}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded border-2 transition-colors flex items-center justify-center",
                        block.checked ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
                      )}>
                        {block.checked && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </button>
                  ) : block.type === 'toggle' ? (
                    <button
                      onClick={() => updateBlock(block.id, { collapsed: !block.collapsed })}
                      className="hover:bg-muted/30 rounded"
                      tabIndex={-1}
                    >
                      <motion.div animate={{ rotate: block.collapsed ? 0 : 90 }} transition={{ duration: 0.15 }}>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </motion.div>
                    </button>
                  ) : block.type === 'bullet' ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/60" />
                  ) : block.type === 'numbered' ? (
                    <span className="text-[11px] text-muted-foreground font-medium">{idx + 1}.</span>
                  ) : block.type === 'quote' ? (
                    <div className="flex items-stretch h-5 mr-1"><div className="w-1 rounded-full bg-primary/40" /></div>
                  ) : block.type === 'callout' ? (
                    <span className="text-sm">{block.emoji || '💡'}</span>
                  ) : block.type === 'image' ? (
                    <span className="text-sm">🖼️</span>
                  ) : block.type === 'equation' ? (
                    <span className="text-sm font-mono">∑</span>
                  ) : block.type === 'code' ? (
                    <span className="text-[10px] font-mono text-muted-foreground">{'<>'}</span>
                  ) : block.type === 'bookmark' ? (
                    <span className="text-sm">🔗</span>
                  ) : block.type === 'ai-generated' ? (
                    <span className="text-sm">✨</span>
                  ) : null}
                </div>

                {/* Content area */}
                <div className="flex-1 relative min-w-0">
                  {/* Typing indicator */}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute -top-1 -right-1 z-10"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: inkData?.hex || '#6366f1' }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <textarea
                    ref={(el) => setRef(block.id, el)}
                    value={block.content}
                    onChange={(e) => {
                      handleTextChange(block.id, e.target.value);
                      const target = e.target;
                      target.style.height = 'auto';
                      target.style.height = target.scrollHeight + 'px';
                    }}
                    onKeyDown={(e) => handleKeyDown(block.id, e)}
                    onPaste={(e) => handlePaste(block.id, e)}
                    onFocus={() => setFocusedBlockId(block.id)}
                    placeholder={config.placeholder}
                    rows={1}
                    className={cn(
                      "flex-1 bg-transparent border-0 outline-none resize-none py-1 px-0.5 placeholder:text-muted-foreground/30 leading-relaxed w-full overflow-hidden text-foreground",
                      isMobile && "min-h-[44px] text-base", // Touch-friendly on mobile (prevents iOS zoom)
                      config.textClass
                    )}
                    style={{ color: inkData?.hex }}
                  />

                  {/* Block previews */}
                  {block.type === 'image' && block.url && (
                    <div className="mt-1 rounded-lg overflow-hidden border border-border/30 max-w-sm">
                      <img src={block.url} alt="" className="w-full object-cover max-h-36" />
                    </div>
                  )}
                  {block.type === 'code' && block.content && (
                    <div className="mt-1 p-2 rounded-lg bg-slate-900 text-green-400 font-mono text-[10px] max-w-sm overflow-x-auto">
                      <pre className="whitespace-pre-wrap">{block.content}</pre>
                    </div>
                  )}
                  {block.type === 'equation' && block.content && (
                    <div className="mt-1 p-1.5 rounded-lg bg-indigo-50/50 border border-indigo-100 font-mono text-xs text-indigo-800">
                      {block.content}
                    </div>
                  )}
                  {block.type === 'bookmark' && (block.url || block.content) && (
                    <div className="mt-1 p-2 rounded-lg border border-border/30 bg-muted/10 max-w-sm">
                      <div className="text-[11px] font-medium text-primary truncate">{block.content || 'Bookmark'}</div>
                      {block.url && <div className="text-[9px] text-muted-foreground truncate">🔗 {block.url}</div>}
                    </div>
                  )}
                  {block.type === 'table' && block.tableData && (
                    <div className="mt-1 rounded-lg border border-border/30 overflow-hidden max-w-sm">
                      <table className="w-full text-[10px]">
                        <thead><tr className="bg-muted/30">{block.tableData.headers.map((h,i) => <th key={i} className="px-2 py-1 text-left border-r border-border/20 last:border-r-0">{h}</th>)}</tr></thead>
                        <tbody>{block.tableData.rows.map((row,i) => <tr key={i} className="border-t border-border/20">{row.map((cell,j) => <td key={j} className="px-2 py-1 border-r border-border/20 last:border-r-0">{cell.content}</td>)}</tr>)}</tbody>
                      </table>
                    </div>
                  )}
                  {block.type === 'ai-generated' && block.content && (
                    <div className="mt-1 p-2 rounded-lg bg-gradient-to-r from-purple-50/50 to-indigo-50/50 border border-purple-100">
                      <div className="flex items-center gap-1 text-[10px] text-purple-600"><span>✨</span><span className="font-medium">AI Generated</span></div>
                      <p className="text-[10px] text-purple-800 mt-0.5">{block.content}</p>
                    </div>
                  )}
                </div>

                {/* Hover actions */}
                <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5 pr-1">
                  <button
                    onClick={() => setShowInlineColor(showInlineColor === block.id ? null : block.id)}
                    className="p-0.5 rounded hover:bg-muted/50"
                    title="Change color"
                  >
                    <div className="w-3 h-3 rounded-full border border-white/30" style={{ backgroundColor: inkData?.hex || '#1a1a2e' }} />
                  </button>
                  <button onClick={() => removeBlock(block.id)} className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Inline color picker */}
                <AnimatePresence>
                  {showInlineColor === block.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute left-8 top-full mt-1 z-50 bg-white/95 backdrop-blur-xl rounded-xl border border-border/30 shadow-lg p-1.5 flex gap-0.5"
                    >
                      {LINE_INK_COLORS.map((ink) => (
                        <button
                          key={ink.value}
                          onClick={() => {
                            updateBlock(block.id, { color: ink.value });
                            onColorChange?.(ink.value);
                            setShowInlineColor(null);
                          }}
                          className={cn(
                            "w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
                            blockColor === ink.value ? "border-primary scale-110" : "border-transparent"
                          )}
                          style={{ backgroundColor: ink.hex }}
                          title={ink.label}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      {/* Add block button */}
      <button
        onClick={() => {
          const last = blocks[blocks.length - 1];
          if (last) addBlockAfter(last.id);
        }}
        className="w-full text-left py-2 px-2 text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors flex items-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" />
        Add a block, or type <kbd className="text-[9px] bg-muted/50 px-1 rounded font-mono">/</kbd> for commands
      </button>

      {/* Slash Command Menu */}
      <SlashCommandMenu
        isOpen={!!slashMenu}
        query={slashMenu?.query || ''}
        position={slashMenu?.position || { top: 0, left: 0 }}
        onSelect={handleSlashSelect}
        onClose={() => setSlashMenu(null)}
      />

      {/* @ Mention Menu */}
      <AnimatePresence>
        {mentionMenu && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            className="fixed z-50 w-[240px] max-h-[280px] overflow-y-auto rounded-xl border border-border/50 bg-white/95 backdrop-blur-xl shadow-xl py-1"
            style={{ top: mentionMenu.position.top, left: mentionMenu.position.left }}
          >
            <div className="px-2 py-1 text-[9px] font-semibold text-muted-foreground uppercase">Mentions & AI</div>
            {mentionItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleMentionSelect(item.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-primary/5 transition-colors"
              >
                <span className="text-sm">{item.label.split(' ')[0]}</span>
                <div>
                  <div className="text-xs font-medium">{item.label.split(' ').slice(1).join(' ')}</div>
                  <div className="text-[9px] text-muted-foreground">{item.desc}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
