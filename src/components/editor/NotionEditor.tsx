// ============================================================
// NikNote 4.0 — Notion-Style Integrated Editor V2
// / commands → Block type selector (25+ types)
// @ mentions → AI actions (Teacher, Notes, Quiz, Flashcards, Revision, Summarize, Translate)
// # hashtags → Topic tags + auto-link to knowledge base
// Mobile-first: touch-action:manipulation, no Framer Motion overlays
// ============================================================

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  Plus, ChevronRight, Check, Copy, Loader2,
  Trash2, Hash, AtSign, Slash, Sparkles, X
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

// Block template defaults
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
  text: { icon: '📝', placeholder: "Type '/' for commands, '@' for AI, '#' for tags...", textClass: '' },
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
// @ MENTION ITEMS — AI Actions + Quick Inserts
// ============================================================
const MENTION_ITEMS = [
  { id: 'ai-teacher', icon: '🧠', label: 'AI Guru', desc: 'Hinglish mein samjhao', category: 'ai', color: 'violet' },
  { id: 'ai-notes', icon: '📝', label: 'AI Notes', desc: 'Exam-ready notes banao', category: 'ai', color: 'indigo' },
  { id: 'ai-quiz', icon: '🎯', label: 'AI Quiz', desc: 'MCQs generate karo', category: 'ai', color: 'amber' },
  { id: 'ai-flashcards', icon: '🃏', label: 'Flashcards', desc: 'Revision cards banao', category: 'ai', color: 'emerald' },
  { id: 'ai-revision', icon: '📖', label: 'Quick Revision', desc: 'Revision sheet banao', category: 'ai', color: 'blue' },
  { id: 'ai-summarize', icon: '📋', label: 'Summarize', desc: 'Content ko short karo', category: 'ai', color: 'teal' },
  { id: 'ai-translate', icon: '🌐', label: 'Translate', desc: 'Hindi ↔ English karo', category: 'ai', color: 'pink' },
  { id: 'ai-explain', icon: '💡', label: 'Explain Like 5', desc: 'Baccho jaisa samjhao', category: 'ai', color: 'orange' },
  { id: 'date', icon: '📅', label: 'Aaj ki Date', desc: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), category: 'insert', color: 'gray' },
  { id: 'page', icon: '📄', label: 'Page Link', desc: 'Doosre page ka link', category: 'insert', color: 'gray' },
  { id: 'template', icon: '📋', label: 'Template', desc: 'Pre-made note template', category: 'insert', color: 'gray' },
];

