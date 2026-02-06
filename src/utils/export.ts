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

// Validate that element has visible content
const validateElement = (element: HTMLElement): { valid: boolean; error?: string } => {
  if (!element) {
    return { valid: false, error: 'Element not found' };
  }
  
  const rect = element.getBoundingClientRect();
  if (rect.width < 10 || rect.height < 10) {
    return { valid: false, error: 'Element has no visible size' };
  }
  
  // Check if element is attached to DOM
  if (!document.body.contains(element)) {
    return { valid: false, error: 'Element is not in the document' };
  }
  
  return { valid: true };
};

// Wait for all fonts and images to load
const waitForResources = async (): Promise<void> => {
  await document.fonts.ready;
  
  // Wait a bit for any lazy-loaded images
  await new Promise(resolve => setTimeout(resolve, 100));
};

// Capture element to canvas with high quality settings for PDF export
const captureToCanvas = async (
  element: HTMLElement,
  retries = 2
): Promise<HTMLCanvasElement> => {
  const validation = validateElement(element);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid element');
  }

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Wait for resources
      await waitForResources();
      
      // Get element dimensions
      const rect = element.getBoundingClientRect();
      const width = element.offsetWidth || rect.width;
      const height = element.offsetHeight || rect.height;
      
      if (width < 10 || height < 10) {
        throw new Error('Element has no visible content');
      }
      
      // Capture at 2x scale for crisp PDF output
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution for crisp text in PDF
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        allowTaint: false,
        foreignObjectRendering: false,
        imageTimeout: 15000,
        removeContainer: true,
        // Capture the exact element
        width: width,
        height: height,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        windowWidth: width,
        windowHeight: height,
      });
      
      // Validate canvas has content
      if (!canvas || canvas.width < 10 || canvas.height < 10) {
        throw new Error('Captured canvas has no content');
      }
      
      return canvas;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`Capture attempt ${attempt + 1} failed:`, lastError.message);
      
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1)));
      }
    }
  }
  
  throw lastError || new Error('Failed to capture element');
};

// Convert canvas to blob
const canvasToBlob = async (
  canvas: HTMLCanvasElement,
  type: string = 'image/png',
  quality: number = 0.95
): Promise<Blob> => {
  if (!canvas || canvas.width < 1 || canvas.height < 1) {
    throw new Error('Cannot export empty canvas');
  }
  
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
  
  if (blob && blob.size > 0) {
    return blob;
  }
  
  // Fallback to dataURL
  const dataUrl = canvas.toDataURL(type, quality);
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/data:(.*?);/);
  const mime = mimeMatch?.[1] || 'application/octet-stream';
  const binary = atob(parts[1]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  
  return new Blob([bytes], { type: mime });
};

// Validate blob is not empty
const validateBlob = (blob: Blob): boolean => {
  return blob && blob.size > 100;
};

// Download blob as file
const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

/**
 * MAIN PDF EXPORT FUNCTION
 * Creates a true multi-page PDF with proper A4 dimensions
 * Uses the same NotebookPreview component for pixel-perfect matching
 */
export async function exportToPDF(
  elements: HTMLElement[],
  filename: string = 'handwritten-notes',
  _pageSize?: string, // Kept for backward compatibility
  onProgress?: ProgressCallback
): Promise<void> {
  if (!elements || elements.length === 0) {
    throw new Error('No pages to export');
  }
  
  // Filter valid elements
  const validElements = elements.filter(el => validateElement(el).valid);
  
  if (validElements.length === 0) {
    throw new Error('No valid pages found to export');
  }
  
  // Wait for fonts to be ready before export
  await waitForResources();
  
  // Create PDF with A4 dimensions
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });
  
  const total = validElements.length;
  
  for (let i = 0; i < validElements.length; i++) {
    // Update progress
    onProgress?.({
      current: i + 1,
      total,
      percentage: Math.round(((i + 1) / total) * 100),
    });
    
    try {
      // Capture the page element to canvas
      const canvas = await captureToCanvas(validElements[i]);
      
      // Convert canvas to image data URL
      const imgData = canvas.toDataURL('image/png', 1.0);

      // Add new page for subsequent pages
      if (i > 0) {
        pdf.addPage();
      }

      // CRITICAL: NotebookPreview export pages are rendered at true A4 aspect ratio.
      // Always fill the full A4 page to prevent tiny-corner / mis-centering.
      pdf.addImage(imgData, 'PNG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);

      
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Failed to capture page ${i + 1}:`, message);
      throw new Error(`Failed to export page ${i + 1}: ${message}`);
    }
  }
  
  // Save the PDF
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
  const canvas = await captureToCanvas(element);
  
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const quality = format === 'jpeg' ? 0.92 : undefined;
  
  const blob = await canvasToBlob(canvas, mimeType, quality);
  
  if (!validateBlob(blob)) {
    throw new Error('Generated file is empty or corrupted');
  }
  
  downloadBlob(blob, `${filename}.${format}`);
}

/**
 * Export multiple pages as individual image files
 * Downloads each page as a separate file
 */
export async function exportAllPagesToImages(
  elements: HTMLElement[],
  format: 'png' | 'jpeg' = 'png',
  baseFilename: string = 'handwritten-note',
  onProgress?: ProgressCallback
): Promise<void> {
  if (!elements || elements.length === 0) {
    throw new Error('No pages to export');
  }
  
  const validElements = elements.filter(el => validateElement(el).valid);
  
  if (validElements.length === 0) {
    throw new Error('No valid pages found to export');
  }
  
  const total = validElements.length;
  const errors: string[] = [];
  
  for (let i = 0; i < validElements.length; i++) {
    onProgress?.({
      current: i + 1,
      total,
      percentage: Math.round(((i + 1) / total) * 100)
    });
    
    try {
      const filename = total === 1 ? baseFilename : `${baseFilename}-page-${i + 1}`;
      await exportToImage(validElements[i], format, filename);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Page ${i + 1}: ${msg}`);
      console.error(`Failed to export page ${i + 1}:`, err);
    }
  }
  
  if (errors.length === validElements.length) {
    throw new Error(`Failed to export all pages: ${errors.join('; ')}`);
  }
  
  if (errors.length > 0) {
    console.warn(`Some pages failed to export: ${errors.join('; ')}`);
  }
}

/**
 * Main export function - PDF for any number of pages
 * This is the recommended export method
 */
export async function exportPages(
  elements: HTMLElement[],
  filename: string = 'handwritten-notes',
  onProgress?: ProgressCallback
): Promise<void> {
  return exportToPDF(elements, filename, undefined, onProgress);
}
