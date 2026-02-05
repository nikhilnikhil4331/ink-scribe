 import { useCallback, useMemo } from 'react';
 import { NoteLine, generateLineId, LineInkColor, getDefaultColorForLine } from '@/types/noteLine';
 import { NoteSettings, PAGE_SIZE_OPTIONS } from '@/types/notes';
 import { DEFAULT_RESPONSIVE_MARGINS } from '@/hooks/useResponsiveMargins';
 
 interface AutoPaginationConfig {
   settings: NoteSettings;
   lines: NoteLine[];
   updateLines: (lines: NoteLine[]) => void;
   addNewPage?: () => void;
   totalPages?: number;
   currentPageIndex?: number;
   goToPage?: (index: number) => void;
 }
 
 export interface SmartPasteResult {
   newLines: NoteLine[];
   pagesNeeded: number;
   overflowLines: NoteLine[];
 }
 
 interface AutoPaginationResult {
   linesPerPage: number;
   shouldCreateNewPage: boolean;
   handleSmartPaste: (text: string, atLineId?: string) => SmartPasteResult;
   getVisibleLinesCount: () => number;
   checkAndPaginate: () => void;
   splitTextToLines: (text: string) => NoteLine[];
 }
 
 export function useAutoPagination({
   settings,
   lines,
   updateLines,
   addNewPage,
   totalPages = 1,
   currentPageIndex = 0,
   goToPage,
 }: AutoPaginationConfig): AutoPaginationResult {
   
   const sizeConfig = PAGE_SIZE_OPTIONS.find(s => s.value === settings.pageSize) || PAGE_SIZE_OPTIONS[0];
   
   // Use responsive margins based on screen width
   const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
   const margins = isMobile ? DEFAULT_RESPONSIVE_MARGINS.mobile : DEFAULT_RESPONSIVE_MARGINS.desktop;
 
   // Calculate how many lines fit on a page
   const linesPerPage = useMemo(() => {
     const headerHeight = settings.headerFooter.showHeader ? 40 : 0;
     const pageNumberHeight = settings.headerFooter.showPageNumber ? 30 : 0;
     const contentHeight = sizeConfig.height - margins.top - margins.bottom - headerHeight - pageNumberHeight;
     // Line height is 48px on mobile for proper spacing
     const lineHeight = isMobile ? 48 : settings.lineSpacing;
     return Math.max(1, Math.floor(contentHeight / lineHeight));
   }, [sizeConfig.height, margins.top, margins.bottom, settings.lineSpacing, settings.headerFooter.showHeader, settings.headerFooter.showPageNumber, isMobile]);
 
   // Check if current page is full and should create new page
   const shouldCreateNewPage = useMemo(() => {
     return lines.length >= linesPerPage;
   }, [lines.length, linesPerPage]);
 
   const getVisibleLinesCount = useCallback(() => {
     return lines.length;
   }, [lines.length]);
 
   // CRITICAL: Split text into NoteLine objects - respects all newlines
   const splitTextToLines = useCallback((text: string): NoteLine[] => {
     // Split by any newline character (CR, LF, or CRLF)
     const splitLines = text.split(/\r?\n|\r/);
     
     return splitLines.map((lineText, i) => ({
       id: generateLineId(),
       text: lineText, // Keep original text (don't trim - preserves indentation)
       color: getDefaultColorForLine(i) as LineInkColor,
       timestamp: Date.now() + i,
     }));
   }, []);
 
   // Smart paste handler that respects paragraphs and auto-paginates
   const handleSmartPaste = useCallback((text: string, atLineId?: string): SmartPasteResult => {
     // CRITICAL: Split by ALL newline variants (Windows CRLF, Unix LF, old Mac CR)
     const splitLines = text.split(/\r?\n|\r/);
     
     // Find insertion point
     const insertIndex = atLineId 
       ? lines.findIndex(l => l.id === atLineId) 
       : lines.length - 1;
     
     if (insertIndex === -1) {
       return { newLines: [], pagesNeeded: 0, overflowLines: [] };
     }
 
     // Create new NoteLine objects for each pasted line
     // CRITICAL: Preserve empty lines for paragraph breaks (don't filter them out)
     const newLinesData: NoteLine[] = splitLines.map((lineText, i) => ({
       id: generateLineId(),
       text: lineText, // Keep original text - empty lines become empty NoteLines
       color: getDefaultColorForLine(insertIndex + i) as LineInkColor,
       timestamp: Date.now() + i,
     }));
 
     // Calculate how this affects pagination
     const currentLine = lines[insertIndex];
     const resultLines = [...lines];
 
     if (currentLine?.text === '') {
       // Replace empty current line with first pasted line, then insert rest after
       resultLines.splice(insertIndex, 1, ...newLinesData);
     } else {
       // Insert all new lines after current line
       resultLines.splice(insertIndex + 1, 0, ...newLinesData);
     }
 
     // Calculate pages needed for all content
     const totalLinesAfterPaste = resultLines.length;
     const pagesNeeded = Math.ceil(totalLinesAfterPaste / linesPerPage);
     
     // Determine overflow lines (lines that don't fit on current page)
     const overflowLines = resultLines.slice(linesPerPage);
 
     // Update lines
     updateLines(resultLines);
 
     // CRITICAL: Auto-create new pages if needed
     if (pagesNeeded > totalPages && addNewPage) {
       const pagesToCreate = pagesNeeded - totalPages;
       for (let i = 0; i < pagesToCreate; i++) {
         addNewPage();
       }
     }
 
     return { 
       newLines: newLinesData, 
       pagesNeeded, 
       overflowLines 
     };
   }, [lines, updateLines, linesPerPage, totalPages, addNewPage]);
 
   // Check if we need to trigger auto-pagination
   const checkAndPaginate = useCallback(() => {
     if (shouldCreateNewPage && lines.length > linesPerPage && addNewPage) {
       addNewPage();
       if (goToPage) {
         goToPage(currentPageIndex + 1);
       }
     }
   }, [shouldCreateNewPage, lines.length, linesPerPage, addNewPage, goToPage, currentPageIndex]);
 
   return {
     linesPerPage,
     shouldCreateNewPage,
     handleSmartPaste,
     getVisibleLinesCount,
     checkAndPaginate,
     splitTextToLines,
   };
 }