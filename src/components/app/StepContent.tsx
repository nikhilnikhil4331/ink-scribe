import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { NoteLine, LineInkColor } from '@/types/noteLine';
import { LineBasedEditor } from '@/components/LineBasedEditor';

interface StepContentProps {
  lines: NoteLine[];
  currentColor: LineInkColor;
  onUpdateLineText: (lineId: string, text: string) => void;
  onAddLine: (afterLineId?: string) => string;
  onRemoveLine: (lineId: string) => void;
  onMergeLinesUp: (lineId: string) => void;
  onPaste: (text: string, atLineId?: string) => void;
  onColorChange: (color: LineInkColor) => void;
}

export const StepContent: React.FC<StepContentProps> = ({
  lines,
  currentColor,
  onUpdateLineText,
  onAddLine,
  onRemoveLine,
  onMergeLinesUp,
  onPaste,
  onColorChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Editor Area */}
      <div ref={editorRef} className="flex-1 overflow-y-auto px-3 pt-2 pb-24">
        <div className="max-w-2xl mx-auto">
          <LineBasedEditor
            lines={lines}
            selectedLines={new Set()}
            currentColor={currentColor}
            realPenMode={false}
            onLineTextChange={onUpdateLineText}
            onLineColorChange={(id, color) => onColorChange(color)}
            onAddLine={onAddLine}
            onRemoveLine={onRemoveLine}
            onSelectLine={() => {}}
            onMergeLinesUp={onMergeLinesUp}
            onPaste={onPaste}
          />
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => onAddLine()}
        className="fixed bottom-24 right-5 z-30 w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/25 flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  );
};
