import React from 'react';
import { motion } from 'framer-motion';
import { PenTool, Trash2, Check, Star } from 'lucide-react';
import { HandwritingModel } from '@/hooks/useHandwritingModels';
import { FONT_OPTIONS } from '@/types/notes';

interface HandwritingStyleCardProps {
  model: HandwritingModel;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export const HandwritingStyleCard: React.FC<HandwritingStyleCardProps> = ({
  model,
  isActive,
  onSelect,
  onDelete,
}) => {
  const fontOption = FONT_OPTIONS.find(f => f.value === model.suggested_font);
  const fontClass = fontOption?.className || 'font-handwriting-1';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`group relative bg-card rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-300 ${
        isActive 
          ? 'border-primary shadow-lg shadow-primary/10' 
          : 'border-border hover:border-primary/30 hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
            <Check className="w-3 h-3" />
            Active
          </div>
        </div>
      )}

      {/* Default star */}
      {model.is_default && (
        <div className="absolute top-3 right-3 z-10">
          <Star className="w-5 h-5 text-accent fill-accent" />
        </div>
      )}

      {/* Preview area */}
      <div className="h-24 bg-gradient-to-br from-paper to-paper-ruled flex items-center justify-center p-4">
        <p 
          className={`${fontClass} text-xl text-foreground text-center leading-relaxed`}
          style={{ fontSize: `${model.font_size}px` }}
        >
          The quick brown fox
        </p>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-1">{model.name}</h3>
        <p className="text-xs text-muted-foreground">
          {fontOption?.label || model.suggested_font} • {model.ink_color}
        </p>
        {model.analysis_notes && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {model.analysis_notes}
          </p>
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute bottom-3 right-3 p-2 rounded-lg bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
