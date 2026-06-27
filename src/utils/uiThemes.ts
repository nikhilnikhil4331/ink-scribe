// ============================================================
// NikNote 4.0 — UI Theme System
// 10 Design Systems: Skeuomorphism, Neomorphism, Glassmorphism,
// Claymorphism, Minimalism, Maximalism, Brutalism,
// Liquid Glass, Bento Grid, Spatial UI
// ============================================================

export type UITheme =
  | 'glassmorphism'   // Default — current NikNote style
  | 'skeuomorphism'   // Realistic textures, leather, wood
  | 'neomorphism'     // Soft shadows, embossed look
  | 'claymorphism'    // Puffy, clay-like, rounded
  | 'minimalism'      // Clean, white space, subtle
  | 'maximalism'      // Bold, colorful, layered
  | 'brutalism'       // Raw, bold borders, monospace
  | 'liquid-glass'    // Frosted glass with liquid effects
  | 'bento-grid'      // Grid-based, card layout
  | 'spatial-ui';     // 3D depth, parallax

export const UI_THEMES: { value: UITheme; label: string; emoji: string; desc: string }[] = [
  { value: 'glassmorphism', label: 'Glassmorphism', emoji: '🪟', desc: 'Frosted glass, blur, transparency' },
  { value: 'skeuomorphism', label: 'Skeuomorphism', emoji: '📓', desc: 'Realistic notebook textures' },
  { value: 'neomorphism', label: 'Neomorphism', emoji: '🫧', desc: 'Soft shadows, embossed' },
  { value: 'claymorphism', label: 'Claymorphism', emoji: '🎨', desc: 'Puffy clay-like shapes' },
  { value: 'minimalism', label: 'Minimalism', emoji: '⬜', desc: 'Clean, white, subtle' },
  { value: 'maximalism', label: 'Maximalism', emoji: '🌈', desc: 'Bold, colorful, layered' },
  { value: 'brutalism', label: 'Brutalism', emoji: '🧱', desc: 'Raw, bold, monospace' },
  { value: 'liquid-glass', label: 'Liquid Glass', emoji: '💧', desc: 'Apple-like frosted liquid' },
  { value: 'bento-grid', label: 'Bento Grid', emoji: '📦', desc: 'Card-based grid layout' },
  { value: 'spatial-ui', label: 'Spatial UI', emoji: '🌐', desc: '3D depth, parallax' },
];

