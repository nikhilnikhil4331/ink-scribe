import { useState, useCallback } from 'react';
import { NoteLine, LineInkColor, generateLineId } from '@/types/noteLine';

export interface NotebookPage {
  id: string;
  lines: NoteLine[];
  createdAt: number;
}

interface UseNotebookPagesReturn {
  pages: NotebookPage[];
  currentPageIndex: number;
  currentPage: NotebookPage;
  totalPages: number;
  goToPage: (index: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  addNewPage: () => void;
  deletePage: (index: number) => void;
  updateCurrentPageLines: (lines: NoteLine[]) => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

const createEmptyPage = (): NotebookPage => ({
  id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  lines: [{ id: generateLineId(), text: '', color: 'black' as LineInkColor, timestamp: Date.now() }],
  createdAt: Date.now(),
});

export function useNotebookPages(): UseNotebookPagesReturn {
  const [pages, setPages] = useState<NotebookPage[]>(() => [createEmptyPage()]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const currentPage = pages[currentPageIndex] || pages[0];
  const totalPages = pages.length;
  const canGoNext = currentPageIndex < totalPages - 1;
  const canGoPrev = currentPageIndex > 0;

  const goToPage = useCallback((index: number) => {
    if (index >= 0 && index < pages.length) {
      setCurrentPageIndex(index);
    }
  }, [pages.length]);

  const nextPage = useCallback(() => {
    if (canGoNext) {
      setCurrentPageIndex(prev => prev + 1);
    }
  }, [canGoNext]);

  const prevPage = useCallback(() => {
    if (canGoPrev) {
      setCurrentPageIndex(prev => prev - 1);
    }
  }, [canGoPrev]);

  const addNewPage = useCallback(() => {
    const newPage = createEmptyPage();
    setPages(prev => {
      const newPages = [...prev];
      newPages.splice(currentPageIndex + 1, 0, newPage);
      return newPages;
    });
    setCurrentPageIndex(prev => prev + 1);
  }, [currentPageIndex]);

  const deletePage = useCallback((index: number) => {
    if (pages.length <= 1) return; // Don't delete the last page
    
    setPages(prev => prev.filter((_, i) => i !== index));
    setCurrentPageIndex(prev => {
      if (prev >= index && prev > 0) {
        return prev - 1;
      }
      return prev;
    });
  }, [pages.length]);

  const updateCurrentPageLines = useCallback((lines: NoteLine[]) => {
    setPages(prev => prev.map((page, i) => 
      i === currentPageIndex 
        ? { ...page, lines } 
        : page
    ));
  }, [currentPageIndex]);

  return {
    pages,
    currentPageIndex,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    addNewPage,
    deletePage,
    updateCurrentPageLines,
    canGoNext,
    canGoPrev,
  };
}
