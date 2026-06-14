import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export type ExportProgress = {
  current: number;
  total: number;
  percentage: number;
};

export type ProgressCallback = (progress: ExportProgress) => void;

// A4 dimensions in mm
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

// A4 dimensions in pixels at 96 DPI (standard screen)
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

// Wait for all fonts and images to load
const waitForResources = async (): Promise<void> => {
  await document.fonts.ready;
  await new Promise(resolve => setTimeout(resolve, 300)); // Extra wait for lazy fonts
};

/**
 * FIX #1: Better element finding — search the actual preview DOM
 * The original code was looking for [data-export-page] which only exists
 * when exportMount is true (offscreen). This function finds the
 * VISIBLE preview pages that the user can actually see.
 */
const findVisiblePageElements = (): HTMLElement[] => {
  // Method 1: Look for data-export-page in the visible preview
  const visibleExportPages = document.querySelectorAll('[data-export-page="true"]');
  const visibleFiltered = Array.from(visibleExportPages).filter(el => {
    const htmlEl = el as HTMLElement;
    // Must be in the visible viewport (not offscreen export container)
    const rect = htmlEl.getBoundingClientRect();
    return rect.width > 50 && rect.height > 50 && rect.left > -5000;
  });
  
  if (visibleFiltered.length > 0) {
    return visibleFiltered as unknown as HTMLElement[];
  }

  // Method 2: Look for the preview container's paper pages
  const previewContainer = document.querySelector('[data-preview-container]') 
    || document.querySelector('.paper-shadow')
    || document.querySelector('[class*="paper"]');
  
  if (previewContainer) {
    return [previewContainer as HTMLElement];
  }

  return [];
};

// Capture element to canvas with high quality
const captureToCanvas = async (
  element: HTMLElement,
  retries = 2
): Promise<HTMLCanvasElement> => {
  if (!element) {
    throw new Error('Element not found');
  }

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await waitForResources();
      
      // Force element to be visible for capture
      const rect = element.getBoundingClientRect();
      const width = element.offsetWidth || rect.width || A4_WIDTH_PX;
      const height = element.offsetHeight || rect.height || A4_HEIGHT_PX;
      
      if (width < 10 || height < 10) {
        throw new Error(`Element too small: ${width}x${height}`);
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        allowTaint: true, // FIX #2: Allow tainted images for cross-origin
        foreignObjectRendering: false,
        imageTimeout: 15000,
        removeContainer: true,
        width: width,
        height: height,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        windowWidth: width,
        windowHeight: height,
        // FIX #3: Ignore invisible elements
        ignoreElements: (el) => {
          const style = window.getComputedStyle(el);
          return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';
        },
      });
      
      if (!canvas || canvas.width < 10 || canvas.height < 10) {
        throw new Error('Captured canvas is empty');
      }
      
      return canvas;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`Capture attempt ${attempt + 1} failed:`, lastError.message);
      
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 300 * (attempt + 1)));
      }
    }
  }
  
  throw lastError || new Error('Failed to capture element');
};

/**
 * FIX #4: COMPLETELY REWRITTEN PDF EXPORT
 * The old version had issues:
 * 1. It couldn't find elements because they were offscreen
 * 2. html2canvas captured scaled/transformed elements incorrectly
 * 3. No proper fallback when elements aren't found
 */
export async function exportToPDF(
  elements: HTMLElement[],
  filename: string = 'handwritten-notes',
  _pageSize?: string,
  onProgress?: ProgressCallback
): Promise<void> {
  // Filter to only valid elements with actual content
  let validElements = elements.filter(el => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 10 && rect.height > 10;
  });

  // FIX: If no valid elements provided, try to find them ourselves
  if (validElements.length === 0) {
    console.warn('No valid elements provided, searching DOM...');
    validElements = findVisiblePageElements();
  }

  if (validElements.length === 0) {
    throw new Error('No pages found to export. Please make sure the preview is visible and has content.');
  }
  
  await waitForResources();
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });
  
  const total = validElements.length;
  
  for (let i = 0; i < validElements.length; i++) {
    onProgress?.({
      current: i + 1,
      total,
      percentage: Math.round(((i + 1) / total) * 100),
    });
    
    try {
      const canvas = await captureToCanvas(validElements[i]);
      const imgData = canvas.toDataURL('image/png', 1.0);

      if (i > 0) {
        pdf.addPage();
      }

      // FIX #5: Always fill the full A4 page
      pdf.addImage(imgData, 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Failed to capture page ${i + 1}:`, message);
      throw new Error(`Failed to export page ${i + 1}: ${message}`);
    }
  }
  
  // FIX #6: Use save with proper filename
  pdf.save(`${filename}.pdf`);
}

/**
 * Export single page as image (PNG or JPEG)
 */
export async function exportToImage(
  element: HTMLElement,
  format: 'png' | 'jpeg' = 'png',
  filename: string = 'handwritten-note'
): Promise<void> {
  if (!element) {
    // Try to find visible element
    const found = findVisiblePageElements();
    if (found.length > 0) element = found[0];
    else throw new Error('No content to export');
  }

  const canvas = await captureToCanvas(element);
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const quality = format === 'jpeg' ? 0.92 : undefined;
  
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), mimeType, quality);
  });
  
  if (!blob || blob.size < 100) {
    throw new Error('Generated file is empty or corrupted');
  }
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${format}`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Export multiple pages as individual image files
 */
export async function exportAllPagesToImages(
  elements: HTMLElement[],
  format: 'png' | 'jpeg' = 'png',
  baseFilename: string = 'handwritten-note',
  onProgress?: ProgressCallback
): Promise<void> {
  let validElements = elements.filter(el => el && el.getBoundingClientRect().width > 10);
  
  if (validElements.length === 0) {
    validElements = findVisiblePageElements();
  }
  
  if (validElements.length === 0) {
    throw new Error('No pages found to export');
  }
  
  const total = validElements.length;
  
  for (let i = 0; i < validElements.length; i++) {
    onProgress?.({
      current: i + 1,
      total,
      percentage: Math.round(((i + 1) / total) * 100)
    });
    
    try {
      const filename = total === 1 ? baseFilename : `${baseFilename}-page-${i + 1}`;
      await exportToImage(validElements[i], format, filename);
      // Small delay between downloads so browser doesn't block
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`Failed to export page ${i + 1}:`, err);
    }
  }
}

/**
 * Main export function - PDF for any number of pages
 */
export async function exportPages(
  elements: HTMLElement[],
  filename: string = 'handwritten-notes',
  onProgress?: ProgressCallback
): Promise<void> {
  return exportToPDF(elements, filename, undefined, onProgress);
}
