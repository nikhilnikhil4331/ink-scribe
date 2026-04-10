import React, { useState, useEffect, useCallback } from 'react';
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
      return stored ? JSON.parse(stored) : ['black', 'blue', 'red'];
    } catch { return ['black', 'blue', 'red']; }
  });

  const [recentFonts, setRecentFonts] = useState<HandwritingFont[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FONTS);
      return stored ? JSON.parse(stored) : ['caveat', 'kalam'];
    } catch { return ['caveat', 'kalam']; }
  });

  // Track recent colors
  useEffect(() => {
    setRecentColors(prev => {
      const updated = [currentColor, ...prev.filter(c => c !== currentColor)].slice(0, 3);
      localStorage.setItem(STORAGE_KEY_COLORS, JSON.stringify(updated));
      return updated;
    });
  }, [currentColor]);

  // Track recent fonts
  useEffect(() => {
    setRecentFonts(prev => {
      const updated = [currentFont, ...prev.filter(f => f !== currentFont)].slice(0, 2);
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
      className="fixed bottom-16 left-0 right-0 z-40 lg:hidden px-3 pb-1"
    >
      <div className="h-11 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg flex items-center px-3 gap-2">
        {/* Recent colors */}
        {recentColors.map((color) => {
          const ink = LINE_INK_COLORS.find(c => c.value === color);
          if (!ink) return null;
          return (
            <motion.button
              key={color}
              whileTap={{ scale: 0.85 }}
              onClick={() => onColorChange(color)}
              className={cn(
                "w-7 h-7 rounded-full border-2 flex-shrink-0 transition-all",
                currentColor === color ? "border-primary scale-110" : "border-transparent"
              )}
              style={{ backgroundColor: ink.hex }}
            />
          );
        })}

        {/* Divider */}
        <div className="w-px h-6 bg-border/50 mx-1" />

        {/* Recent fonts */}
        {recentFonts.map((font) => {
          const fontOpt = FONT_OPTIONS.find(f => f.value === font);
          if (!fontOpt) return null;
          return (
            <motion.button
              key={font}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFontChange(font)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium truncate max-w-[70px] transition-all",
                currentFont === font
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              <span className={fontOpt.className}>{fontOpt.label}</span>
            </motion.button>
          );
        })}

        {/* Open full style sheet */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onOpenStyleSheet}
          className="ml-auto w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"
        >
          <Palette className="w-4 h-4 text-primary" />
        </motion.button>
      </div>
    </motion.div>
  );
};
