import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';
import { LineInkColor, LINE_INK_COLORS } from '@/types/noteLine';
import { HandwritingFont, FONT_OPTIONS } from '@/types/notes';
import { cn } from '@/lib/utils';

interface QuickStylesBarProps {
  isVisible: boolean;
  currentColor: LineInkColor;
  currentFont: HandwritingFont;
  onColorChange: (color: LineInkColor) => void;
  onFontChange: (font: HandwritingFont) => void;
  onOpenStyleSheet: () => void;
}

const STORAGE_KEY_COLORS = 'niknote-recent-colors';
const STORAGE_KEY_FONTS = 'niknote-recent-fonts';

export const QuickStylesBar: React.FC<QuickStylesBarProps> = ({
  isVisible, currentColor, currentFont, onColorChange, onFontChange, onOpenStyleSheet,
}) => {
  const [recentColors, setRecentColors] = useState<LineInkColor[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COLORS);
      return stored ? JSON.parse(stored) : ['black', 'blue', 'red', 'green'];
    } catch { return ['black', 'blue', 'red', 'green']; }
  });

  const [recentFonts, setRecentFonts] = useState<HandwritingFont[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FONTS);
      return stored ? JSON.parse(stored) : ['roman-regular', 'caveat', 'kalam'];
    } catch { return ['roman-regular', 'caveat', 'kalam']; }
  });

  useEffect(() => {
    setRecentColors(prev => {
      const updated = [currentColor, ...prev.filter(c => c !== currentColor)].slice(0, 4);
      localStorage.setItem(STORAGE_KEY_COLORS, JSON.stringify(updated));
      return updated;
    });
  }, [currentColor]);

  useEffect(() => {
    setRecentFonts(prev => {
      const updated = [currentFont, ...prev.filter(f => f !== currentFont)].slice(0, 3);
      localStorage.setItem(STORAGE_KEY_FONTS, JSON.stringify(updated));
      return updated;
    });
  }, [currentFont]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="fixed bottom-[56px] left-0 right-0 z-40 lg:hidden px-2 pb-1"
    >
      <div className="h-10 bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-xl shadow-lg flex items-center px-2.5 gap-1.5">
        {recentColors.map((color) => {
          const ink = LINE_INK_COLORS.find(c => c.value === color);
          if (!ink) return null;
          return (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className={cn(
                "w-7 h-7 rounded-full border-2 flex-shrink-0 transition-all active:scale-90",
                currentColor === color ? "border-indigo-500 scale-110 ring-2 ring-indigo-100" : "border-transparent"
              )}
              style={{ backgroundColor: ink.hex, WebkitTapHighlightColor: 'transparent' }}
            />
          );
        })}

        <div className="w-px h-5 bg-gray-200 mx-0.5" />

        {recentFonts.map((font) => {
          const fontOpt = FONT_OPTIONS.find(f => f.value === font);
          if (!fontOpt) return null;
          return (
            <button
              key={font}
              onClick={() => onFontChange(font)}
              className={cn(
                "px-2 py-1.5 rounded-lg text-[11px] font-medium truncate max-w-[60px] transition-all active:scale-95",
                currentFont === font
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-400"
              )}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <span className={fontOpt.className}>{fontOpt.label}</span>
            </button>
          );
        })}

        <button
          onClick={onOpenStyleSheet}
          className="ml-auto w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <Palette className="w-4 h-4 text-indigo-500" />
        </button>
      </div>
    </motion.div>
  );
};
