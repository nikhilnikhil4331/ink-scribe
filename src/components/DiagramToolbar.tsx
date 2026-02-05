 import React, { useState } from 'react';
 import { Button } from '@/components/ui/button';
 import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
 import { Slider } from '@/components/ui/slider';
 import { InlineDiagram, generateContentId } from '@/types/noteLine';
 import { cn } from '@/lib/utils';
 import { 
   Square, 
   Circle, 
   ArrowRight, 
   Minus, 
   Pencil, 
   PlusCircle,
   ImageIcon
 } from 'lucide-react';
 
 interface DiagramToolbarProps {
   onAddDiagram: (diagram: InlineDiagram) => void;
   onAddImage: () => void;
   className?: string;
 }
 
 const SHAPE_OPTIONS = [
   { value: 'rectangle', icon: Square, label: 'Rectangle' },
   { value: 'circle', icon: Circle, label: 'Circle' },
   { value: 'arrow', icon: ArrowRight, label: 'Arrow' },
   { value: 'line', icon: Minus, label: 'Line' },
   { value: 'freedraw', icon: Pencil, label: 'Free Draw' },
 ] as const;
 
 const COLOR_OPTIONS = [
   { value: '#1a1a2e', label: 'Black' },
   { value: '#1565c0', label: 'Blue' },
   { value: '#d32f2f', label: 'Red' },
   { value: '#2e7d32', label: 'Green' },
   { value: '#7b1fa2', label: 'Purple' },
   { value: '#ef6c00', label: 'Orange' },
 ];
 
 export const DiagramToolbar: React.FC<DiagramToolbarProps> = ({
   onAddDiagram,
   onAddImage,
   className,
 }) => {
   const [isOpen, setIsOpen] = useState(false);
   const [selectedShape, setSelectedShape] = useState<InlineDiagram['shape']>('rectangle');
   const [strokeColor, setStrokeColor] = useState('#1565c0');
   const [strokeWidth, setStrokeWidth] = useState(2);
 
   const handleAddShape = () => {
     const diagram: InlineDiagram = {
       id: generateContentId(),
       type: 'diagram',
       shape: selectedShape,
       width: selectedShape === 'arrow' || selectedShape === 'line' ? 150 : 100,
       height: selectedShape === 'arrow' || selectedShape === 'line' ? 40 : 100,
       position: { x: 0, y: 0 },
       rotation: 0,
       strokeColor,
       strokeWidth,
     };
     onAddDiagram(diagram);
     setIsOpen(false);
   };
 
   return (
     <Popover open={isOpen} onOpenChange={setIsOpen}>
       <PopoverTrigger asChild>
         <Button 
           variant="outline" 
           size="sm"
           className={cn("gap-2 rounded-full", className)}
         >
           <PlusCircle className="w-4 h-4" />
           <span className="hidden sm:inline">Add Content</span>
         </Button>
       </PopoverTrigger>
       <PopoverContent className="w-72 p-4" align="start">
         <div className="space-y-4">
           <h4 className="font-medium text-sm">Add Content</h4>
           
           {/* Image upload button */}
           <Button 
             variant="outline" 
             className="w-full justify-start gap-2"
             onClick={() => {
               onAddImage();
               setIsOpen(false);
             }}
           >
             <ImageIcon className="w-4 h-4" />
             Upload Image
           </Button>
 
           <div className="border-t pt-4">
             <h5 className="text-xs font-medium text-muted-foreground mb-3">Quick Shapes</h5>
             
             {/* Shape selection */}
             <div className="flex gap-1 mb-4">
               {SHAPE_OPTIONS.map(({ value, icon: Icon, label }) => (
                 <Button
                   key={value}
                   variant={selectedShape === value ? "default" : "outline"}
                   size="icon"
                   className="h-9 w-9"
                   onClick={() => setSelectedShape(value)}
                   title={label}
                 >
                   <Icon className="w-4 h-4" />
                 </Button>
               ))}
             </div>
 
             {/* Color selection */}
             <div className="flex gap-1 mb-4">
               {COLOR_OPTIONS.map(({ value, label }) => (
                 <button
                   key={value}
                   className={cn(
                     "w-6 h-6 rounded-full transition-transform",
                     strokeColor === value && "ring-2 ring-offset-2 ring-primary scale-110"
                   )}
                   style={{ backgroundColor: value }}
                   onClick={() => setStrokeColor(value)}
                   title={label}
                 />
               ))}
             </div>
 
             {/* Stroke width */}
             <div className="space-y-2">
               <label className="text-xs text-muted-foreground">Stroke Width: {strokeWidth}px</label>
               <Slider
                 value={[strokeWidth]}
                 onValueChange={([val]) => setStrokeWidth(val)}
                 min={1}
                 max={8}
                 step={1}
                 className="w-full"
               />
             </div>
 
             <Button 
               className="w-full mt-4" 
               onClick={handleAddShape}
             >
               Add {SHAPE_OPTIONS.find(s => s.value === selectedShape)?.label}
             </Button>
           </div>
         </div>
       </PopoverContent>
     </Popover>
   );
 };