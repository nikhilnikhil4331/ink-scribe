import React from 'react';
import { NoteSettings, PAGE_STYLE_OPTIONS, INK_COLOR_OPTIONS, DiagramImage } from '@/types/notes';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { FontPreviewPanel } from './FontPreviewPanel';
import { TableConfigPanel } from './TableConfigPanel';
import { DiagramImport } from './DiagramImport';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Type, 
  Palette, 
  AlignLeft, 
  FileText, 
  Sparkles,
  User,
  Hash,
  BookOpen,
  Image
} from 'lucide-react';

interface ControlPanelProps {
  settings: NoteSettings;
  updateSettings: (updates: Partial<NoteSettings>) => void;
  updateMargins: (updates: Partial<NoteSettings['margins']>) => void;
  updateHeaderFooter: (updates: Partial<NoteSettings['headerFooter']>) => void;
  tableData: string[][];
  onTableDataChange: (data: string[][]) => void;
  diagrams: DiagramImage[];
  onAddDiagram: (diagram: DiagramImage) => void;
  onRemoveDiagram: (id: string) => void;
  onUpdateDiagram: (id: string, updates: Partial<DiagramImage>) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  settings,
  updateSettings,
  updateMargins,
  updateHeaderFooter,
  tableData,
  onTableDataChange,
  diagrams,
  onAddDiagram,
  onRemoveDiagram,
  onUpdateDiagram,
}) => {
  return (
    <div className="h-full overflow-y-auto scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
      {/* Font Selection */}
      <div className="control-section">
        <div className="flex items-center gap-2 mb-3">
          <Type className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Typography</span>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="control-label">Handwriting Style</Label>
            <FontPreviewPanel
              selectedFont={settings.font}
              onSelectFont={(font) => updateSettings({ font })}
              inkColor={settings.inkColor}
            />
          </div>

          <div>
            <Label className="control-label">Font Size: {settings.fontSize}px</Label>
            <Slider
              value={[settings.fontSize]}
              onValueChange={([value]) => updateSettings({ fontSize: value })}
              min={16}
              max={40}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="control-label">Line Spacing: {settings.lineSpacing}px</Label>
            <Slider
              value={[settings.lineSpacing]}
              onValueChange={([value]) => updateSettings({ lineSpacing: value })}
              min={24}
              max={60}
              step={2}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="control-label">Word Spacing: {settings.wordSpacing}px</Label>
            <Slider
              value={[settings.wordSpacing]}
              onValueChange={([value]) => updateSettings({ wordSpacing: value })}
              min={2}
              max={12}
              step={1}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Ink & Page Style */}
      <div className="control-section">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Ink & Paper</span>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="control-label">Ink Color</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {INK_COLOR_OPTIONS.map((ink) => (
                <button
                  key={ink.value}
                  onClick={() => updateSettings({ inkColor: ink.value })}
                  className={`
                    flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all
                    ${settings.inkColor === ink.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-transparent hover:border-border hover:bg-muted/50'
                    }
                  `}
                >
                  <div className={`w-5 h-5 rounded-full bg-ink-${ink.value}`} />
                  <span className="text-xs text-muted-foreground">{ink.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="control-label">Page Style</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {PAGE_STYLE_OPTIONS.map((style) => (
                <button
                  key={style.value}
                  onClick={() => updateSettings({ pageStyle: style.value })}
                  className={`
                    flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left
                    ${settings.pageStyle === style.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <span className="text-sm font-medium">{style.label}</span>
                  <span className="text-xs text-muted-foreground">{style.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Margins */}
      <div className="control-section">
        <div className="flex items-center gap-2 mb-3">
          <AlignLeft className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Margins</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="control-label">Top</Label>
            <Slider
              value={[settings.margins.top]}
              onValueChange={([value]) => updateMargins({ top: value })}
              min={20}
              max={80}
              step={5}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="control-label">Bottom</Label>
            <Slider
              value={[settings.margins.bottom]}
              onValueChange={([value]) => updateMargins({ bottom: value })}
              min={20}
              max={80}
              step={5}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="control-label">Left</Label>
            <Slider
              value={[settings.margins.left]}
              onValueChange={([value]) => updateMargins({ left: value })}
              min={20}
              max={80}
              step={5}
              className="mt-2"
            />
          </div>
          <div>
            <Label className="control-label">Right</Label>
            <Slider
              value={[settings.margins.right]}
              onValueChange={([value]) => updateMargins({ right: value })}
              min={20}
              max={80}
              step={5}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Table */}
      <div className="control-section">
        <TableConfigPanel
          settings={settings}
          updateSettings={updateSettings}
          tableData={tableData}
          onTableDataChange={onTableDataChange}
        />
      </div>

      <Separator />

      {/* Diagrams */}
      <div className="control-section">
        <div className="flex items-center gap-2 mb-3">
          <Image className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Diagrams & Images</span>
        </div>
        <DiagramImport
          diagrams={diagrams}
          onAddDiagram={onAddDiagram}
          onRemoveDiagram={onRemoveDiagram}
          onUpdateDiagram={onUpdateDiagram}
          inkColor={settings.inkColor}
        />
      </div>

      <Separator />

      {/* Realism Effects */}
      <div className="control-section">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Realism Effects</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Baseline Jitter</Label>
            <Switch
              checked={settings.baselineJitter}
              onCheckedChange={(checked) => updateSettings({ baselineJitter: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Stroke Randomness</Label>
            <Switch
              checked={settings.strokeRandomness}
              onCheckedChange={(checked) => updateSettings({ strokeRandomness: checked })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Header/Footer */}
      <div className="control-section">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Header & Footer</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Show Header</Label>
            <Switch
              checked={settings.headerFooter.showHeader}
              onCheckedChange={(checked) => updateHeaderFooter({ showHeader: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-sm">Show Page Numbers</Label>
            <Switch
              checked={settings.headerFooter.showPageNumber}
              onCheckedChange={(checked) => updateHeaderFooter({ showPageNumber: checked })}
            />
          </div>

          {settings.headerFooter.showHeader && (
            <div className="space-y-3 mt-4 animate-fade-in">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Name"
                  value={settings.headerFooter.name}
                  onChange={(e) => updateHeaderFooter({ name: e.target.value })}
                  className="pl-9"
                />
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Roll Number"
                  value={settings.headerFooter.rollNo}
                  onChange={(e) => updateHeaderFooter({ rollNo: e.target.value })}
                  className="pl-9"
                />
              </div>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Subject"
                  value={settings.headerFooter.subject}
                  onChange={(e) => updateHeaderFooter({ subject: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
