// ============================================================
// NikNote 4.0 — Enhanced Slash Command Menu
// Notion-level with categories, search, keyboard nav
// 25+ block types organized by category
// ============================================================

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SLASH_COMMANDS, SlashCommand, BlockType } from '@/types/block';

interface SlashCommandMenuProps {
  isOpen: boolean;
  query: string;
  position: { top: number; left: number };
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

const CATEGORY_ORDER = ['basic', 'media', 'database', 'advanced', 'ai'];
const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  basic: { label: 'Basic Blocks', emoji: '📝' },
  media: { label: 'Media & Embeds', emoji: '🖼️' },
  database: { label: 'Database', emoji: '📊' },
  advanced: { label: 'Advanced', emoji: '⚙️' },
  ai: { label: 'AI Powered', emoji: '✨' },
};

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  isOpen, query, position, onSelect, onClose
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter commands
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return SLASH_COMMANDS;
    const q = query.toLowerCase();
    return SLASH_COMMANDS.filter(cmd =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.id.toLowerCase().includes(q)
    );
  }, [query]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: { category: string; commands: SlashCommand[] }[] = [];
    for (const cat of CATEGORY_ORDER) {
      const cmds = filteredCommands.filter(c => c.category === cat);
      if (cmds.length > 0) {
        groups.push({ category: cat, commands: cmds });
      }
    }
    return groups;
  }, [filteredCommands]);

  // Reset index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        if (cmd) { onSelect(cmd.id); onClose(); }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onSelect, onClose]);

  // Scroll into view
  useEffect(() => {
    const el = menuRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  // Adjust position to stay in viewport
  const adjustedTop = Math.min(position.top, window.innerHeight - 400);
  const adjustedLeft = Math.min(position.left, window.innerWidth - 300);

  let flatIndex = 0;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, y: 4, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className="fixed z-50 w-[280px] max-h-[380px] overflow-y-auto rounded-xl border border-gray-200/60 bg-white/95 backdrop-blur-xl shadow-xl py-1.5"
        style={{ top: adjustedTop, left: adjustedLeft }}
      >
        {grouped.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            No blocks found
          </div>
        ) : (
          grouped.map((group) => {
            const catInfo = CATEGORY_LABELS[group.category] || { label: group.category, emoji: '📦' };
            return (
              <div key={group.category}>
                <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>{catInfo.emoji}</span>
                  {catInfo.label}
                </div>
                {group.commands.map((cmd) => {
                  const idx = flatIndex++;
                  return (
                    <button
                      key={cmd.id}
                      data-index={idx}
                      onClick={() => { onSelect(cmd.id); onClose(); }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-1.5 text-left transition-colors",
                        idx === selectedIndex
                          ? "bg-indigo-50 text-indigo-900"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm",
                        idx === selectedIndex ? "bg-indigo-100" : "bg-gray-100"
                      )}>
                        {cmd.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium truncate">{cmd.label}</div>
                        <div className="text-[10px] text-gray-400 truncate">{cmd.description}</div>
                      </div>
                      {cmd.shortcut && (
                        <kbd className="text-[9px] font-mono text-gray-400 bg-gray-100 px-1 py-0.5 rounded">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
                <div className="h-px bg-gray-100 my-1 mx-3" />
              </div>
            );
          })
        )}
      </motion.div>
    </AnimatePresence>
  );
};
