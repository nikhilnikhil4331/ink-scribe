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
    background: 'lovable-bg-calm',
    paper: 'bg-white/60 dark:bg-zinc-800/60',
    paperTexture: '',
    textClass: 'text-slate-800 dark:text-slate-200',
  },
  focus: {
    background: 'lovable-bg-focus',
    paper: 'bg-slate-50/60 dark:bg-slate-800/60',
    paperTexture: '',
    textClass: 'text-slate-900 dark:text-slate-100',
  },
  dark: {
    background: 'lovable-bg-dark',
    paper: 'bg-zinc-800/60',
    paperTexture: '',
    textClass: 'text-zinc-100',
  },
  vintage: {
    background: 'lovable-bg-vintage',
    paper: 'bg-amber-50/60 dark:bg-amber-900/30',
    paperTexture: '',
    textClass: 'text-amber-900 dark:text-amber-100',
  },
  study: {
    background: 'lovable-bg-study',
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
    
    if (mood === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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
