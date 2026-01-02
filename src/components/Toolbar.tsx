import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Download, FileImage, FileText, Moon, Sun, RotateCcw } from 'lucide-react';

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
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="default" 
            className="gap-2"
            disabled={isExporting}
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onExportPDF} className="gap-2 cursor-pointer">
            <FileText className="w-4 h-4" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onExportPNG} className="gap-2 cursor-pointer">
            <FileImage className="w-4 h-4" />
            Export as PNG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportJPEG} className="gap-2 cursor-pointer">
            <FileImage className="w-4 h-4" />
            Export as JPEG
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" size="icon" onClick={onReset} title="Reset settings">
        <RotateCcw className="w-4 h-4" />
      </Button>

      <Button variant="outline" size="icon" onClick={onToggleDark} title="Toggle dark mode">
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </Button>
    </div>
  );
};
