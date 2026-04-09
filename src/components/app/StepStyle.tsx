import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, Palette, FileText, Sliders } from 'lucide-react';
import { NoteSettings, FONT_OPTIONS, INK_COLOR_OPTIONS, PAGE_STYLE_OPTIONS, HandwritingFont, InkColor, PageStyle } from '@/types/notes';
import { NoteLine } from '@/types/noteLine';
import { cn } from '@/lib/utils';

interface StepStyleProps {
  settings: NoteSettings;
  onUpdateSettings: (updates: Partial<NoteSettings>) => void;
  lines: NoteLine[];
}

type StyleTab = 'font' | 'color' | 'paper' | 'effects';

const STYLE_TABS: { key: StyleTab; icon: React.ReactNode; label: string }[] = [
  { key: 'font', icon: <Type className="w-4 h-4" />, label: 'Font' },
  { key: 'color', icon: <Palette className="w-4 h-4" />, label: 'Color' },
  { key: 'paper', icon: <FileText className="w-4 h-4" />, label: 'Paper' },
  { key: 'effects', icon: <Sliders className="w-4 h-4" />, label: 'Effects' },
];

// Map font values to CSS font-family
const FONT_FAMILY_MAP: Record<string, string> = {
  'caveat': "'Caveat', cursive",
  'kalam': "'Kalam', cursive",
  'patrick-hand': "'Patrick Hand', cursive",
  'shadows-into-light': "'Shadows Into Light', cursive",
  'indie-flower': "'Indie Flower', cursive",
  'dancing-script': "'Dancing Script', cursive",
  'architects-daughter': "'Architects Daughter', cursive",
  'satisfy': "'Satisfy', cursive",
  'gloria-hallelujah': "'Gloria Hallelujah', cursive",
  'covered-by-your-grace': "'Covered By Your Grace', cursive",
  'rock-salt': "'Rock Salt', cursive",
  'reenie-beanie': "'Reenie Beanie', cursive",
  'homemade-apple': "'Homemade Apple', cursive",
  'nothing-you-could-do': "'Nothing You Could Do', cursive",
  'cedarville-cursive': "'Cedarville Cursive', cursive",
  'la-belle-aurore': "'La Belle Aurore', cursive",
};

export const StepStyle: React.FC<StepStyleProps> = ({ settings, onUpdateSettings, lines }) => {
  const [activeTab, setActiveTab] = useState<StyleTab>('font');
  const sampleText = lines.find(l => l.text.trim())?.text.slice(0, 40) || 'Hello, this is a preview';

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Live Mini Preview */}
      <div className="mx-3 mt-3 p-4 rounded-2xl bg-muted/30 border border-border/50">
        <p
          className="text-lg leading-relaxed truncate"
          style={{
            fontFamily: FONT_FAMILY_MAP[settings.font] || "'Caveat', cursive",
            fontSize: `${Math.min(settings.fontSize, 28)}px`,
            color: INK_COLOR_OPTIONS.find(c => c.value === settings.inkColor)?.hex || '#1a1a2e',
          }}
        >
          {sampleText}
        </p>
      </div>

      {/* Style Tabs */}
      <div className="flex gap-1 px-3 mt-3">
        {STYLE_TABS.map((tab) => (
          <motion.button
            key={tab.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all",
              activeTab === tab.key
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            {tab.icon}
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'font' && (
            <motion.div key="font" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {FONT_OPTIONS.filter(f => f.value !== 'custom').map((font) => (
                <motion.button
                  key={font.value}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onUpdateSettings({ font: font.value })}
                  className={cn(
                    "w-full text-left p-3.5 rounded-xl border transition-all",
                    settings.font === font.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/50 bg-card hover:border-primary/30"
                  )}
                >
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{font.category}</span>
                  <p
                    className="text-lg mt-0.5"
                    style={{ fontFamily: FONT_FAMILY_MAP[font.value] || 'cursive' }}
                  >
                    {font.label}
                  </p>
                </motion.button>
              ))}
            </motion.div>
          )}

          {activeTab === 'color' && (
            <motion.div key="color" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-4 gap-3">
                {INK_COLOR_OPTIONS.map((color) => (
                  <motion.button
                    key={color.value}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onUpdateSettings({ inkColor: color.value })}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
                      settings.inkColor === color.value
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/30 hover:border-primary/30"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full shadow-inner",
                        settings.inkColor === color.value && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      )}
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-[10px] font-medium text-muted-foreground">{color.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'paper' && (
            <motion.div key="paper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {PAGE_STYLE_OPTIONS.map((style) => (
                <motion.button
                  key={style.value}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onUpdateSettings({ pageStyle: style.value })}
                  className={cn(
                    "w-full text-left p-3.5 rounded-xl border transition-all",
                    settings.pageStyle === style.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/50 bg-card hover:border-primary/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{style.label}</p>
                      <p className="text-xs text-muted-foreground">{style.description}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{style.category}</span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {activeTab === 'effects' && (
            <motion.div key="effects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Font Size */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Font Size — {settings.fontSize}px</label>
                <input
                  type="range" min={14} max={36} value={settings.fontSize}
                  onChange={(e) => onUpdateSettings({ fontSize: parseInt(e.target.value) })}
                  className="w-full mt-1.5 accent-primary"
                />
              </div>

              {/* Line Spacing */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Line Spacing — {settings.lineSpacing}px</label>
                <input
                  type="range" min={20} max={50} value={settings.lineSpacing}
                  onChange={(e) => onUpdateSettings({ lineSpacing: parseInt(e.target.value) })}
                  className="w-full mt-1.5 accent-primary"
                />
              </div>

              {/* Word Spacing */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Word Spacing — {settings.wordSpacing}px</label>
                <input
                  type="range" min={0} max={12} value={settings.wordSpacing}
                  onChange={(e) => onUpdateSettings({ wordSpacing: parseInt(e.target.value) })}
                  className="w-full mt-1.5 accent-primary"
                />
              </div>

              {/* Jitter Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50">
                <div>
                  <p className="text-sm font-medium">Baseline Jitter</p>
                  <p className="text-xs text-muted-foreground">Natural handwriting wobble</p>
                </div>
                <button
                  onClick={() => onUpdateSettings({ baselineJitter: !settings.baselineJitter })}
                  className={cn(
                    "w-11 h-6 rounded-full transition-all relative",
                    settings.baselineJitter ? "bg-primary" : "bg-muted"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all",
                    settings.baselineJitter ? "left-[22px]" : "left-0.5"
                  )} />
                </button>
              </div>

              {/* Stroke Randomness Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50">
                <div>
                  <p className="text-sm font-medium">Stroke Randomness</p>
                  <p className="text-xs text-muted-foreground">Vary stroke weight naturally</p>
                </div>
                <button
                  onClick={() => onUpdateSettings({ strokeRandomness: !settings.strokeRandomness })}
                  className={cn(
                    "w-11 h-6 rounded-full transition-all relative",
                    settings.strokeRandomness ? "bg-primary" : "bg-muted"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all",
                    settings.strokeRandomness ? "left-[22px]" : "left-0.5"
                  )} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
