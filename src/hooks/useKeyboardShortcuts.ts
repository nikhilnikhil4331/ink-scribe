// ============================================================
// useKeyboardShortcuts — Global keyboard shortcut handler
// Shows shortcuts in tooltips, supports Ctrl/Cmd combos
// ============================================================

import { useEffect, useCallback } from 'react';
import { toast } from '@/components/Toast';

interface ShortcutConfig {
  key: string;           // e.g., 's', 'p', 'e'
  ctrl?: boolean;        // Requires Ctrl/Cmd
  shift?: boolean;       // Requires Shift
  alt?: boolean;         // Requires Alt
  description: string;   // Human-readable description
  handler: () => void;   // Function to call
  global?: boolean;      // Works even when typing in inputs
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs (unless global)
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      for (const shortcut of shortcuts) {
        const ctrlRequired = shortcut.ctrl ?? false;
        const shiftRequired = shortcut.shift ?? false;
        const altRequired = shortcut.alt ?? false;

        const ctrlPressed = e.ctrlKey || e.metaKey;
        const shiftPressed = e.shiftKey;
        const altPressed = e.altKey;

        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = ctrlPressed === ctrlRequired;
        const shiftMatch = shiftPressed === shiftRequired;
        const altMatch = altPressed === altRequired;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          // Skip if input is focused and shortcut is not global
          if (isInputFocused && !shortcut.global) continue;

          if (shortcut.preventDefault !== false) {
            e.preventDefault();
          }
          shortcut.handler();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// ============================================================
// Default Shortcuts for NikNote
// ============================================================
export const defaultNikNoteShortcuts = (
  handlers: {
    onSave?: () => void;
    onExport?: () => void;
    onPrint?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
    onNewNote?: () => void;
    onSearch?: () => void;
    onTogglePreview?: () => void;
    onToggleDarkMode?: () => void;
  }
): ShortcutConfig[] => {
  const shortcuts: ShortcutConfig[] = [];

  if (handlers.onSave) {
    shortcuts.push({
      key: 's',
      ctrl: true,
      description: 'Save note',
      handler: () => {
        handlers.onSave!();
        toast.saved();
      },
    });
  }

  if (handlers.onExport) {
    shortcuts.push({
      key: 'e',
      ctrl: true,
      description: 'Export PDF',
      handler: handlers.onExport,
    });
  }

  if (handlers.onPrint) {
    shortcuts.push({
      key: 'p',
      ctrl: true,
      description: 'Print / Preview',
      handler: handlers.onPrint,
    });
  }

  if (handlers.onUndo) {
    shortcuts.push({
      key: 'z',
      ctrl: true,
      description: 'Undo',
      handler: handlers.onUndo,
    });
  }

  if (handlers.onRedo) {
    shortcuts.push({
      key: 'z',
      ctrl: true,
      shift: true,
      description: 'Redo',
      handler: handlers.onRedo,
    });
  }

  if (handlers.onNewNote) {
    shortcuts.push({
      key: 'n',
      ctrl: true,
      description: 'New note',
      handler: handlers.onNewNote,
    });
  }

  if (handlers.onSearch) {
    shortcuts.push({
      key: 'k',
      ctrl: true,
      description: 'Search',
      handler: handlers.onSearch,
    });
  }

  if (handlers.onTogglePreview) {
    shortcuts.push({
      key: '\\',
      ctrl: true,
      description: 'Toggle preview',
      handler: handlers.onTogglePreview,
    });
  }

  if (handlers.onToggleDarkMode) {
    shortcuts.push({
      key: 'd',
      ctrl: true,
      shift: true,
      description: 'Toggle dark mode',
      handler: handlers.onToggleDarkMode,
    });
  }

  return shortcuts;
};

// ============================================================
// Shortcut display helper — for tooltips
// ============================================================
export function formatShortcut(shortcut: ShortcutConfig): string {
  const parts: string[] = [];
  const isMac = navigator.platform.toUpperCase().includes('MAC');

  if (shortcut.ctrl) parts.push(isMac ? '⌘' : 'Ctrl');
  if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac ? '' : '+');
}
