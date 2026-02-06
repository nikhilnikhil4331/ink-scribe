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
  /** Insert a page after the given index WITHOUT navigating */
  insertPageAfter: (index: number, page?: NotebookPage) => void;
  deletePage: (index: number) => void;
  updateCurrentPageLines: (lines: NoteLine[]) => void;
  /** Update any page's lines (used by pagination engine) */
  updatePageLines: (index: number, lines: NoteLine[]) => void;
  /** Move overflow lines (beyond linesPerPage) into subsequent pages */
  flowOverflowFrom: (startPageIndex: number, linesPerPage: number) => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

const createEmptyPage = (): NotebookPage => ({
  id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  lines: [{ id: generateLineId(), text: '', color: 'black' as LineInkColor, timestamp: Date.now() }],
  createdAt: Date.now(),
});

const ensureAtLeastOneLine = (lines: NoteLine[]): NoteLine[] => {
  if (lines.length > 0) return lines;
  return [{ id: generateLineId(), text: '', color: 'black' as LineInkColor, timestamp: Date.now() }];
};

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

  const insertPageAfter = useCallback((index: number, page?: NotebookPage) => {
    setPages(prev => {
      const newPages = [...prev];
      const newPage = page ?? createEmptyPage();
      newPages.splice(index + 1, 0, newPage);
      return newPages;
    });
  }, []);

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

  const updatePageLines = useCallback((index: number, lines: NoteLine[]) => {
    setPages(prev => prev.map((page, i) => (
      i === index ? { ...page, lines: ensureAtLeastOneLine(lines) } : page
    )));
  }, []);

  const updateCurrentPageLines = useCallback((lines: NoteLine[]) => {
    setPages(prev => prev.map((page, i) => (
      i === currentPageIndex ? { ...page, lines: ensureAtLeastOneLine(lines) } : page
    )));
  }, [currentPageIndex]);

  // CRITICAL: Move overflow into subsequent pages. This is the single source of truth
  // for "auto page" on paste *and* typing.
  const flowOverflowFrom = useCallback((startPageIndex: number, linesPerPage: number) => {
    if (!Number.isFinite(linesPerPage) || linesPerPage <= 0) return;

    setPages(prev => {
      let newPages = [...prev];
      let i = Math.max(0, Math.min(startPageIndex, newPages.length - 1));

      // Safety guard to avoid infinite loops if something goes wrong.
      for (let guard = 0; guard < 500; guard++) {
        if (i >= newPages.length) break;

        const page = newPages[i];
        const pageLines = ensureAtLeastOneLine(page.lines ?? []);

        if (pageLines.length <= linesPerPage) break;

        const keep = ensureAtLeastOneLine(pageLines.slice(0, linesPerPage));
        const overflow = pageLines.slice(linesPerPage);

        newPages[i] = { ...page, lines: keep };

        if (overflow.length > 0) {
          // Ensure next page exists.
          if (i + 1 >= newPages.length) {
            newPages.splice(i + 1, 0, createEmptyPage());
          }

          const next = newPages[i + 1];
          const nextLinesRaw = ensureAtLeastOneLine(next.lines ?? []);

          // If next page is just the empty placeholder line, replace it.
          const nextLines = (nextLinesRaw.length === 1 && nextLinesRaw[0]?.text === '')
            ? []
            : nextLinesRaw;

          newPages[i + 1] = {
            ...next,
            lines: ensureAtLeastOneLine([...overflow, ...nextLines]),
          };

          i = i + 1;
          continue;
        }

        break;
      }

      return newPages;
    });
  }, []);

  return {
    pages,
    currentPageIndex,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    addNewPage,
    insertPageAfter,
    deletePage,
    updateCurrentPageLines,
    updatePageLines,
    flowOverflowFrom,
    canGoNext,
    canGoPrev,
  };
}
