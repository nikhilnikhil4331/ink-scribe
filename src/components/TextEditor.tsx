import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ value, onChange }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm text-foreground">Your Text</h3>
        <span className="text-xs text-muted-foreground">
          {value.length} characters • {value.split('\n').length} lines
        </span>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Start typing your notes here...

You can write multiple lines.
Each line will be rendered in your chosen handwriting style.

Try adjusting the settings on the right to customize the look!"
        className="flex-1 resize-none text-base leading-relaxed font-sans bg-card border-border focus-visible:ring-primary/20 min-h-[300px]"
      />
    </div>
  );
};
