import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { PageSize } from '@/types/notes';

export type ExportProgress = {
  current: number;
  total: number;
  percentage: number;
};

export type ProgressCallback = (progress: ExportProgress) => void;

// A4 dimensions in mm
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

const isMobileBrowser = () =>
  typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

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

// Export multiple pages as ZIP of PNGs
async function exportPagesAsZip(
  elements: HTMLElement[],
  filename: string,
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
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.zip`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// PDF export (desktop only)
async function exportAsPDF(
  elements: HTMLElement[],
  filename: string,
  onProgress?: ProgressCallback
): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

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

    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const pageWidth = A4_WIDTH_MM;
    const pageHeight = (canvas.height * pageWidth) / canvas.width;

    if (i > 0) {
      pdf.addPage();
    }

    pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, Math.min(pageHeight, A4_HEIGHT_MM));
  }

  const pdfBlob = pdf.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Main export function - PNG/ZIP on mobile, PDF on desktop
export async function exportToPDF(
  elements: HTMLElement[],
  filename: string = 'handwritten-notes',
  _pageSize: PageSize = 'a4',
  onProgress?: ProgressCallback
): Promise<void> {
  if (elements.length === 0) return;

  const isMobile = isMobileBrowser();

  if (isMobile) {
    // Mobile: use PNG (single) or ZIP (multiple pages)
    if (elements.length === 1) {
      await exportToImage(elements[0], 'png', filename);
    } else {
      await exportPagesAsZip(elements, filename, onProgress);
    }
  } else {
    // Desktop: use PDF
    try {
      await exportAsPDF(elements, filename, onProgress);
    } catch (error) {
      console.error('PDF export failed, falling back to PNG:', error);
      if (elements.length === 1) {
        await exportToImage(elements[0], 'png', filename);
      } else {
        await exportPagesAsZip(elements, filename, onProgress);
      }
    }
  }
}

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
  });

  const link = document.createElement('a');
  link.download = `${filename}.${format}`;
  link.href = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.95 : undefined);
  link.click();
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
