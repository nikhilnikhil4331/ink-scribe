import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportToPDF(
  elements: HTMLElement[],
  filename: string = 'handwritten-notes'
): Promise<void> {
  if (elements.length === 0) return;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    if (i > 0) {
      pdf.addPage();
    }

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
    backgroundColor: null,
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
  baseFilename: string = 'handwritten-note'
): Promise<void> {
  for (let i = 0; i < elements.length; i++) {
    await exportToImage(elements[i], format, `${baseFilename}-page-${i + 1}`);
  }
}
