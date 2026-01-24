import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, BookOpen, Coffee, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MoodType = 'calm' | 'focus' | 'dark' | 'vintage' | 'study';

interface MoodOption {
  id: MoodType;
  name: string;
  icon: React.ReactNode;
  colors: {
    bg: string;
    paper: string;
    accent: string;
  };
}

const moods: MoodOption[] = [
  {
    id: 'calm',
    name: 'Calm',
    icon: <Sun className="w-4 h-4" />,
    colors: {
      bg: 'from-sky-50 to-blue-50',
      paper: 'bg-white',
      accent: 'bg-sky-500',
    },
  },
  {
    id: 'focus',
    name: 'Focus',
    icon: <Sparkles className="w-4 h-4" />,
    colors: {
      bg: 'from-indigo-50 to-purple-50',
      paper: 'bg-slate-50',
      accent: 'bg-indigo-500',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    icon: <Moon className="w-4 h-4" />,
    colors: {
      bg: 'from-slate-900 to-zinc-900',
      paper: 'bg-zinc-800',
      accent: 'bg-violet-500',
    },
  },
  {
    id: 'vintage',
    name: 'Vintage',
    icon: <Coffee className="w-4 h-4" />,
    colors: {
      bg: 'from-amber-50 to-orange-50',
      paper: 'bg-amber-50',
      accent: 'bg-amber-600',
    },
  },
  {
    id: 'study',
    name: 'Study',
    icon: <BookOpen className="w-4 h-4" />,
    colors: {
      bg: 'from-emerald-50 to-teal-50',
      paper: 'bg-emerald-50/50',
      accent: 'bg-emerald-500',
    },
  },
];

interface MoodSelectorProps {
  currentMood: MoodType;
  onMoodChange: (mood: MoodType) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ currentMood, onMoodChange }) => {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-secondary/50 rounded-xl">
      {moods.map((mood) => (
        <motion.button
          key={mood.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onMoodChange(mood.id)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200",
            currentMood === mood.id
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          <span className={cn(
            "p-1 rounded-md transition-colors",
            currentMood === mood.id ? mood.colors.accent + " text-white" : "bg-transparent"
          )}>
            {mood.icon}
          </span>
          <span className="text-xs font-medium hidden sm:inline">{mood.name}</span>
        </motion.button>
      ))}
    </div>
  );
};

export const getMoodStyles = (mood: MoodType) => {
  const moodConfig = moods.find(m => m.id === mood) || moods[0];
  return moodConfig.colors;
};

export { moods };
