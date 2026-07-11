// ============================================================
// NikNote 4.0 — Notion-Style Integrated Editor (Mobile Pro)
// Type directly, see handwriting preview alongside
// / commands, @ mentions, all in one unified view
// Mobile-first: 48px touch targets, 16px font, smooth scroll
// ============================================================

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Palette, ChevronRight,
  Sparkles, FileDown, Scan,
  Check, Copy, Loader2,
  Trash2, GripVertical
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
  text: { icon: '📝', placeholder: "Type '/' for commands, '@' for AI...", textClass: '' },
  heading1: { icon: 'H₁', placeholder: 'Heading 1', textClass: 'text-2xl font-bold' },
  heading2: { icon: 'H₂', placeholder: 'Heading 2', textClass: 'text-xl font-semibold' },
  heading3: { icon: 'H₃', placeholder: 'Heading 3', textClass: 'text-lg font-semibold' },
  bullet: { icon: '•', placeholder: 'List item', textClass: '' },
  numbered: { icon: '1.', placeholder: 'List item', textClass: '' },
  todo: { icon: '☐', placeholder: 'To-do', textClass: '' },
  quote: { icon: '❝', placeholder: 'Quote', textClass: 'italic text-gray-600' },
  callout: { icon: '💡', placeholder: 'Callout', textClass: 'bg-amber-50/80 rounded-lg px-3 py-1.5 border border-amber-200/50' },
  code: { icon: '<>', placeholder: 'Code', textClass: 'font-mono bg-gray-100 rounded-lg px-3 py-1.5 text-xs border border-gray-200/50' },
  toggle: { icon: '▶', placeholder: 'Toggle heading...', textClass: 'font-medium' },
  equation: { icon: '∑', placeholder: 'LaTeX equation...', textClass: 'font-mono bg-indigo-50/80 rounded-lg px-3 border border-indigo-200/50' },
  divider: { icon: '—', placeholder: '', textClass: '' },
  image: { icon: '🖼️', placeholder: 'Paste image URL...', textClass: '' },
  bookmark: { icon: '🔗', placeholder: 'Paste URL...', textClass: '' },
  'ai-generated': { icon: '✨', placeholder: 'AI will generate...', textClass: 'bg-violet-50/60 rounded-lg px-3 border border-violet-200/50' },
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

  // Handle virtual keyboard on mobile
  useEffect(() => {
    if (!isMobile) return;
    const handleResize = () => {
      const newHeight = window.visualViewport?.height || window.innerHeight;
      if (newHeight < viewportHeight - 100) {
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

  // Close menus on Escape key or when clicking outside (without overlay)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSlashMenu(null);
        setMentionMenu(null);
        setShowInlineColor(null);
      }
    };
    const handleDocClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      // Close menus only if click is outside the editor
      if (editorRef.current && !editorRef.current.contains(target)) {
        setSlashMenu(null);
        setMentionMenu(null);
        setShowInlineColor(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleDocClick);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleDocClick);
    };
  }, []);

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
        setSlashMenu({ blockId, query: '', position: { top: rect.bottom + 4, left: Math.min(rect.left, window.innerWidth - 260) } });
      }
      updateBlock(blockId, { content: text });
      return;
    }

    // @ mention trigger
    if (text === '@') {
      const el = inputRefs.current.get(blockId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setMentionMenu({ blockId, query: '', position: { top: rect.bottom + 4, left: Math.min(rect.left, window.innerWidth - 260) } });
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

    // Detect prefix shortcuts
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

  // Mention select — triggers AI action
  const [aiLoadingBlock, setAiLoadingBlock] = useState<string | null>(null);

  const handleMentionSelect = useCallback(async (item: string) => {
    if (!mentionMenu) return;
    const { blockId } = mentionMenu;
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    setMentionMenu(null);

    if (item.startsWith('ai-')) {
      updateBlock(blockId, { content: '⏳ AI soch raha hai...', type: 'ai-generated' });
      setAiLoadingBlock(blockId);

      try {
        const { aiOrchestrator } = await import('@/agents/orchestrator');
        
        const agentMap: Record<string, string> = {
          'ai-teacher': 'teacher',
          'ai-notes': 'notes',
          'ai-quiz': 'quiz',
          'ai-flashcards': 'quiz',
          'ai-revision': 'revision',
        };
        
        const agentType = agentMap[item] || 'teacher';
        const context = blocks.filter(b => b.id !== blockId && b.content.trim())
          .map(b => b.content).join('\n').slice(-500);
        
        const promptMap: Record<string, string> = {
          'ai-teacher': context ? `Explain this topic in Hindi+English (Hinglish) with examples: ${context.slice(-200)}` : 'Koi bhi important topic samjhao Hindi+English mein, jaise Newton ke Laws ya Photosynthesis',
          'ai-notes': context ? `Create detailed study notes in Hinglish for: ${context.slice(-200)}` : 'Create study notes for any CBSE/ICSE topic in Hinglish with headings, bullet points, formulas',
          'ai-quiz': context ? `Generate 5 MCQ quiz questions in Hinglish about: ${context.slice(-200)}` : 'Generate 5 MCQ quiz questions in Hinglish about any science/math topic',
          'ai-flashcards': context ? `Create 5 flashcards in Hinglish for revision: ${context.slice(-200)}` : 'Create 5 flashcards in Hinglish for any important topic',
          'ai-revision': context ? `Quick revision notes in Hinglish with key formulas: ${context.slice(-200)}` : 'Quick revision notes in Hinglish — important formulas and key points',
        };

        const prompt = promptMap[item] || promptMap['ai-teacher'];
        const response = await aiOrchestrator.chat(prompt, agentType as any);

        if (response?.content) {
          const formattedContent = response.content
            .replace(/^##\s/gm, '')
            .replace(/^###\s/gm, '')
            .trim();

          updateBlock(blockId, {
            content: formattedContent,
            type: 'ai-generated',
            aiPrompt: prompt,
            aiModel: agentType,
          });
          setAiLoadingBlock(null);
          setTimeout(() => addBlockAfter(blockId), 100);
        }
      } catch (err) {
        updateBlock(blockId, {
          content: '⚠️ AI response fail ho gaya. Dobara try karo!',
          type: 'text',
        });
        setAiLoadingBlock(null);
      }
    } else if (item === 'date') {
      const dateStr = new Date().toLocaleDateString('en-IN', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      });
      updateBlock(blockId, { content: `📅 ${dateStr}` });
      focusBlock(blockId);
    } else if (item === 'page') {
      updateBlock(blockId, { content: '📄 [Page link]', type: 'bookmark' });
      focusBlock(blockId);
    } else {
      const newContent = block.content.replace(/@$/, item + ' ');
      updateBlock(blockId, { content: newContent });
      focusBlock(blockId, newContent.length);
    }
  }, [mentionMenu, blocks, updateBlock, focusBlock, addBlockAfter]);

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
      { id: 'ai-teacher', label: '🧠 AI Guru', desc: 'Hinglish mein samjhao' },
      { id: 'ai-notes', label: '📝 AI Notes', desc: 'Exam-ready notes banao' },
      { id: 'ai-quiz', label: '🎯 AI Quiz', desc: 'MCQs generate karo' },
      { id: 'ai-flashcards', label: '🃏 Flashcards', desc: 'Revision cards banao' },
      { id: 'ai-revision', label: '📖 Quick Revision', desc: 'Revision sheet banao' },
      { id: 'date', label: '📅 Aaj ki Date', desc: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
      { id: 'page', label: '📄 Page Link', desc: 'Doosre page ka link' },
    ];
    return q ? items.filter(i => i.label.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q) || i.id.toLowerCase().includes(q)) : items;
  }, [mentionMenu]);

  const hasContent = blocks.some(b => b.content.trim());

  return (
    <div ref={editorRef} className="notion-editor relative">
      {/* Blocks */}
      <div className="space-y-px">
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
              <div key={block.id} className="group relative py-2 px-3">
                <div className="flex items-center gap-2">
                  <hr className="flex-1 border-t border-gray-200" />
                  <button 
                    onClick={() => removeBlock(block.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Trash2 className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={block.id}>
              <div
                className={cn(
                  "group relative flex items-start gap-0 rounded-lg transition-colors duration-150",
                  isMobile ? "min-h-[48px] py-2 px-2" : "min-h-[28px] py-1 px-1",
                  isFocused && "bg-indigo-50/40"
                )}
                style={{ paddingLeft: indentPx + (isMobile ? 8 : 4), WebkitTapHighlightColor: 'transparent' }}
                onClick={() => { setFocusedBlockId(block.id); }}
              >
                {/* Block action button — mobile always visible, desktop hover */}
                <div className={cn(
                  "flex items-center gap-0 flex-shrink-0 mt-1",
                  isMobile ? "opacity-30" : "opacity-0 group-hover:opacity-100"
                )}>
                  <button
                    className="p-1 rounded-md active:bg-gray-100 transition-colors"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowInlineColor(showInlineColor === block.id ? null : block.id);
                    }}
                  >
                    <div className="w-3 h-3 rounded-full border border-white/40 shadow-sm" style={{ backgroundColor: inkData?.hex || '#1a1a2e' }} />
                  </button>
                </div>

                {/* Block prefix icon */}
                <div className="flex items-center justify-center w-6 flex-shrink-0 mt-1">
                  {block.type === 'todo' ? (
                    <button
                      onClick={() => updateBlock(block.id, { checked: !block.checked })}
                      className="flex items-center justify-center active:scale-90 transition-transform"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                      tabIndex={-1}
                    >
                      <div className={cn(
                        "w-[18px] h-[18px] rounded-md border-2 transition-colors flex items-center justify-center",
                        block.checked ? "bg-indigo-500 border-indigo-500 text-white" : "border-gray-300"
                      )}>
                        {block.checked && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  ) : block.type === 'toggle' ? (
                    <button
                      onClick={() => updateBlock(block.id, { collapsed: !block.collapsed })}
                      className="hover:bg-gray-100 rounded p-0.5 active:scale-90 transition-transform"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                      tabIndex={-1}
                    >
                      <motion.div animate={{ rotate: block.collapsed ? 0 : 90 }} transition={{ duration: 0.15 }}>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </motion.div>
                    </button>
                  ) : block.type === 'bullet' ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  ) : block.type === 'numbered' ? (
                    <span className="text-[11px] text-gray-400 font-medium">{idx + 1}.</span>
                  ) : block.type === 'quote' ? (
                    <div className="flex items-stretch h-5 mr-1"><div className="w-[3px] rounded-full bg-indigo-400" /></div>
                  ) : block.type === 'callout' ? (
                    <span className="text-sm">{block.emoji || '💡'}</span>
                  ) : block.type === 'image' ? (
                    <span className="text-sm">🖼️</span>
                  ) : block.type === 'equation' ? (
                    <span className="text-sm font-mono">∑</span>
                  ) : block.type === 'code' ? (
                    <span className="text-[10px] font-mono text-gray-400">{'<>'}</span>
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
                          className="w-2.5 h-2.5 rounded-full"
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
                    onClick={(e) => { e.stopPropagation(); setFocusedBlockId(block.id); }}
                    onTouchStart={(e) => { e.stopPropagation(); setFocusedBlockId(block.id); }}
                    placeholder={config.placeholder}
                    rows={1}
                    className={cn(
                      "flex-1 bg-transparent border-0 outline-none resize-none py-1 px-1 leading-relaxed w-full overflow-hidden",
                      isMobile ? "min-h-[48px] text-[16px] py-3 px-2 leading-7 text-gray-900" : "text-sm text-gray-900",
                      block.checked && "line-through text-gray-400",
                      config.textClass
                    )}
                    style={{ 
                      color: inkData?.hex || '#111827',
                      WebkitTapHighlightColor: 'transparent',
                      caretColor: '#6366f1',
                      WebkitUserSelect: 'text',
                      userSelect: 'text',
                    }}
                    autoComplete="off"
                    autoCorrect="on"
                    autoCapitalize="sentences"
                    spellCheck={true}
                  />

                  {/* Block previews */}
                  {block.type === 'image' && block.url && (
                    <div className="mt-1 rounded-xl overflow-hidden border border-gray-200 max-w-sm">
                      <img src={block.url} alt="" className="w-full object-cover max-h-36" />
                    </div>
                  )}
                  {block.type === 'code' && block.content && (
                    <div className="mt-1 p-3 rounded-xl bg-gray-900 text-green-400 font-mono text-[11px] max-w-sm overflow-x-auto">
                      <pre className="whitespace-pre-wrap">{block.content}</pre>
                    </div>
                  )}
                  {block.type === 'equation' && block.content && (
                    <div className="mt-1 p-2 rounded-xl bg-indigo-50 border border-indigo-200 font-mono text-xs text-indigo-800">
                      {block.content}
                    </div>
                  )}
                  {block.type === 'bookmark' && (block.url || block.content) && (
                    <div className="mt-1 p-2.5 rounded-xl border border-gray-200 bg-gray-50 max-w-sm">
                      <div className="text-[12px] font-medium text-indigo-600 truncate">{block.content || 'Bookmark'}</div>
                      {block.url && <div className="text-[10px] text-gray-400 truncate">🔗 {block.url}</div>}
                    </div>
                  )}
                  {block.type === 'table' && block.tableData && (
                    <div className="mt-1 rounded-xl border border-gray-200 overflow-hidden max-w-sm">
                      <table className="w-full text-[10px]">
                        <thead><tr className="bg-gray-50">{block.tableData.headers.map((h,i) => <th key={i} className="px-2 py-1.5 text-left border-r border-gray-100 last:border-r-0 font-medium">{h}</th>)}</tr></thead>
                        <tbody>{block.tableData.rows.map((row,i) => <tr key={i} className="border-t border-gray-100">{row.map((cell,j) => <td key={j} className="px-2 py-1.5 border-r border-gray-100 last:border-r-0">{cell.content}</td>)}</tr>)}</tbody>
                      </table>
                    </div>
                  )}
                  {block.type === 'ai-generated' && block.content && (
                    <div className="mt-1.5 p-3.5 rounded-xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200/60">
                      <div className="flex items-center gap-2 text-[11px] text-violet-700 mb-2.5">
                        <span className="w-5 h-5 rounded-md bg-violet-500 flex items-center justify-center text-white text-[9px] font-bold shadow-sm">
                          {aiLoadingBlock === block.id ? <Loader2 className="w-3 h-3 animate-spin" /> : '✨'}
                        </span>
                        <span className="font-bold">AI Generated</span>
                        {block.aiModel && <span className="text-violet-400 font-normal">• {block.aiModel}</span>}
                        <button 
                          onClick={() => { navigator.clipboard.writeText(block.content); toast.success('Copied! 📋'); }}
                          className="ml-auto p-1 rounded-md hover:bg-violet-100 active:scale-95 transition-all"
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          <Copy className="w-3 h-3 text-violet-400" />
                        </button>
                      </div>
                      <div className="text-[13px] text-gray-800 leading-relaxed whitespace-pre-wrap ai-formatted">
                        {block.content.split('\n').map((line, i) => {
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return <p key={i} className="font-bold text-sm mt-1.5 text-gray-900">{line.replace(/\*\*/g, '')}</p>;
                          }
                          if (line.startsWith('### ')) {
                            return <h4 key={i} className="font-bold text-sm mt-2.5 text-gray-900">{line.replace(/^###\s/, '')}</h4>;
                          }
                          if (line.startsWith('## ')) {
                            return <h3 key={i} className="font-bold text-sm mt-2.5 text-gray-900">{line.replace(/^##\s/, '')}</h3>;
                          }
                          if (line.startsWith('- **') || line.startsWith('- ')) {
                            const text = line.replace(/^[-•]\s/, '');
                            const parts = text.split(/\*\*/);
                            return (
                              <div key={i} className="flex gap-2 ml-1 mt-1">
                                <span className="text-violet-400 flex-shrink-0 mt-0.5">•</span>
                                <span>
                                  {parts.map((part, pi) => 
                                    pi % 2 === 1 ? <strong key={pi} className="text-gray-900">{part}</strong> : <span key={pi}>{part}</span>
                                  )}
                                </span>
                              </div>
                            );
                          }
                          if (/^\d+\.\s/.test(line)) {
                            return <p key={i} className="ml-4 mt-0.5">{line}</p>;
                          }
                          if (!line.trim()) return <div key={i} className="h-1.5" />;
                          return <p key={i} className="mt-0.5">{line}</p>;
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Delete button — always visible on mobile */}
                <div className={cn(
                  "flex items-center flex-shrink-0 mt-1",
                  isMobile ? "opacity-40" : "opacity-0 group-hover:opacity-100"
                )}>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                    className="p-1.5 rounded-lg active:bg-red-50 transition-colors"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>

                {/* Inline color picker */}
                <AnimatePresence>
                  {showInlineColor === block.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute left-4 top-full mt-1 z-50 bg-white rounded-xl border border-gray-200 shadow-xl p-2 flex gap-1 flex-wrap max-w-[240px]"
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
                            "w-7 h-7 rounded-full border-2 transition-transform active:scale-110",
                            blockColor === ink.value ? "border-indigo-500 scale-110 ring-2 ring-indigo-200" : "border-transparent"
                          )}
                          style={{ backgroundColor: ink.hex }}
                          title={ink.label}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add block button — Notion style */}
      <button
        onClick={() => {
          const last = blocks[blocks.length - 1];
          if (last) addBlockAfter(last.id);
        }}
        className={cn(
          "w-full text-left flex items-center gap-2 text-gray-300 hover:text-gray-500 transition-colors",
          isMobile ? "py-3 px-4 text-[14px]" : "py-2 px-2 text-xs"
        )}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <Plus className="w-4 h-4" />
        <span>Add a block</span>
        <span className="text-gray-300 text-[11px]">or type <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px] font-mono">/</kbd></span>
      </button>

      {/* Slash Command Menu */}
      <SlashCommandMenu
        isOpen={!!slashMenu}
        query={slashMenu?.query || ''}
        position={slashMenu?.position || { top: 0, left: 0 }}
        onSelect={handleSlashSelect}
        onClose={() => setSlashMenu(null)}
      />

      {/* @ Mention Menu — Mobile-friendly positioned */}
      <AnimatePresence>
        {mentionMenu && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 w-[260px] max-h-[300px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl py-1.5"
            style={{ 
              top: Math.min(mentionMenu.position.top, window.innerHeight - 320),
              left: Math.max(8, Math.min(mentionMenu.position.left, window.innerWidth - 270))
            }}
          >
            <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mentions & AI</div>
            {mentionItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleMentionSelect(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-indigo-50 active:bg-indigo-100 transition-colors"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <span className="text-base flex-shrink-0">{item.label.split(' ')[0]}</span>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-gray-900">{item.label.split(' ').slice(1).join(' ')}</div>
                  <div className="text-[11px] text-gray-400">{item.desc}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
