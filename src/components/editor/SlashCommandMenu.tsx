import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SLASH_COMMANDS, SlashCommand, BlockType } from '@/types/block';
import { cn } from '@/lib/utils';

interface SlashCommandMenuProps {
  isOpen: boolean;
  query: string;
  position: { top: number; left: number };
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  isOpen, query, position, onSelect, onClose,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const filtered = SLASH_COMMANDS.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  // Reset selection when query changes
  useEffect(() => { setSelectedIndex(0); }, [query]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => (i + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) onSelect(filtered[selectedIndex].id);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [isOpen, filtered, selectedIndex, onSelect, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [handleKeyDown]);

  // Scroll selected item into view
  useEffect(() => {
    const el = menuRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen || filtered.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, y: 4, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.97 }}
        transition={{ duration: 0.12 }}
        className="fixed z-[100] bg-popover border border-border rounded-xl shadow-xl overflow-hidden max-h-[280px] w-[240px] overflow-y-auto"
        style={{ top: position.top, left: position.left }}
      >
        <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50">
          Blocks
        </div>
        <div className="py-1">
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              data-index={i}
              onClick={() => onSelect(cmd.id)}
              onMouseEnter={() => setSelectedIndex(i)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 text-left transition-colors",
                i === selectedIndex ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-muted"
              )}
            >
              <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-sm flex-shrink-0">
                {cmd.icon}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{cmd.label}</div>
                <div className="text-[11px] text-muted-foreground truncate">{cmd.description}</div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
