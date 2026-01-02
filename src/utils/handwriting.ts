// Utility functions for handwriting effects

export function generateJitter(enabled: boolean, maxOffset: number = 2): number {
  if (!enabled) return 0;
  return (Math.random() - 0.5) * maxOffset;
}

export function generateWordSpacingVariance(baseSpacing: number, enabled: boolean): number {
  if (!enabled) return baseSpacing;
  const variance = (Math.random() - 0.5) * 4;
  return Math.max(1, baseSpacing + variance);
}

export function generateRotation(enabled: boolean, maxDeg: number = 1): number {
  if (!enabled) return 0;
  return (Math.random() - 0.5) * maxDeg;
}

export function getRandomOpacity(enabled: boolean, base: number = 1): number {
  if (!enabled) return base;
  return base - Math.random() * 0.08;
}

// Split text into pages based on available height
export function splitTextIntoPages(
  text: string,
  linesPerPage: number
): string[] {
  const lines = text.split('\n');
  const pages: string[] = [];
  
  for (let i = 0; i < lines.length; i += linesPerPage) {
    const pageLines = lines.slice(i, i + linesPerPage);
    pages.push(pageLines.join('\n'));
  }
  
  if (pages.length === 0) {
    pages.push('');
  }
  
  return pages;
}

// Calculate how many lines fit on a page
export function calculateLinesPerPage(
  pageHeight: number,
  lineSpacing: number,
  marginTop: number,
  marginBottom: number,
  hasHeader: boolean,
  hasFooter: boolean
): number {
  const headerHeight = hasHeader ? 60 : 0;
  const footerHeight = hasFooter ? 40 : 0;
  const availableHeight = pageHeight - marginTop - marginBottom - headerHeight - footerHeight;
  return Math.floor(availableHeight / lineSpacing);
}
