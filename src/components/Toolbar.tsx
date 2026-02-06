import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Moon, Sun, RotateCcw, Loader2 } from 'lucide-react';

interface ToolbarProps {
  onExportPDF: () => void;
  onReset: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  isExporting: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onExportPDF,
  onReset,
  isDark,
  onToggleDark,
  isExporting,
}) => {
  return (
    <div className="flex items-center gap-1.5">
      <Button 
        className="gap-2 rounded-xl gradient-bg shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-200 px-4"
        disabled={isExporting}
        onClick={onExportPDF}
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span className="font-medium">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
      </Button>

      <Button 
        variant="outline" 
        size="icon" 
        onClick={onReset} 
        title="Reset settings"
        className="rounded-xl border-border/60 hover:bg-secondary/80 hover:border-border"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>

      <Button 
        variant="outline" 
        size="icon" 
        onClick={onToggleDark} 
        title="Toggle dark mode"
        className="rounded-xl border-border/60 hover:bg-secondary/80 hover:border-border"
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </Button>
    </div>
  );
};
