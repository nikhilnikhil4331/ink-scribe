 import { useCallback, useMemo } from 'react';
 import { NoteLine, generateLineId, LineInkColor, getDefaultColorForLine } from '@/types/noteLine';
 import { NoteSettings, PAGE_SIZE_OPTIONS } from '@/types/notes';
 import { DEFAULT_RESPONSIVE_MARGINS } from '@/hooks/useResponsiveMargins';
 
 interface AutoPaginationConfig {
   settings: NoteSettings;
   lines: NoteLine[];
   updateLines: (lines: NoteLine[]) => void;
 }
 
 interface AutoPaginationResult {
   linesPerPage: number;
   shouldCreateNewPage: boolean;
   handleSmartPaste: (text: string, atLineId?: string) => void;
   getVisibleLinesCount: () => number;
   checkAndPaginate: () => void;
 }
 
 export function useAutoPagination({
   settings,
   lines,
   updateLines,
 }: AutoPaginationConfig): AutoPaginationResult {
   
   const sizeConfig = PAGE_SIZE_OPTIONS.find(s => s.value === settings.pageSize) || PAGE_SIZE_OPTIONS[0];
   const margins = DEFAULT_RESPONSIVE_MARGINS.desktop;
 
   // Calculate how many lines fit on a page
   const linesPerPage = useMemo(() => {
     const headerHeight = settings.headerFooter.showHeader ? 40 : 0;
     const pageNumberHeight = settings.headerFooter.showPageNumber ? 30 : 0;
     const contentHeight = sizeConfig.height - margins.top - margins.bottom - headerHeight - pageNumberHeight;
     return Math.max(1, Math.floor(contentHeight / settings.lineSpacing));
   }, [sizeConfig.height, margins.top, margins.bottom, settings.lineSpacing, settings.headerFooter.showHeader, settings.headerFooter.showPageNumber]);
 
   // Check if current page is full and should create new page
   const shouldCreateNewPage = useMemo(() => {
     return lines.length >= linesPerPage;
   }, [lines.length, linesPerPage]);
 
   const getVisibleLinesCount = useCallback(() => {
     return lines.length;
   }, [lines.length]);
 
   // Smart paste handler that respects paragraphs and auto-paginates
   const handleSmartPaste = useCallback((text: string, atLineId?: string) => {
     // Split by newlines, preserving empty lines for paragraph spacing
     const pastedLines = text.split(/\r?\n/);
     
     // Find insertion point
     const insertIndex = atLineId 
       ? lines.findIndex(l => l.id === atLineId) 
       : lines.length - 1;
     
     if (insertIndex === -1) return;
 
     // Create new NoteLine objects for each pasted line
     const newLinesData: NoteLine[] = pastedLines.map((lineText, i) => ({
       id: generateLineId(),
       text: lineText.trim(),
       color: getDefaultColorForLine(insertIndex + i) as LineInkColor,
       timestamp: Date.now() + i,
     }));
 
     // Calculate how this affects pagination
     const currentLine = lines[insertIndex];
     const newLines = [...lines];
 
     if (currentLine?.text === '') {
       // Replace empty current line
       newLines.splice(insertIndex, 1, ...newLinesData);
     } else {
       // Insert after current line
       newLines.splice(insertIndex + 1, 0, ...newLinesData);
     }
 
     // Update lines
     updateLines(newLines);
 
     // Note: Auto-pagination to new pages is handled by the NotebookPreview component
     // which splits lines into pages automatically based on linesPerPage
   }, [lines, updateLines, linesPerPage]);
 
   // Check if we need to trigger auto-pagination
   const checkAndPaginate = useCallback(() => {
     if (shouldCreateNewPage && lines.length > linesPerPage) {
       // The preview component handles this automatically by splitting lines into pages
       // This is called to trigger any side effects if needed
     }
   }, [shouldCreateNewPage, lines.length, linesPerPage]);
 
   return {
     linesPerPage,
     shouldCreateNewPage,
     handleSmartPaste,
     getVisibleLinesCount,
     checkAndPaginate,
   };
 }