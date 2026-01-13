import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PageSize, PAGE_SIZE_OPTIONS } from '@/types/notes';

type PdfImageType = 'JPEG' | 'PNG';

export type ExportProgress = {
  current: number;
  total: number;
  percentage: number;
};

export type ProgressCallback = (progress: ExportProgress) => void;

const isMobileBrowser = () =>
  typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image data'));
    reader.readAsDataURL(blob);
  });

const canvasToImageDataUrl = async (
  canvas: HTMLCanvasElement
): Promise<{ dataUrl: string; type: PdfImageType }> => {
  // Prefer JPEG for mobile stability; sniff actual output type to avoid jsPDF mismatch.
  try {
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create image blob'));
        },
        'image/jpeg',
        0.92
      );
    });

    return { dataUrl: await blobToDataUrl(blob), type: 'JPEG' };
  } catch {
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const type: PdfImageType = dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
    return { dataUrl, type };
  }
};

// Get page dimensions in points for jsPDF
const getPageDimensions = (pageSize: PageSize): { width: number; height: number } => {
  const sizeOption = PAGE_SIZE_OPTIONS.find((opt) => opt.value === pageSize);
  if (sizeOption) {
    // Convert mm to points (1mm = 2.83465 points)
    return {
      width: sizeOption.width * 2.83465,
      height: sizeOption.height * 2.83465,
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
  const scale = isMobileBrowser() ? 1.5 : 2;

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    onProgress?.({
      current: i + 1,
      total,
      percentage: Math.round(((i + 1) / total) * 100),
    });

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      backgroundColor: '#FFFFFF',
      logging: false,
      allowTaint: false,
      foreignObjectRendering: false,
    });

    const { dataUrl: imgData, type: imgType } = await canvasToImageDataUrl(canvas);

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    if (i > 0) {
      pdf.addPage();
    }

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

    pdf.addImage(imgData, imgType, 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));
  }

  // More reliable on mobile than pdf.save() (avoids some gesture/download restrictions)
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
