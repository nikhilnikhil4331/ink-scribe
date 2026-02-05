 import React, { useState, useRef, useCallback } from 'react';
 import { motion } from 'framer-motion';
 import { InlineContent, InlineImage, InlineDiagram } from '@/types/noteLine';
 import { cn } from '@/lib/utils';
import { X, RotateCw } from 'lucide-react';
 
 interface InlineContentRendererProps {
   content: InlineContent;
   onUpdate?: (id: string, updates: Partial<InlineContent>) => void;
   onDelete?: (id: string) => void;
   editable?: boolean;
 }
 
 export const InlineContentRenderer: React.FC<InlineContentRendererProps> = ({
   content,
   onUpdate,
   onDelete,
   editable = true,
 }) => {
   const [isDragging, setIsDragging] = useState(false);
  const [, setIsResizing] = useState(false);
   const [isSelected, setIsSelected] = useState(false);
   const containerRef = useRef<HTMLDivElement>(null);
 
  const handleDragStart = useCallback(() => {
     if (!editable) return;
     setIsDragging(true);
     setIsSelected(true);
   }, [editable]);
 
   const handleDragEnd = useCallback(() => {
     setIsDragging(false);
   }, []);
 
   const handleResize = useCallback((e: React.MouseEvent, corner: string) => {
     if (!editable || !onUpdate) return;
     e.stopPropagation();
     setIsResizing(true);
     
     const startX = e.clientX;
     const startY = e.clientY;
     const startWidth = content.width;
     const startHeight = content.height;
 
     const handleMouseMove = (moveEvent: MouseEvent) => {
       const dx = moveEvent.clientX - startX;
       const dy = moveEvent.clientY - startY;
       
       let newWidth = startWidth;
       let newHeight = startHeight;
 
       if (corner.includes('e')) newWidth = Math.max(50, startWidth + dx);
       if (corner.includes('w')) newWidth = Math.max(50, startWidth - dx);
       if (corner.includes('s')) newHeight = Math.max(50, startHeight + dy);
       if (corner.includes('n')) newHeight = Math.max(50, startHeight - dy);
 
       // Maintain aspect ratio if shift is held
       if (moveEvent.shiftKey) {
         const aspectRatio = startWidth / startHeight;
         if (Math.abs(dx) > Math.abs(dy)) {
           newHeight = newWidth / aspectRatio;
         } else {
           newWidth = newHeight * aspectRatio;
         }
       }
 
       onUpdate(content.id, { width: newWidth, height: newHeight });
     };
 
     const handleMouseUp = () => {
       setIsResizing(false);
       document.removeEventListener('mousemove', handleMouseMove);
       document.removeEventListener('mouseup', handleMouseUp);
     };
 
     document.addEventListener('mousemove', handleMouseMove);
     document.addEventListener('mouseup', handleMouseUp);
   }, [content, editable, onUpdate]);
 
   const handleRotate = useCallback(() => {
     if (!editable || !onUpdate) return;
     onUpdate(content.id, { rotation: (content.rotation + 15) % 360 });
   }, [content, editable, onUpdate]);
 
   if (content.type === 'image') {
     const imageContent = content as InlineImage;
     return (
       <motion.div
         ref={containerRef}
         className={cn(
           "relative inline-block my-2 select-none",
           isSelected && editable && "ring-2 ring-primary ring-offset-2",
           isDragging && "cursor-grabbing opacity-80"
         )}
         style={{
           width: imageContent.width,
           height: imageContent.height,
           transform: `rotate(${imageContent.rotation}deg)`,
         }}
         drag={editable}
         dragMomentum={false}
      onDragStart={() => handleDragStart()}
      onDragEnd={() => handleDragEnd()}
         onClick={() => setIsSelected(!isSelected)}
         whileHover={editable ? { scale: 1.01 } : undefined}
         whileTap={editable ? { scale: 0.99 } : undefined}
       >
         <img
           src={imageContent.src}
           alt={imageContent.alt}
           className="w-full h-full object-contain rounded-lg shadow-md"
           draggable={false}
         />
 
         {/* Controls overlay */}
         {isSelected && editable && (
           <>
             {/* Delete button */}
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 onDelete?.(content.id);
               }}
               className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
             >
               <X className="w-3 h-3" />
             </button>
 
             {/* Rotate button */}
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 handleRotate();
               }}
               className="absolute -top-2 -left-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
             >
               <RotateCw className="w-3 h-3" />
             </button>
 
             {/* Resize handles */}
             {['nw', 'ne', 'sw', 'se'].map((corner) => (
               <div
                 key={corner}
                 onMouseDown={(e) => handleResize(e, corner)}
                 className={cn(
                   "absolute w-3 h-3 bg-primary rounded-sm cursor-nwse-resize shadow-sm",
                   corner === 'nw' && "top-0 left-0 cursor-nwse-resize",
                   corner === 'ne' && "top-0 right-0 cursor-nesw-resize",
                   corner === 'sw' && "bottom-0 left-0 cursor-nesw-resize",
                   corner === 'se' && "bottom-0 right-0 cursor-nwse-resize"
                 )}
               />
             ))}
           </>
         )}
       </motion.div>
     );
   }
 
   if (content.type === 'diagram') {
     const diagramContent = content as InlineDiagram;
     return (
       <motion.div
         ref={containerRef}
         className={cn(
           "relative inline-block my-2 select-none",
           isSelected && editable && "ring-2 ring-primary ring-offset-2",
           isDragging && "cursor-grabbing opacity-80"
         )}
         style={{
           width: diagramContent.width,
           height: diagramContent.height,
           transform: `rotate(${diagramContent.rotation}deg)`,
         }}
         drag={editable}
         dragMomentum={false}
      onDragStart={() => handleDragStart()}
      onDragEnd={() => handleDragEnd()}
         onClick={() => setIsSelected(!isSelected)}
       >
         <svg
           width={diagramContent.width}
           height={diagramContent.height}
           className="overflow-visible"
         >
           {diagramContent.shape === 'rectangle' && (
             <rect
               x={2}
               y={2}
               width={diagramContent.width - 4}
               height={diagramContent.height - 4}
               stroke={diagramContent.strokeColor}
               fill={diagramContent.fillColor || 'transparent'}
               strokeWidth={diagramContent.strokeWidth}
               rx={4}
             />
           )}
           {diagramContent.shape === 'circle' && (
             <ellipse
               cx={diagramContent.width / 2}
               cy={diagramContent.height / 2}
               rx={diagramContent.width / 2 - 2}
               ry={diagramContent.height / 2 - 2}
               stroke={diagramContent.strokeColor}
               fill={diagramContent.fillColor || 'transparent'}
               strokeWidth={diagramContent.strokeWidth}
             />
           )}
           {diagramContent.shape === 'arrow' && (
             <g>
               <line
                 x1={5}
                 y1={diagramContent.height / 2}
                 x2={diagramContent.width - 15}
                 y2={diagramContent.height / 2}
                 stroke={diagramContent.strokeColor}
                 strokeWidth={diagramContent.strokeWidth}
               />
               <polygon
                 points={`${diagramContent.width - 5},${diagramContent.height / 2} ${diagramContent.width - 15},${diagramContent.height / 2 - 8} ${diagramContent.width - 15},${diagramContent.height / 2 + 8}`}
                 fill={diagramContent.strokeColor}
               />
             </g>
           )}
           {diagramContent.shape === 'line' && (
             <line
               x1={5}
               y1={diagramContent.height / 2}
               x2={diagramContent.width - 5}
               y2={diagramContent.height / 2}
               stroke={diagramContent.strokeColor}
               strokeWidth={diagramContent.strokeWidth}
             />
           )}
           {diagramContent.shape === 'freedraw' && diagramContent.points && (
             <polyline
               points={diagramContent.points.map(p => `${p.x},${p.y}`).join(' ')}
               stroke={diagramContent.strokeColor}
               fill="none"
               strokeWidth={diagramContent.strokeWidth}
               strokeLinecap="round"
               strokeLinejoin="round"
             />
           )}
         </svg>
 
         {/* Controls overlay */}
         {isSelected && editable && (
           <>
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 onDelete?.(content.id);
               }}
               className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
             >
               <X className="w-3 h-3" />
             </button>
 
             {['nw', 'ne', 'sw', 'se'].map((corner) => (
               <div
                 key={corner}
                 onMouseDown={(e) => handleResize(e, corner)}
                 className={cn(
                   "absolute w-3 h-3 bg-primary rounded-sm cursor-nwse-resize shadow-sm",
                   corner === 'nw' && "top-0 left-0 cursor-nwse-resize",
                   corner === 'ne' && "top-0 right-0 cursor-nesw-resize",
                   corner === 'sw' && "bottom-0 left-0 cursor-nesw-resize",
                   corner === 'se' && "bottom-0 right-0 cursor-nwse-resize"
                 )}
               />
             ))}
           </>
         )}
       </motion.div>
     );
   }
 
   return null;
 };