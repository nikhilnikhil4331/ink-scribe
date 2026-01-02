import React, { useState } from 'react';
import { FONT_OPTIONS, HandwritingFont, InkColor } from '@/types/notes';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Check, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FontPreviewPanelProps {
  selectedFont: HandwritingFont;
  onSelectFont: (font: HandwritingFont) => void;
  inkColor: InkColor;
}

export const FontPreviewPanel: React.FC<FontPreviewPanelProps> = ({
  selectedFont,
  onSelectFont,
  inkColor,
}) => {
  const [open, setOpen] = useState(false);
  const [sampleText, setSampleText] = useState('The quick brown fox jumps over the lazy dog');
  
  const selectedFontOption = FONT_OPTIONS.find(f => f.value === selectedFont);
  const inkClass = `ink-${inkColor}`;

  // Group fonts by category
  const fontCategories = FONT_OPTIONS.reduce((acc, font) => {
    if (!acc[font.category]) acc[font.category] = [];
    acc[font.category].push(font);
    return acc;
  }, {} as Record<string, typeof FONT_OPTIONS>);

  const handleSelectFont = (font: HandwritingFont) => {
    onSelectFont(font);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between h-auto py-3 px-4"
        >
          <div className="flex flex-col items-start gap-1">
            <span className="text-xs text-muted-foreground">Current Font</span>
            <span className={cn(selectedFontOption?.className, 'text-lg', inkClass)}>
              {selectedFontOption?.label}
            </span>
          </div>
          <Type className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Choose Handwriting Style</DialogTitle>
        </DialogHeader>
        
        {/* Sample text input */}
        <div className="mb-4">
          <Input
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            placeholder="Type sample text to preview..."
            className="text-base"
          />
        </div>

        {/* Font grid */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {Object.entries(fontCategories).map(([category, fonts]) => (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 sticky top-0 bg-background py-1">
                {category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fonts.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => handleSelectFont(font.value)}
                    className={cn(
                      'relative p-4 rounded-lg border-2 text-left transition-all hover:border-primary/50 hover:bg-accent/50',
                      selectedFont === font.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border bg-card'
                    )}
                  >
                    {/* Selected indicator */}
                    {selectedFont === font.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    
                    {/* Font name */}
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      {font.label}
                    </div>
                    
                    {/* Sample text preview */}
                    <div 
                      className={cn(
                        font.className, 
                        inkClass,
                        'text-xl leading-relaxed line-clamp-2 min-h-[3rem]'
                      )}
                    >
                      {sampleText || 'Sample text preview'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
