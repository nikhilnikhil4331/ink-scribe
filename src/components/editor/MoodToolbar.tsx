import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Focus, Moon, Clock, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MoodType = 'calm' | 'focus' | 'dark' | 'vintage' | 'study';

interface MoodToolbarProps {
  currentMood: MoodType;
  onMoodChange: (mood: MoodType) => void;
}

const moods: { id: MoodType; label: string; icon: React.ReactNode; gradient: string }[] = [
  { 
    id: 'calm', 
    label: 'Calm', 
    icon: <Sun className="w-4 h-4" />,
    gradient: 'from-sky-100 to-cyan-50'
  },
  { 
    id: 'focus', 
    label: 'Focus', 
    icon: <Focus className="w-4 h-4" />,
    gradient: 'from-indigo-100 to-blue-50'
  },
  { 
    id: 'dark', 
    label: 'Dark', 
    icon: <Moon className="w-4 h-4" />,
    gradient: 'from-slate-600 to-zinc-700'
  },
  { 
    id: 'vintage', 
    label: 'Vintage', 
    icon: <Clock className="w-4 h-4" />,
    gradient: 'from-amber-100 to-orange-50'
  },
  { 
    id: 'study', 
    label: 'Study', 
    icon: <GraduationCap className="w-4 h-4" />,
    gradient: 'from-emerald-100 to-teal-50'
  },
];

export const MoodToolbar: React.FC<MoodToolbarProps> = ({
  currentMood,
  onMoodChange,
}) => {
  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed top-[88px] left-1/2 -translate-x-1/2 z-40"
    >
      <div className={cn(
        "flex items-center gap-1.5",
        "px-2 py-1.5 rounded-full",
        "bg-card/90 backdrop-blur-2xl",
        "border border-border/40",
        "shadow-soft"
      )}>
        {moods.map((mood) => (
          <motion.button
            key={mood.id}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => onMoodChange(mood.id)}
            className={cn(
              "flex items-center gap-1.5",
              "px-3 py-2 rounded-full",
              "text-xs font-medium",
              "transition-all duration-200",
              currentMood === mood.id
                ? cn(
                    "bg-gradient-to-r",
                    mood.gradient,
                    mood.id === 'dark' ? "text-white" : "text-foreground",
                    "shadow-sm"
                  )
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {mood.icon}
            <span className="hidden sm:inline">{mood.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

MoodToolbar.displayName = 'MoodToolbar';
