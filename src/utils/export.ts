import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PageSize, PAGE_SIZE_OPTIONS } from '@/types/notes';

export type ExportProgress = {
  current: number;
  total: number;
  percentage: number;
};

export type ProgressCallback = (progress: ExportProgress) => void;

// Get page dimensions in points for jsPDF
const getPageDimensions = (pageSize: PageSize): { width: number; height: number } => {
  const sizeOption = PAGE_SIZE_OPTIONS.find(opt => opt.value === pageSize);
  if (sizeOption) {
    // Convert mm to points (1mm = 2.83465 points)
    return {
      width: sizeOption.width * 2.83465,
      height: sizeOption.height * 2.83465
    };
  }
  // Default A4 in points
  return { width: 595.28, height: 841.89 };
};

export async function exportToPDF(
  elements: HTMLElement[],
  filename: string = 'handwritten-notes',
  pageSize: PageSize = 'a4',
  onProgress?: ProgressCallback
): Promise<void> {
  if (elements.length === 0) return;

  const dimensions = getPageDimensions(pageSize);
  const total = elements.length;
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [dimensions.width, dimensions.height],
  });

  const pdfWidth = dimensions.width;
  const pdfHeight = dimensions.height;

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    
    // Report progress before processing each page
    onProgress?.({
      current: i + 1,
      total,
      percentage: Math.round(((i + 1) / total) * 100)
    });
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#FFFFFF',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    if (i > 0) {
      pdf.addPage();
    }

    // Fill page with white background first
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));
  }

  pdf.save(`${filename}.pdf`);
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