// ============================================================
// # HASHTAG ITEMS — Subject/Topic tags
// ============================================================
const HASHTAG_ITEMS = [
  { id: 'physics', icon: '⚡', label: 'Physics', desc: 'Bhautiki — mechanics, optics, electricity' },
  { id: 'chemistry', icon: '🧪', label: 'Chemistry', desc: 'Rasayan — organic, inorganic, physical' },
  { id: 'math', icon: '📐', label: 'Mathematics', desc: 'Ganit — algebra, calculus, geometry' },
  { id: 'biology', icon: '🧬', label: 'Biology', desc: 'Jeev Vigyan — botany, zoology' },
  { id: 'english', icon: '📖', label: 'English', desc: 'Grammar, literature, writing' },
  { id: 'hindi', icon: '📝', label: 'Hindi', desc: 'Vyakaran, sahitya, nibandh' },
  { id: 'history', icon: '🏛️', label: 'History', desc: 'Itihas — ancient, medieval, modern' },
  { id: 'geography', icon: '🌍', label: 'Geography', desc: 'Bhugol — physical, human, Indian' },
  { id: 'cs', icon: '💻', label: 'Computer Science', desc: 'Programming, data structures, algorithms' },
  { id: 'economics', icon: '📊', label: 'Economics', desc: 'Arthashastra — micro, macro, Indian' },
  { id: 'jee', icon: '🎯', label: 'JEE Prep', desc: 'IIT-JEE preparation notes' },
  { id: 'neet', icon: '🩺', label: 'NEET Prep', desc: 'NEET preparation notes' },
  { id: 'upsc', icon: '🏛️', label: 'UPSC', desc: 'Civil services preparation' },
  { id: 'cbse', icon: '📚', label: 'CBSE', desc: 'CBSE board exam notes' },
  { id: 'icse', icon: '📘', label: 'ICSE', desc: 'ICSE board exam notes' },
  { id: 'formula', icon: '🔢', label: 'Formulas', desc: 'Quick formula reference' },
  { id: 'important', icon: '⭐', label: 'Important', desc: 'Must-remember points' },
  { id: 'exam', icon: '📝', label: 'Exam Tips', desc: 'Exam strategies & tips' },
];

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
  const [hashtagMenu, setHashtagMenu] = useState<{ blockId: string; query: string; position: { top: number; left: number } } | null>(null);
  const [showInlineColor, setShowInlineColor] = useState<string | null>(null);
  const [typingBlockId, setTypingBlockId] = useState<string | null>(null);
  const [aiLoadingBlock, setAiLoadingBlock] = useState<string | null>(null);
  const inputRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());
  const typingTimerRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const editorRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Virtual keyboard handling
  useEffect(() => {
    if (!isMobile) return;
    const handleResize = () => {
      const newHeight = window.visualViewport?.height || window.innerHeight;
      if (newHeight < viewportHeight - 100) {
        const focused = document.activeElement;
        if (focused && editorRef.current?.contains(focused)) {
          setTimeout(() => { (focused as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 300);
        }
      }
      setViewportHeight(newHeight);
    };
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, [isMobile, viewportHeight]);

  // Close menus on Escape / click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSlashMenu(null); setMentionMenu(null); setHashtagMenu(null); setShowInlineColor(null); }
    };
    const handleDocClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (editorRef.current && !editorRef.current.contains(target)) {
        setSlashMenu(null); setMentionMenu(null); setHashtagMenu(null); setShowInlineColor(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleDocClick);
    return () => { document.removeEventListener('keydown', handleKeyDown); document.removeEventListener('mousedown', handleDocClick); };
  }, []);

  // Focus block
  const focusBlock = useCallback((id: string, cursorPos?: number) => {
    requestAnimationFrame(() => {
      const el = inputRefs.current.get(id);
      if (el) { el.focus(); if (cursorPos !== undefined) el.setSelectionRange(cursorPos, cursorPos); }
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
    if (blocks.length <= 1) { updateBlock(id, { content: '', type: 'text' }); return; }
    const idx = blocks.findIndex(b => b.id === id);
    const prev = blocks[idx - 1];
    onBlocksChange(blocks.filter(b => b.id !== id));
    if (prev) focusBlock(prev.id, prev.content.length);
  }, [blocks, onBlocksChange, updateBlock, focusBlock]);

  // ============================================================
  // TEXT CHANGE — Detect / @ # triggers
  // ============================================================
  const handleTextChange = useCallback((blockId: string, text: string) => {
    setTypingBlockId(blockId);
    const existing = typingTimerRef.current.get(blockId);
    if (existing) clearTimeout(existing);
    typingTimerRef.current.set(blockId, setTimeout(() => setTypingBlockId(null), 800));

    // / slash command trigger
    if (text === '/') {
      const el = inputRefs.current.get(blockId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setSlashMenu({ blockId, query: '', position: { top: rect.bottom + 4, left: Math.min(rect.left, window.innerWidth - 300) } });
      }
      updateBlock(blockId, { content: text });
      return;
    }

    // @ mention trigger
    if (text === '@') {
      const el = inputRefs.current.get(blockId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setMentionMenu({ blockId, query: '', position: { top: rect.bottom + 4, left: Math.min(rect.left, window.innerWidth - 280) } });
      }
      updateBlock(blockId, { content: text });
      return;
    }

    // # hashtag trigger
    if (text === '#') {
      const el = inputRefs.current.get(blockId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setHashtagMenu({ blockId, query: '', position: { top: rect.bottom + 4, left: Math.min(rect.left, window.innerWidth - 280) } });
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

    // Mention menu query update — allow typing after @ like "@teach" "@notes"
    if (mentionMenu?.blockId === blockId && text.startsWith('@')) {
      setMentionMenu(prev => prev ? { ...prev, query: text.slice(1) } : null);
      updateBlock(blockId, { content: text });
      return;
    }

    // Hashtag menu query update
    if (hashtagMenu?.blockId === blockId && text.startsWith('#')) {
      setHashtagMenu(prev => prev ? { ...prev, query: text.slice(1) } : null);
      updateBlock(blockId, { content: text });
      return;
    }

    // Close menus when text no longer starts with trigger
    if (slashMenu?.blockId === blockId && !text.startsWith('/')) setSlashMenu(null);
    if (mentionMenu?.blockId === blockId && !text.startsWith('@')) setMentionMenu(null);
    if (hashtagMenu?.blockId === blockId && !text.startsWith('#')) setHashtagMenu(null);

    // Detect prefix shortcuts (# heading, - bullet, etc.)
    const prefixMatch = detectBlockPrefix(text);
    if (prefixMatch) {
      updateBlock(blockId, { type: prefixMatch.type, content: prefixMatch.remaining });
      focusBlock(blockId, prefixMatch.remaining.length);
      return;
    }

    updateBlock(blockId, { content: text });
  }, [updateBlock, slashMenu, mentionMenu, hashtagMenu, focusBlock]);

  // ============================================================
  // SLASH SELECT
  // ============================================================
  const handleSlashSelect = useCallback((type: BlockType) => {
    if (!slashMenu) return;
    const { blockId } = slashMenu;
    const template = BLOCK_TEMPLATES[type];

    if (type === 'divider') {
      updateBlock(blockId, { type: 'divider', content: '' });
      addBlockAfter(blockId);
    } else {
      updateBlock(blockId, { type, content: template?.content || '', ...template?.extra });
      if (['image', 'bookmark', 'video', 'table', 'equation', 'ai-generated'].includes(type)) {
        setTimeout(() => addBlockAfter(blockId, 'text', ''), 50);
      }
      focusBlock(blockId, 0);
    }
    setSlashMenu(null);
  }, [slashMenu, updateBlock, addBlockAfter, focusBlock]);

  // ============================================================
  // @ MENTION SELECT — AI Actions
  // ============================================================
  const handleMentionSelect = useCallback(async (item: string) => {
    if (!mentionMenu) return;
    const { blockId } = mentionMenu;
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    setMentionMenu(null);

    // AI actions
    if (item.startsWith('ai-')) {
      const selectedItem = MENTION_ITEMS.find(m => m.id === item);
      const actionLabel = selectedItem?.label || 'AI';
      
      updateBlock(blockId, { content: `⏳ ${actionLabel} soch raha hai...`, type: 'ai-generated' });
      setAiLoadingBlock(blockId);

      try {
        const { aiOrchestrator } = await import('@/agents/orchestrator');
        
        const agentMap: Record<string, string> = {
          'ai-teacher': 'teacher', 'ai-notes': 'notes', 'ai-quiz': 'quiz',
          'ai-flashcards': 'quiz', 'ai-revision': 'revision',
          'ai-summarize': 'notes', 'ai-translate': 'teacher', 'ai-explain': 'teacher',
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
          'ai-summarize': context ? `Summarize this content in 5-7 bullet points (Hinglish): ${context.slice(-300)}` : 'Give me a summary of any important academic topic in Hinglish',
          'ai-translate': context ? `Translate this to Hindi (if English) or English (if Hindi): ${context.slice(-200)}` : 'Translate any sentence from Hindi to English or English to Hindi',
          'ai-explain': context ? `Explain this like I am 5 years old, in Hinglish with fun examples: ${context.slice(-200)}` : 'Explain any science topic like I am 5, in Hinglish with fun examples',
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
        } else {
          updateBlock(blockId, { content: '⚠️ AI ne koi response nahi diya. Dobara try karo!', type: 'text' });
          setAiLoadingBlock(null);
        }
      } catch (err) {
        console.error('AI error:', err);
        updateBlock(blockId, { content: '⚠️ AI response fail ho gaya. Dobara try karo!', type: 'text' });
        setAiLoadingBlock(null);
      }
    } else if (item === 'date') {
      const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      updateBlock(blockId, { content: `📅 ${dateStr}` });
      focusBlock(blockId);
    } else if (item === 'page') {
      updateBlock(blockId, { content: '📄 [Page link]', type: 'bookmark' });
      focusBlock(blockId);
    } else if (item === 'template') {
      updateBlock(blockId, { 
        content: '## 📋 Note Template\n\n### Topic\n\n### Key Points\n- \n- \n- \n\n### Formulas\n\n### Summary', 
        type: 'callout', 
        emoji: '📋' 
      });
      focusBlock(blockId);
    } else {
      const newContent = block.content.replace(/@$/, item + ' ');
      updateBlock(blockId, { content: newContent });
      focusBlock(blockId, newContent.length);
    }
  }, [mentionMenu, blocks, updateBlock, focusBlock, addBlockAfter]);

  // ============================================================
  // # HASHTAG SELECT — Topic tags
  // ============================================================
  const handleHashtagSelect = useCallback((itemId: string) => {
    if (!hashtagMenu) return;
    const { blockId } = mentionMenu ? { blockId: hashtagMenu.blockId } : { blockId: hashtagMenu.blockId };
    const block = blocks.find(b => b.id === hashtagMenu.blockId);
    if (!block) return;

    setHashtagMenu(null);
    
    const tagItem = HASHTAG_ITEMS.find(h => h.id === itemId);
    if (tagItem) {
      // Replace # with the tag
      const newContent = block.content.replace(/#$/, `#${tagItem.id} `);
      updateBlock(hashtagMenu.blockId, { content: newContent });
      focusBlock(hashtagMenu.blockId, newContent.length);
      toast.success(`${tagItem.icon} #${tagItem.id} tag added!`);
    }
  }, [hashtagMenu, blocks, updateBlock, focusBlock]);

  // ============================================================
  // KEYBOARD HANDLING
  // ============================================================
  const handleKeyDown = useCallback((blockId: string, e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    // If slash/mention/hashtag menu is open, handle menu navigation
    if (slashMenu?.blockId === blockId || mentionMenu?.blockId === blockId || hashtagMenu?.blockId === blockId) {
      if (e.key === 'Escape') {
        setSlashMenu(null); setMentionMenu(null); setHashtagMenu(null);
        e.preventDefault();
        return;
      }
      // Let the menu handle arrow keys - just prevent default
      return;
    }

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
      if (block.type !== 'text') { e.preventDefault(); updateBlock(blockId, { type: 'text' }); return; }
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
  }, [blocks, slashMenu, mentionMenu, hashtagMenu, updateBlock, addBlockAfter, removeBlock, focusBlock]);

  // Paste handling
  const handlePaste = useCallback((blockId: string, e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;
    const lines = text.replace(/\r/g, '').split('\n');
    if (lines.length <= 1) {
      const el = e.currentTarget as HTMLTextAreaElement;
      const start = el.selectionStart; const end = el.selectionEnd;
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
    if (el) { inputRefs.current.set(id, el); el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }
    else { inputRefs.current.delete(id); }
  }, []);

  // Filtered mention items
  const filteredMentions = useMemo(() => {
    if (!mentionMenu) return [];
    const q = mentionMenu.query.toLowerCase();
    if (!q) return MENTION_ITEMS;
    return MENTION_ITEMS.filter(i => i.label.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
  }, [mentionMenu]);

  // Filtered hashtag items
  const filteredHashtags = useMemo(() => {
    if (!hashtagMenu) return [];
    const q = hashtagMenu.query.toLowerCase();
    if (!q) return HASHTAG_ITEMS;
    return HASHTAG_ITEMS.filter(i => i.label.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
  }, [hashtagMenu]);

  const hasContent = blocks.some(b => b.content.trim());

  // ============================================================
  // RENDER — Command Menu Popup Component
  // ============================================================
  const renderCommandMenu = () => {
    // @ Mention Menu
    if (mentionMenu && filteredMentions.length > 0) {
      const aiItems = filteredMentions.filter(i => i.category === 'ai');
      const insertItems = filteredMentions.filter(i => i.category === 'insert');
      return (
        <div
          className="fixed z-50 w-[280px] max-h-[360px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl"
          style={{
            top: Math.min(mentionMenu.position.top, window.innerHeight - 380),
            left: Math.max(8, Math.min(mentionMenu.position.left, window.innerWidth - 290)),
            touchAction: 'manipulation',
          }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white px-3 py-2 border-b border-gray-100 flex items-center gap-2">
            <AtSign className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">AI & Mentions</span>
            <kbd className="ml-auto text-[9px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">ESC</kbd>
          </div>

          {/* AI Actions */}
          {aiItems.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1 text-[9px] font-bold text-violet-500 uppercase tracking-wider">✨ AI Actions</div>
              {aiItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleMentionSelect(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-indigo-50 active:bg-indigo-100 transition-colors"
                  style={{ touchAction: 'manipulation', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
                >
                  <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center text-base flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-gray-900">{item.label}</div>
                    <div className="text-[11px] text-gray-400">{item.desc}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Quick Inserts */}
          {insertItems.length > 0 && (
            <div className="py-1 border-t border-gray-100">
              <div className="px-3 py-1 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Quick Insert</div>
              {insertItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleMentionSelect(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  style={{ touchAction: 'manipulation', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-base flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-gray-700">{item.label}</div>
                    <div className="text-[11px] text-gray-400">{item.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    // # Hashtag Menu
    if (hashtagMenu && filteredHashtags.length > 0) {
      return (
        <div
          className="fixed z-50 w-[280px] max-h-[360px] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl"
          style={{
            top: Math.min(hashtagMenu.position.top, window.innerHeight - 380),
            left: Math.max(8, Math.min(hashtagMenu.position.left, window.innerWidth - 290)),
            touchAction: 'manipulation',
          }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white px-3 py-2 border-b border-gray-100 flex items-center gap-2">
            <Hash className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Topic Tags</span>
            <kbd className="ml-auto text-[9px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">ESC</kbd>
          </div>

          <div className="py-1">
            {filteredHashtags.map(item => (
              <button
                key={item.id}
                onClick={() => handleHashtagSelect(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-indigo-50 active:bg-indigo-100 transition-colors"
                style={{ touchAction: 'manipulation', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-base flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-gray-900">
                    <span className="text-indigo-400">#</span>{item.label}
                  </div>
                  <div className="text-[11px] text-gray-400">{item.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  // ============================================================
  // RENDER — Block Content
  // ============================================================
  const renderBlockContent = (block: Block) => {
    if (block.type === 'code' && block.content) {
      return (
        <div className="mt-1 p-3 rounded-xl bg-gray-900 text-green-400 font-mono text-[11px] max-w-sm overflow-x-auto">
          <pre className="whitespace-pre-wrap">{block.content}</pre>
        </div>
      );
    }
    if (block.type === 'equation' && block.content) {
      return <div className="mt-1 p-2 rounded-xl bg-indigo-50 border border-indigo-200 font-mono text-xs text-indigo-800">{block.content}</div>;
    }
    if (block.type === 'bookmark' && (block.url || block.content)) {
      return (
        <div className="mt-1 p-2.5 rounded-xl border border-gray-200 bg-gray-50 max-w-sm">
          <div className="text-[12px] font-medium text-indigo-600 truncate">{block.content || 'Bookmark'}</div>
          {block.url && <div className="text-[10px] text-gray-400 truncate">🔗 {block.url}</div>}
        </div>
      );
    }
    if (block.type === 'table' && block.tableData) {
      return (
        <div className="mt-1 rounded-xl border border-gray-200 overflow-hidden max-w-sm">
          <table className="w-full text-[10px]">
            <thead><tr className="bg-gray-50">{block.tableData.headers.map((h,i) => <th key={i} className="px-2 py-1.5 text-left border-r border-gray-100 last:border-r-0 font-medium">{h}</th>)}</tr></thead>
            <tbody>{block.tableData.rows.map((row,i) => <tr key={i} className="border-t border-gray-100">{row.map((cell,j) => <td key={j} className="px-2 py-1.5 border-r border-gray-100 last:border-r-0">{cell.content}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
    }
    if (block.type === 'image' && block.url) {
      return <div className="mt-1 rounded-xl overflow-hidden border border-gray-200 max-w-sm"><img src={block.url} alt="" className="w-full object-cover max-h-36" /></div>;
    }
    if (block.type === 'ai-generated' && block.content) {
      return renderAIBlock(block);
    }
    return null;
  };

  // AI Generated block with rich rendering
  const renderAIBlock = (block: Block) => (
    <div className="mt-1.5 rounded-xl bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 border border-violet-200/60 overflow-hidden">
      {/* AI Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-violet-100/40 border-b border-violet-200/40">
        <div className="w-5 h-5 rounded-md bg-violet-500 flex items-center justify-center text-white text-[9px] font-bold shadow-sm">
          {aiLoadingBlock === block.id ? <Loader2 className="w-3 h-3 animate-spin" /> : '✨'}
        </div>
        <span className="text-[11px] font-bold text-violet-700">AI Generated</span>
        {block.aiModel && <span className="text-[10px] text-violet-400">• {block.aiModel}</span>}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => { navigator.clipboard.writeText(block.content); toast.success('Copied! 📋'); }}
            className="p-1 rounded-md hover:bg-violet-200/50 active:scale-95 transition-all"
            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation', cursor: 'pointer' }}
            title="Copy"
          >
            <Copy className="w-3 h-3 text-violet-400" />
          </button>
          <button
            onClick={() => { updateBlock(block.id, { type: 'text' }); toast.success('Converted to text block'); }}
            className="p-1 rounded-md hover:bg-violet-200/50 active:scale-95 transition-all"
            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation', cursor: 'pointer' }}
            title="Remove AI styling"
          >
            <X className="w-3 h-3 text-violet-400" />
          </button>
        </div>
      </div>
      {/* AI Content */}
      <div className="px-3 py-2.5 text-[13px] text-gray-800 leading-relaxed whitespace-pre-wrap">
        {block.content.split('\n').map((line, i) => {
          if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold text-sm mt-2 text-gray-900">{line.replace(/\*\*/g, '')}</p>;
          if (line.startsWith('### ')) return <h4 key={i} className="font-bold text-sm mt-2.5 text-gray-900">{line.replace(/^###\s/, '')}</h4>;
          if (line.startsWith('## ')) return <h3 key={i} className="font-bold text-sm mt-2.5 text-gray-900">{line.replace(/^##\s/, '')}</h3>;
          if (line.startsWith('- **') || line.startsWith('- ')) {
            const text = line.replace(/^[-•]\s/, '');
            const parts = text.split(/\*\*/);
            return (
              <div key={i} className="flex gap-2 ml-1 mt-1">
                <span className="text-violet-400 flex-shrink-0 mt-0.5">•</span>
                <span>{parts.map((part, pi) => pi % 2 === 1 ? <strong key={pi} className="text-gray-900">{part}</strong> : <span key={pi}>{part}</span>)}</span>
              </div>
            );
          }
          if (/^\d+\.\s/.test(line)) return <p key={i} className="ml-4 mt-0.5">{line}</p>;
          if (!line.trim()) return <div key={i} className="h-1.5" />;
          return <p key={i} className="mt-0.5">{line}</p>;
        })}
      </div>
    </div>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div ref={editorRef} className="notion-editor relative" style={{ touchAction: 'manipulation' }}>
      {/* Shortcut hints bar */}
      <div className={cn(
        "flex items-center gap-2 mb-2 text-[11px] text-gray-400",
        isMobile ? "px-2" : "px-1"
      )}>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono font-semibold text-gray-500">/</kbd>
          <span>Commands</span>
        </span>
        <span className="text-gray-300">•</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-indigo-50 rounded text-[10px] font-mono font-semibold text-indigo-500">@</kbd>
          <span>AI</span>
        </span>
        <span className="text-gray-300">•</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-violet-50 rounded text-[10px] font-mono font-semibold text-violet-500">#</kbd>
          <span>Tags</span>
        </span>
      </div>

      {/* Blocks */}
      <div className="space-y-px">
        {blocks.map((block, idx) => {
          const config = BLOCK_CONFIG[block.type] || BLOCK_CONFIG.text;
          const indentPx = (block.indent || 0) * 24;
          const blockColor = (block.color || currentColor) as LineInkColor;
          const inkData = LINE_INK_COLORS.find(c => c.value === blockColor);
          const isFocused = focusedBlockId === block.id;
          const isTyping = typingBlockId === block.id;

          // Divider
          if (block.type === 'divider') {
            return (
              <div key={block.id} className="group relative py-2 px-3">
                <div className="flex items-center gap-2">
                  <hr className="flex-1 border-t border-gray-200" />
                  <button onClick={() => removeBlock(block.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 transition-all"
                    style={{ touchAction: 'manipulation', cursor: 'pointer' }}>
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
                  isFocused && "bg-indigo-50/30"
                )}
                style={{ paddingLeft: indentPx + (isMobile ? 8 : 4), touchAction: 'manipulation' }}
                onClick={() => { setFocusedBlockId(block.id); }}
              >
                {/* Block action button — color dot */}
                <div className={cn("flex items-center gap-0 flex-shrink-0 mt-1", isMobile ? "opacity-30" : "opacity-0 group-hover:opacity-100")}>
                  <button
                    className="p-1 rounded-md active:bg-gray-100 transition-colors"
                    style={{ touchAction: 'manipulation', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
                    onClick={(e) => { e.stopPropagation(); setShowInlineColor(showInlineColor === block.id ? null : block.id); }}
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
                      style={{ touchAction: 'manipulation', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
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
                      style={{ touchAction: 'manipulation', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
                      tabIndex={-1}
                    >
                      <div style={{ transform: block.collapsed ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.15s' }}>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      </div>
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
                  {isTyping && (
                    <div className="absolute -top-1 -right-1 z-10">
                      <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: inkData?.hex || '#6366f1' }} />
                    </div>
                  )}

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
                      touchAction: 'manipulation',
                    }}
                    autoComplete="off"
                    autoCorrect="on"
                    autoCapitalize="sentences"
                    spellCheck={true}
                  />

                  {/* Block type previews */}
                  {renderBlockContent(block)}
                </div>

                {/* Delete button */}
                <div className={cn("flex items-center flex-shrink-0 mt-1", isMobile ? "opacity-40" : "opacity-0 group-hover:opacity-100")}>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                    className="p-1.5 rounded-lg active:bg-red-50 transition-colors"
                    style={{ touchAction: 'manipulation', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>

                {/* Inline color picker */}
                {showInlineColor === block.id && (
                  <div className="absolute left-4 top-full mt-1 z-50 bg-white rounded-xl border border-gray-200 shadow-xl p-2 flex gap-1 flex-wrap max-w-[240px]"
                       style={{ touchAction: 'manipulation' }}>
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
                        style={{ backgroundColor: ink.hex, touchAction: 'manipulation', cursor: 'pointer' }}
                        title={ink.label}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add block button */}
      <button
        onClick={() => {
          const last = blocks[blocks.length - 1];
          if (last) addBlockAfter(last.id);
        }}
        className={cn(
          "w-full text-left flex items-center gap-2 text-gray-300 hover:text-gray-500 transition-colors",
          isMobile ? "py-3 px-4 text-[14px]" : "py-2 px-2 text-xs"
        )}
        style={{ touchAction: 'manipulation', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
      >
        <Plus className="w-4 h-4" />
        <span>Add a block</span>
        <span className="text-gray-300 text-[11px]">or type</span>
        <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px] font-mono">/</kbd>
        <kbd className="px-1 py-0.5 bg-indigo-50 rounded text-[10px] font-mono text-indigo-500">@</kbd>
        <kbd className="px-1 py-0.5 bg-violet-50 rounded text-[10px] font-mono text-violet-500">#</kbd>
      </button>

      {/* Slash Command Menu */}
      <SlashCommandMenu
        isOpen={!!slashMenu}
        query={slashMenu?.query || ''}
        position={slashMenu?.position || { top: 0, left: 0 }}
        onSelect={handleSlashSelect}
        onClose={() => setSlashMenu(null)}
      />

      {/* @ Mention Menu & # Hashtag Menu */}
      {renderCommandMenu()}

    </div>
  );
};
