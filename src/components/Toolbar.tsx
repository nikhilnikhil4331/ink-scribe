import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Download, FileImage, FileText, Moon, Sun, RotateCcw, Loader2, ChevronDown } from 'lucide-react';

interface ToolbarProps {
  onExportPDF: () => void;
  onExportPNG: () => void;
  onExportJPEG: () => void;
  onReset: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  isExporting: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onExportPDF,
  onExportPNG,
  onExportJPEG,
  onReset,
  isDark,
  onToggleDark,
  isExporting,
}) => {
  return (
    <div className="flex items-center gap-1.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            className="gap-2 rounded-xl gradient-bg shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-200 px-4"
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="font-medium">{isExporting ? 'Exporting...' : 'Export'}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 rounded-xl p-2">
          <DropdownMenuItem onClick={onExportPDF} className="gap-3 cursor-pointer rounded-lg p-3 focus:bg-secondary">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-sm">PDF Document</p>
              <p className="text-[10px] text-muted-foreground">Best for printing</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem onClick={onExportPNG} className="gap-3 cursor-pointer rounded-lg p-3 focus:bg-secondary">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileImage className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="font-medium text-sm">PNG Image</p>
              <p className="text-[10px] text-muted-foreground">High quality</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportJPEG} className="gap-3 cursor-pointer rounded-lg p-3 focus:bg-secondary">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <FileImage className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-sm">JPEG Image</p>
              <p className="text-[10px] text-muted-foreground">Smaller file size</p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