// Generate CSS variables per theme
export function getThemeCSS(theme: UITheme): React.CSSProperties {
  switch (theme) {
    case 'glassmorphism':
      return {
        '--theme-bg': 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        '--theme-surface': 'rgba(255,255,255,0.25)',
        '--theme-surface-border': 'rgba(255,255,255,0.3)',
        '--theme-surface-shadow': '0 8px 32px rgba(0,0,0,0.08)',
        '--theme-blur': '20px',
        '--theme-text': '#1a1a2e',
        '--theme-accent': '#7c3aed',
        '--theme-radius': '16px',
      } as React.CSSProperties;

    case 'skeuomorphism':
      return {
        '--theme-bg': '#d4c5a9',
        '--theme-surface': '#f5f0e1',
        '--theme-surface-border': '#b8a88a',
        '--theme-surface-shadow': '4px 4px 8px rgba(0,0,0,0.3), -2px -2px 4px rgba(255,255,255,0.4)',
        '--theme-blur': '0px',
        '--theme-text': '#2c1810',
        '--theme-accent': '#8b4513',
        '--theme-radius': '8px',
      } as React.CSSProperties;

    case 'neomorphism':
      return {
        '--theme-bg': '#e0e5ec',
        '--theme-surface': '#e0e5ec',
        '--theme-surface-border': 'transparent',
        '--theme-surface-shadow': '8px 8px 16px #b8bec7, -8px -8px 16px #ffffff',
        '--theme-blur': '0px',
        '--theme-text': '#2d3436',
        '--theme-accent': '#6c5ce7',
        '--theme-radius': '20px',
      } as React.CSSProperties;

    case 'claymorphism':
      return {
        '--theme-bg': '#f0e6ff',
        '--theme-surface': '#f8f4ff',
        '--theme-surface-border': 'rgba(180,160,220,0.3)',
        '--theme-surface-shadow': '0 8px 24px rgba(140,100,200,0.2), inset 0 -4px 12px rgba(0,0,0,0.05), inset 0 4px 12px rgba(255,255,255,0.6)',
        '--theme-blur': '0px',
        '--theme-text': '#2d1b69',
        '--theme-accent': '#9b59b6',
        '--theme-radius': '24px',
      } as React.CSSProperties;

    case 'minimalism':
      return {
        '--theme-bg': '#fafafa',
        '--theme-surface': '#ffffff',
        '--theme-surface-border': '#f0f0f0',
        '--theme-surface-shadow': '0 1px 3px rgba(0,0,0,0.04)',
        '--theme-blur': '0px',
        '--theme-text': '#111111',
        '--theme-accent': '#000000',
        '--theme-radius': '8px',
      } as React.CSSProperties;

    case 'maximalism':
      return {
        '--theme-bg': 'linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3)',
        '--theme-surface': 'rgba(255,255,255,0.9)',
        '--theme-surface-border': 'rgba(255,107,107,0.3)',
        '--theme-surface-shadow': '0 12px 40px rgba(255,107,107,0.2), 0 4px 16px rgba(72,219,251,0.15)',
        '--theme-blur': '12px',
        '--theme-text': '#1a1a2e',
        '--theme-accent': '#e84393',
        '--theme-radius': '20px',
      } as React.CSSProperties;

    case 'brutalism':
      return {
        '--theme-bg': '#fffbe6',
        '--theme-surface': '#ffffff',
        '--theme-surface-border': '#000000',
        '--theme-surface-shadow': '4px 4px 0px #000000',
        '--theme-blur': '0px',
        '--theme-text': '#000000',
        '--theme-accent': '#ff0000',
        '--theme-radius': '0px',
      } as React.CSSProperties;

    case 'liquid-glass':
      return {
        '--theme-bg': 'linear-gradient(180deg, #e8f4f8 0%, #d1ecf1 50%, #bee5eb 100%)',
        '--theme-surface': 'rgba(255,255,255,0.35)',
        '--theme-surface-border': 'rgba(255,255,255,0.5)',
        '--theme-surface-shadow': '0 8px 32px rgba(31,135,156,0.1), inset 0 1px 2px rgba(255,255,255,0.6)',
        '--theme-blur': '24px',
        '--theme-text': '#0c4a6e',
        '--theme-accent': '#0284c7',
        '--theme-radius': '20px',
      } as React.CSSProperties;

    case 'bento-grid':
      return {
        '--theme-bg': '#f8fafc',
        '--theme-surface': '#ffffff',
        '--theme-surface-border': '#e2e8f0',
        '--theme-surface-shadow': '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        '--theme-blur': '0px',
        '--theme-text': '#1e293b',
        '--theme-accent': '#6366f1',
        '--theme-radius': '16px',
      } as React.CSSProperties;

    case 'spatial-ui':
      return {
        '--theme-bg': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        '--theme-surface': 'rgba(51,65,85,0.6)',
        '--theme-surface-border': 'rgba(148,163,184,0.2)',
        '--theme-surface-shadow': '0 24px 48px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.1)',
        '--theme-blur': '16px',
        '--theme-text': '#f1f5f9',
        '--theme-accent': '#38bdf8',
        '--theme-radius': '20px',
      } as React.CSSProperties;
  }
}

