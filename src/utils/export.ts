import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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

export async function exportToPDF(
  elements: HTMLElement[],
  filename: string = 'handwritten-notes',
  _pageSize: PageSize = 'a4',
  onProgress?: ProgressCallback
): Promise<void> {
  if (elements.length === 0) return;

  const total = elements.length;

  try {
    // Create PDF with fixed A4 size in mm - NO scale operations
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      onProgress?.({
        current: i + 1,
        total,
        percentage: Math.round(((i + 1) / total) * 100),
      });

      // Render to canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        allowTaint: false,
        foreignObjectRendering: false,
      });

      // Get image data as JPEG
      const imgData = canvas.toDataURL('image/jpeg', 0.92);

      // Calculate dimensions manually - pageWidth is fixed A4
      const pageWidth = A4_WIDTH_MM;
      const pageHeight = (canvas.height * pageWidth) / canvas.width;

      if (i > 0) {
        pdf.addPage();
      }

      // Add image WITHOUT any scale calls - just position and size
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, Math.min(pageHeight, A4_HEIGHT_MM));
    }

    // Download PDF
    const pdfBlob = pdf.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error('PDF export failed, falling back to PNG:', error);
    // Fallback: export first page as PNG
    if (elements.length > 0) {
      await exportToImage(elements[0], 'png', filename);
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
