import html2canvas from 'html2canvas';
import JSZip from 'jszip';

export type ExportProgress = {
  current: number;
  total: number;
  percentage: number;
};

export type ProgressCallback = (progress: ExportProgress) => void;

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

// Capture element to canvas with retries
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
      // Wait for any pending renders
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Ensure fonts are loaded before capture
      await document.fonts.ready;
      
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution for crisp text
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        allowTaint: false,
        foreignObjectRendering: false,
        imageTimeout: 15000,
        removeContainer: true,
        // Force exact element dimensions - no modification
        width: element.offsetWidth,
        height: element.offsetHeight,
        // Ensure we capture the exact element bounds
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.offsetWidth,
        windowHeight: element.offsetHeight,
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
        // Wait longer before retry
        await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1)));
      }
    }
  }
  
  throw lastError || new Error('Failed to capture element');
};

// Convert canvas to blob with multiple fallback strategies
const canvasToBlob = async (
  canvas: HTMLCanvasElement,
  type: string = 'image/png',
  quality: number = 0.95
): Promise<Blob> => {
  // Validate canvas
  if (!canvas || canvas.width < 1 || canvas.height < 1) {
    throw new Error('Cannot export empty canvas');
  }
  
  // Strategy 1: Use toBlob (preferred)
  const blobFromNative = await new Promise<Blob | null>((resolve) => {
    try {
      canvas.toBlob(
        (blob) => resolve(blob),
        type,
        quality
      );
    } catch {
      resolve(null);
    }
  });
  
  if (blobFromNative && blobFromNative.size > 0) {
    return blobFromNative;
  }
  
  // Strategy 2: Use toDataURL and convert
  try {
    const dataUrl = canvas.toDataURL(type, quality);
    if (dataUrl && dataUrl.length > 100) {
      const blob = dataUrlToBlob(dataUrl);
      if (blob.size > 0) {
        return blob;
      }
    }
  } catch (e) {
    console.warn('toDataURL failed:', e);
  }
  
  // Strategy 3: Downscale and retry (mobile memory issues)
  if (canvas.width > 2048 || canvas.height > 2048) {
    try {
      const scaled = downscaleCanvas(canvas, 2048);
      const scaledBlob = await new Promise<Blob | null>((resolve) => {
        scaled.toBlob(blob => resolve(blob), type, quality);
      });
      if (scaledBlob && scaledBlob.size > 0) {
        return scaledBlob;
      }
    } catch (e) {
      console.warn('Downscale strategy failed:', e);
    }
  }
  
  throw new Error('Failed to create exportable image');
};

// Convert data URL to blob
const dataUrlToBlob = (dataUrl: string): Blob => {
  const parts = dataUrl.split(',');
  if (parts.length !== 2) {
    throw new Error('Invalid data URL');
  }
  
  const mimeMatch = parts[0].match(/data:(.*?);/);
  const mime = mimeMatch?.[1] || 'application/octet-stream';
  
  const binary = atob(parts[1]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  
  return new Blob([bytes], { type: mime });
};

// Downscale canvas for memory-constrained devices
const downscaleCanvas = (canvas: HTMLCanvasElement, maxDim: number): HTMLCanvasElement => {
  const { width, height } = canvas;
  const largest = Math.max(width, height);
  
  if (largest <= maxDim) return canvas;
  
  const ratio = maxDim / largest;
  const newCanvas = document.createElement('canvas');
  newCanvas.width = Math.max(1, Math.round(width * ratio));
  newCanvas.height = Math.max(1, Math.round(height * ratio));
  
  const ctx = newCanvas.getContext('2d');
  if (!ctx) return canvas;
  
  ctx.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);
  return newCanvas;
};

// Validate blob is not empty
const validateBlob = (blob: Blob): boolean => {
  return blob && blob.size > 100; // Minimum valid file size
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
  
  // Cleanup after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

// Export single page as image
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

// Export multiple pages as ZIP
export async function exportPagesAsZip(
  elements: HTMLElement[],
  filename: string = 'handwritten-notes',
  onProgress?: ProgressCallback
): Promise<void> {
  if (elements.length === 0) {
    throw new Error('No pages to export');
  }
  
  const zip = new JSZip();
  const total = elements.length;
  const errors: string[] = [];

  for (let i = 0; i < elements.length; i++) {
    onProgress?.({
      current: i + 1,
      total,
      percentage: Math.round(((i + 1) / total) * 100),
    });

    try {
      const canvas = await captureToCanvas(elements[i]);
      const blob = await canvasToBlob(canvas, 'image/png');
      
      if (validateBlob(blob)) {
        zip.file(`${filename}-page-${i + 1}.png`, blob);
      } else {
        errors.push(`Page ${i + 1}: Empty output`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Page ${i + 1}: ${msg}`);
      console.error(`Failed to capture page ${i + 1}:`, err);
    }
  }
  
  // Check if we have any successful pages
  const fileCount = Object.keys(zip.files).length;
  if (fileCount === 0) {
    throw new Error(`Failed to export any pages: ${errors.join('; ')}`);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  
  if (!validateBlob(zipBlob)) {
    throw new Error('Generated ZIP file is empty');
  }
  
  downloadBlob(zipBlob, `${filename}.zip`);
  
  // Warn if some pages failed
  if (errors.length > 0) {
    console.warn(`Some pages failed to export: ${errors.join('; ')}`);
  }
}

// Main export function - PNG for single, ZIP for multiple
export async function exportPages(
  elements: HTMLElement[],
  filename: string = 'handwritten-notes',
  onProgress?: ProgressCallback
): Promise<void> {
  if (!elements || elements.length === 0) {
    throw new Error('No pages to export');
  }
  
  // Filter out invalid elements
  const validElements = elements.filter(el => validateElement(el).valid);
  
  if (validElements.length === 0) {
    throw new Error('No valid pages found to export');
  }

  if (validElements.length === 1) {
    await exportToImage(validElements[0], 'png', filename);
  } else {
    await exportPagesAsZip(validElements, filename, onProgress);
  }
}

// Backward compatibility wrapper
export async function exportToPDF(
  elements: HTMLElement[],
  filename: string = 'handwritten-notes',
  _pageSize?: string,
  onProgress?: ProgressCallback
): Promise<void> {
  return exportPages(elements, filename, onProgress);
}

// Export all pages as individual image files
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
      await exportToImage(validElements[i], format, `${baseFilename}-page-${i + 1}`);
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
