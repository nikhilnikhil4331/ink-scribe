import { useState, useEffect, useCallback } from 'react';
import { MoodType } from '@/components/MoodSelector';

interface MoodStyles {
  background: string;
  paper: string;
  paperTexture: string;
  textClass: string;
}

const moodStylesMap: Record<MoodType, MoodStyles> = {
  calm: {
    background: 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900',
    paper: 'bg-white dark:bg-zinc-800',
    paperTexture: '',
    textClass: 'text-slate-800 dark:text-slate-200',
  },
  focus: {
    background: 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-900',
    paper: 'bg-slate-50 dark:bg-slate-800',
    paperTexture: '',
    textClass: 'text-slate-900 dark:text-slate-100',
  },
  dark: {
    background: 'bg-gradient-to-br from-zinc-900 via-slate-900 to-neutral-900',
    paper: 'bg-zinc-800',
    paperTexture: '',
    textClass: 'text-zinc-100',
  },
  vintage: {
    background: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950',
    paper: 'bg-amber-50/80 dark:bg-amber-900/30',
    paperTexture: 'bg-[url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.05\'/%3E%3C/svg%3E")]',
    textClass: 'text-amber-900 dark:text-amber-100',
  },
  study: {
    background: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950',
    paper: 'bg-emerald-50/60 dark:bg-emerald-900/20',
    paperTexture: '',
    textClass: 'text-emerald-900 dark:text-emerald-100',
  },
};

export function useMood() {
  const [mood, setMood] = useState<MoodType>(() => {
    const saved = localStorage.getItem('nikhil-notes-mood');
    return (saved as MoodType) || 'calm';
  });

  useEffect(() => {
    localStorage.setItem('nikhil-notes-mood', mood);
    
    // Apply dark class based on mood
    if (mood === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      // Only remove if not manually set to dark
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (!prefersDark) {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [mood]);

  const changeMood = useCallback((newMood: MoodType) => {
    setMood(newMood);
  }, []);

  const styles = moodStylesMap[mood];

  return {
    mood,
    changeMood,
    styles,
  };
}
