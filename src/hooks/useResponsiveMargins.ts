import { useMemo } from 'react';
import { useIsMobile } from './use-mobile';
import { PageMargins } from '@/types/notes';

export interface ResponsiveMargins {
  desktop: PageMargins;
  mobile: PageMargins;
}

// Default margins as specified
export const DEFAULT_RESPONSIVE_MARGINS: ResponsiveMargins = {
  desktop: {
    top: 56,
    right: 48,
    bottom: 72,
    left: 48,
  },
  mobile: {
    top: 32,
    right: 20,
    bottom: 64, // Keyboard safe
    left: 20,
  },
};

export function useResponsiveMargins(customMargins?: Partial<ResponsiveMargins>): PageMargins {
  const isMobile = useIsMobile();
  
  return useMemo(() => {
    const margins = isMobile 
      ? { ...DEFAULT_RESPONSIVE_MARGINS.mobile, ...customMargins?.mobile }
      : { ...DEFAULT_RESPONSIVE_MARGINS.desktop, ...customMargins?.desktop };
    
    return margins;
  }, [isMobile, customMargins]);
}

// Get margins for a specific viewport (used in export to match preview)
export function getMarginsForViewport(
  isMobile: boolean, 
  customMargins?: Partial<ResponsiveMargins>
): PageMargins {
  if (isMobile) {
    return { ...DEFAULT_RESPONSIVE_MARGINS.mobile, ...customMargins?.mobile };
  }
  return { ...DEFAULT_RESPONSIVE_MARGINS.desktop, ...customMargins?.desktop };
}

// Calculate effective content area for a page
export function calculateContentArea(
  pageWidth: number,
  pageHeight: number,
  margins: PageMargins
): { width: number; height: number } {
  return {
    width: pageWidth - margins.left - margins.right,
    height: pageHeight - margins.top - margins.bottom,
  };
}

// Calculate lines that fit in content area
export function calculateLinesPerPage(
  pageHeight: number,
  lineSpacing: number,
  margins: PageMargins,
  hasHeader: boolean = false,
  hasPageNumber: boolean = true
): number {
  const headerHeight = hasHeader ? 40 : 0;
  const pageNumberHeight = hasPageNumber ? 30 : 0;
  const contentHeight = pageHeight - margins.top - margins.bottom - headerHeight - pageNumberHeight;
  
  return Math.max(1, Math.floor(contentHeight / lineSpacing));
}