// Get theme class names for the main layout
export function getThemeClasses(theme: UITheme): {
  wrapper: string;
  header: string;
  surface: string;
  button: string;
  activeTab: string;
  card: string;
} {
  const base = {
    wrapper: '',
    header: '',
    surface: '',
    button: '',
    activeTab: '',
    card: '',
  };

  switch (theme) {
    case 'skeuomorphism':
      return {
        ...base,
        wrapper: 'bg-[#d4c5a9]',
        header: 'bg-[#f5f0e1] border-[#b8a88a] shadow-[4px_4px_8px_rgba(0,0,0,0.3)]',
        surface: 'bg-[#f5f0e1] border-[#b8a88a] shadow-[4px_4px_8px_rgba(0,0,0,0.3),-2px_-2px_4px_rgba(255,255,255,0.4)]',
        button: 'bg-[#d4c5a9] shadow-[2px_2px_4px_rgba(0,0,0,0.3),-1px_-1px_2px_rgba(255,255,255,0.4)] border-[#b8a88a]',
        activeTab: 'bg-[#8b4513] text-white shadow-inner',
        card: 'bg-[#f5f0e1] border-[#b8a88a]',
      };

    case 'neomorphism':
      return {
        ...base,
        wrapper: 'bg-[#e0e5ec]',
        header: 'bg-[#e0e5ec] shadow-[6px_6px_12px_#b8bec7,-6px_-6px_12px_#ffffff] border-none',
        surface: 'bg-[#e0e5ec] shadow-[8px_8px_16px_#b8bec7,-8px_-8px_16px_#ffffff] border-none',
        button: 'bg-[#e0e5ec] shadow-[4px_4px_8px_#b8bec7,-4px_-4px_8px_#ffffff] border-none',
        activeTab: 'shadow-[inset_4px_4px_8px_#b8bec7,inset_-4px_-4px_8px_#ffffff] text-[#6c5ce7]',
        card: 'bg-[#e0e5ec] shadow-[6px_6px_12px_#b8bec7,-6px_-6px_12px_#ffffff] border-none',
      };

    case 'claymorphism':
      return {
        ...base,
        wrapper: 'bg-[#f0e6ff]',
        header: 'bg-[#f8f4ff] border-[rgba(180,160,220,0.3)] shadow-[0_8px_24px_rgba(140,100,200,0.2),inset_0_-4px_12px_rgba(0,0,0,0.05),inset_0_4px_12px_rgba(255,255,255,0.6)]',
        surface: 'bg-[#f8f4ff] border-[rgba(180,160,220,0.3)] shadow-[0_12px_32px_rgba(140,100,200,0.25),inset_0_-6px_16px_rgba(0,0,0,0.06),inset_0_6px_16px_rgba(255,255,255,0.7)]',
        button: 'bg-[#e8d5ff] shadow-[0_6px_16px_rgba(140,100,200,0.3),inset_0_-3px_8px_rgba(0,0,0,0.08),inset_0_3px_8px_rgba(255,255,255,0.5)] border-[rgba(180,160,220,0.3)]',
        activeTab: 'bg-[#9b59b6] text-white shadow-[0_4px_12px_rgba(155,89,182,0.4)]',
        card: 'bg-[#f8f4ff] border-[rgba(180,160,220,0.2)]',
      };

    case 'minimalism':
      return {
        ...base,
        wrapper: 'bg-[#fafafa]',
        header: 'bg-white border-[#f0f0f0] shadow-none',
        surface: 'bg-white border-[#f0f0f0] shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
        button: 'bg-white border-[#e5e5e5] shadow-none hover:bg-[#f5f5f5]',
        activeTab: 'bg-black text-white',
        card: 'bg-white border-[#f0f0f0] shadow-none',
      };

    case 'maximalism':
      return {
        ...base,
        wrapper: 'bg-gradient-to-br from-pink-200 via-yellow-100 to-cyan-200',
        header: 'bg-white/80 border-pink-200 shadow-[0_8px_32px_rgba(255,107,107,0.15)]',
        surface: 'bg-white/90 border-pink-200 shadow-[0_12px_40px_rgba(255,107,107,0.15),0_4px_16px_rgba(72,219,251,0.1)]',
        button: 'bg-gradient-to-r from-pink-400 to-violet-400 text-white border-none shadow-[0_4px_16px_rgba(255,107,107,0.3)]',
        activeTab: 'bg-gradient-to-r from-pink-500 to-violet-500 text-white',
        card: 'bg-white/90 border-pink-200',
      };

    case 'brutalism':
      return {
        ...base,
        wrapper: 'bg-[#fffbe6]',
        header: 'bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-none',
        surface: 'bg-white border-2 border-black shadow-[4px_4px_0px_#000] rounded-none',
        button: 'bg-white border-2 border-black shadow-[2px_2px_0px_#000] rounded-none hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
        activeTab: 'bg-black text-white border-2 border-black',
        card: 'bg-white border-2 border-black',
      };

    case 'liquid-glass':
      return {
        ...base,
        wrapper: 'bg-gradient-to-b from-[#e8f4f8] via-[#d1ecf1] to-[#bee5eb]',
        header: 'bg-white/30 backdrop-blur-2xl border-white/40 shadow-[0_8px_32px_rgba(31,135,156,0.08)]',
        surface: 'bg-white/35 backdrop-blur-2xl border-white/50 shadow-[0_8px_32px_rgba(31,135,156,0.1),inset_0_1px_2px_rgba(255,255,255,0.6)]',
        button: 'bg-white/30 backdrop-blur-lg border-white/40 shadow-[0_4px_16px_rgba(31,135,156,0.1)]',
        activeTab: 'bg-[#0284c7]/20 text-[#0284c7] border-[#0284c7]/30',
        card: 'bg-white/30 backdrop-blur-xl border-white/40',
      };

    case 'bento-grid':
      return {
        ...base,
        wrapper: 'bg-[#f8fafc]',
        header: 'bg-white border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)]',
        surface: 'bg-white border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)]',
        button: 'bg-[#f1f5f9] border-[#e2e8f0] shadow-none hover:bg-[#e2e8f0]',
        activeTab: 'bg-[#6366f1] text-white shadow-[0_2px_8px_rgba(99,102,241,0.3)]',
        card: 'bg-white border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)]',
      };

    case 'spatial-ui':
      return {
        ...base,
        wrapper: 'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155]',
        header: 'bg-[rgba(51,65,85,0.6)] backdrop-blur-xl border-[rgba(148,163,184,0.15)] shadow-[0_24px_48px_rgba(0,0,0,0.3)]',
        surface: 'bg-[rgba(51,65,85,0.5)] backdrop-blur-xl border-[rgba(148,163,184,0.15)] shadow-[0_24px_48px_rgba(0,0,0,0.25),0_8px_16px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.08)]',
        button: 'bg-[rgba(51,65,85,0.6)] backdrop-blur-lg border-[rgba(148,163,184,0.2)] text-[#f1f5f9]',
        activeTab: 'bg-[#38bdf8]/20 text-[#38bdf8] border-[#38bdf8]/30',
        card: 'bg-[rgba(51,65,85,0.5)] backdrop-blur-xl border-[rgba(148,163,184,0.15)]',
      };

    default: // glassmorphism
      return {
        ...base,
        wrapper: '',
        header: 'bg-white/20 backdrop-blur-2xl border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
        surface: 'bg-white/20 backdrop-blur-xl border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.06)]',
        button: 'bg-white/30 backdrop-blur-sm border-white/25',
        activeTab: 'bg-primary/10 text-primary border-primary/20',
        card: 'bg-white/20 backdrop-blur-xl border-white/25',
      };
  }
}

// Hook to persist theme
export function useUITheme() {
  const STORAGE_KEY = 'niknote-ui-theme';

  const getInitialTheme = (): UITheme => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && UI_THEMES.some(t => t.value === saved)) return saved as UITheme;
    } catch {}
    return 'glassmorphism';
  };

  const [theme, setThemeState] = React.useState<UITheme>(getInitialTheme);

  const setTheme = (newTheme: UITheme) => {
    setThemeState(newTheme);
    try { localStorage.setItem(STORAGE_KEY, newTheme); } catch {}
  };

  return { theme, setTheme, css: getThemeCSS(theme), classes: getThemeClasses(theme) };
}

import React from 'react';
