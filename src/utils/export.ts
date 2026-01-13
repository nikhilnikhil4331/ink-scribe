import html2canvas from 'html2canvas';
import JSZip from 'jszip';

export type ExportProgress = {
  current: number;
  total: number;
  percentage: number;
};

export type ProgressCallback = (progress: ExportProgress) => void;

// Convert canvas to blob
const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      },
      type,
      quality
    );
  });
};

// Download blob as file
const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Export single page as PNG
export async function exportToImage(
  element: HTMLElement,
  format: 'png' | 'jpeg' = 'png',
  filename: string = 'handwritten-note'
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#FFFFFF',
    logging: false,
    allowTaint: false,
    foreignObjectRendering: false,
  });

  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const quality = format === 'jpeg' ? 0.95 : undefined;
  const blob = await canvasToBlob(canvas, mimeType, quality);
  downloadBlob(blob, `${filename}.${format}`);
}

// Export multiple pages as ZIP of PNGs
export async function exportPagesAsZip(
  elements: HTMLElement[],
  filename: string = 'handwritten-notes',
  onProgress?: ProgressCallback
): Promise<void> {
  const zip = new JSZip();
  const total = elements.length;

  for (let i = 0; i < elements.length; i++) {
    onProgress?.({
      current: i + 1,
      total,
      percentage: Math.round(((i + 1) / total) * 100),
    });

    const canvas = await html2canvas(elements[i], {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FFFFFF',
      logging: false,
      allowTaint: false,
      foreignObjectRendering: false,
    });

    const blob = await canvasToBlob(canvas, 'image/png');
    zip.file(`${filename}-page-${i + 1}.png`, blob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, `${filename}.zip`);
}

// Main export function - PNG for single, ZIP for multiple
export async function exportPages(
  elements: HTMLElement[],
  filename: string = 'handwritten-notes',
  onProgress?: ProgressCallback
): Promise<void> {
  if (elements.length === 0) return;

  if (elements.length === 1) {
    await exportToImage(elements[0], 'png', filename);
  } else {
    await exportPagesAsZip(elements, filename, onProgress);
  }
}

// Keep for backward compatibility
export async function exportToPDF(
  elements: HTMLElement[],
  filename: string = 'handwritten-notes',
  _pageSize?: string,
  onProgress?: ProgressCallback
): Promise<void> {
  return exportPages(elements, filename, onProgress);
}

export async function exportAllPagesToImages(
  elements: HTMLElement[],
  format: 'png' | 'jpeg' = 'png',
  baseFilename: string = 'handwritten-note',
  onProgress?: ProgressCallback
): Promise<void> {
  const total = elements.length;
  
  for (let i = 0; i < elements.length; i++) {
    onProgress?.({
      current: i + 1,
      total,
      percentage: Math.round(((i + 1) / total) * 100)
    });
    
    await exportToImage(elements[i], format, `${baseFilename}-page-${i + 1}`);
  }
}
