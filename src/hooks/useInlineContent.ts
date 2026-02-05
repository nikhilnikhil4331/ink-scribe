 import { useState, useCallback } from 'react';
 import { InlineContent, InlineImage, InlineDiagram, generateContentId } from '@/types/noteLine';
 
 interface UseInlineContentReturn {
   content: InlineContent[];
   addImage: (file: File) => Promise<void>;
   addDiagram: (diagram: Omit<InlineDiagram, 'id'>) => void;
   updateContent: (id: string, updates: Partial<InlineContent>) => void;
   removeContent: (id: string) => void;
   clearContent: () => void;
 }
 
 export function useInlineContent(): UseInlineContentReturn {
   const [content, setContent] = useState<InlineContent[]>([]);
 
   const addImage = useCallback(async (file: File) => {
     return new Promise<void>((resolve, reject) => {
       const reader = new FileReader();
       reader.onload = (e) => {
         const img = new Image();
         img.onload = () => {
           const maxWidth = 300;
           const maxHeight = 200;
           let width = img.width;
           let height = img.height;
 
           // Scale down if too large
           if (width > maxWidth) {
             height = (maxWidth / width) * height;
             width = maxWidth;
           }
           if (height > maxHeight) {
             width = (maxHeight / height) * width;
             height = maxHeight;
           }
 
           const newImage: InlineImage = {
             id: generateContentId(),
             type: 'image',
             src: e.target?.result as string,
             alt: file.name,
             width,
             height,
             position: { x: 0, y: 0 },
             rotation: 0,
           };
 
           setContent((prev) => [...prev, newImage]);
           resolve();
         };
         img.onerror = () => reject(new Error('Failed to load image'));
         img.src = e.target?.result as string;
       };
       reader.onerror = () => reject(new Error('Failed to read file'));
       reader.readAsDataURL(file);
     });
   }, []);
 
   const addDiagram = useCallback((diagram: Omit<InlineDiagram, 'id'>) => {
     const newDiagram: InlineDiagram = {
       ...diagram,
       id: generateContentId(),
     };
     setContent((prev) => [...prev, newDiagram]);
   }, []);
 
   const updateContent = useCallback((id: string, updates: Partial<InlineContent>) => {
     setContent((prev) =>
       prev.map((item) =>
         item.id === id ? { ...item, ...updates } as InlineContent : item
       )
     );
   }, []);
 
   const removeContent = useCallback((id: string) => {
     setContent((prev) => prev.filter((item) => item.id !== id));
   }, []);
 
   const clearContent = useCallback(() => {
     setContent([]);
   }, []);
 
   return {
     content,
     addImage,
     addDiagram,
     updateContent,
     removeContent,
     clearContent,
   };
 }