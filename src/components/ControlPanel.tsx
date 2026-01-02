import React from 'react';
import { NoteSettings, FONT_OPTIONS, PAGE_STYLE_OPTIONS, INK_COLOR_OPTIONS } from '@/types/notes';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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
  BookOpen
} from 'lucide-react';

interface ControlPanelProps {
  settings: NoteSettings;
  updateSettings: (updates: Partial<NoteSettings>) => void;
  updateMargins: (updates: Partial<NoteSettings['margins']>) => void;
  updateHeaderFooter: (updates: Partial<NoteSettings['headerFooter']>) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  settings,
  updateSettings,
  updateMargins,
  updateHeaderFooter,
}) => {
  // Group fonts by category
  const fontCategories = FONT_OPTIONS.reduce((acc, font) => {
    if (!acc[font.category]) acc[font.category] = [];
    acc[font.category].push(font);
    return acc;
  }, {} as Record<string, typeof FONT_OPTIONS>);

  return (
    <div className="h-full overflow-y-auto scrollbar-hide">
      {/* Font Selection */}
      <div className="control-section">
        <div className="flex items-center gap-2 mb-3">
          <Type className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Typography</span>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="control-label">Handwriting Style</Label>
            <Select 
              value={settings.font} 
              onValueChange={(value) => updateSettings({ font: value as NoteSettings['font'] })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {Object.entries(fontCategories).map(([category, fonts]) => (
                  <div key={category}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {category}
                    </div>
                    {fonts.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span className={`${font.className} text-base`}>{font.label}</span>
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
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
            <Select 
              value={settings.inkColor} 
              onValueChange={(value) => updateSettings({ inkColor: value as NoteSettings['inkColor'] })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INK_COLOR_OPTIONS.map((ink) => (
                  <SelectItem key={ink.value} value={ink.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${ink.value === 'blue' ? 'bg-ink-blue' : 'bg-ink-black'}`} />
                      {ink.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="control-label">Page Style</Label>
            <Select 
              value={settings.pageStyle} 
              onValueChange={(value) => updateSettings({ pageStyle: value as NoteSettings['pageStyle'] })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_STYLE_OPTIONS.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
