import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DiagramImage } from '@/types/notes';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { DrawingTool } from './DrawingTool';

interface DiagramImportProps {
  diagrams: DiagramImage[];
  onAddDiagram: (diagram: DiagramImage) => void;
  onRemoveDiagram: (id: string) => void;
  onUpdateDiagram: (id: string, updates: Partial<DiagramImage>) => void;
  inkColor: string;
}

export const DiagramImport: React.FC<DiagramImportProps> = ({
  diagrams,
  onAddDiagram,
  onRemoveDiagram,
  onUpdateDiagram,
  inkColor,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const diagram: DiagramImage = {
            id: `diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            src: e.target?.result as string,
            name: file.name,
            width: Math.min(img.width, 400),
            height: Math.min(img.height, 300),
            position: 'center',
          };
          onAddDiagram(diagram);
          toast.success(`Added ${file.name}`);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveDrawing = (dataUrl: string) => {
    const diagram: DiagramImage = {
      id: `drawing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      src: dataUrl,
      name: `Drawing ${diagrams.length + 1}`,
      width: 400,
      height: 300,
      position: 'center',
    };
    onAddDiagram(diagram);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* Drawing Tool */}
      <DrawingTool onSaveDrawing={handleSaveDrawing} inkColor={inkColor} />
      
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drop images here or click to upload
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PNG, JPG, GIF supported
        </p>
      </div>

      {/* Diagram list */}
      {diagrams.length > 0 && (
        <div className="space-y-2 mt-3">
          {diagrams.map((diagram) => (
            <div 
              key={diagram.id}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border"
            >
              <img 
                src={diagram.src} 
                alt={diagram.name}
                className="w-10 h-10 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{diagram.name}</p>
                <select
                  value={diagram.position}
                  onChange={(e) => onUpdateDiagram(diagram.id, { position: e.target.value as DiagramImage['position'] })}
                  className="text-xs bg-transparent border-none p-0 text-muted-foreground"
                >
                  <option value="inline">Inline</option>
                  <option value="left">Left align</option>
                  <option value="center">Center</option>
                  <option value="right">Right align</option>
                </select>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onRemoveDiagram(diagram.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
