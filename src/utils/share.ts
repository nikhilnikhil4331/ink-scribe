import html2canvas from 'html2canvas';
import { exportToPDF } from './export';

/**
 * Share preview as image via Web Share API or download fallback
 */
export async function shareAsImage(
  element: HTMLElement,
  title: string = 'NikNote'
): Promise<void> {
  await document.fonts.ready;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#FFFFFF',
    logging: false,
  });

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png', 1.0)
  );

  if (!blob) throw new Error('Failed to generate image');

  const file = new File([blob], `${title}.png`, { type: 'image/png' });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title,
      text: 'Made with NikNote ✍️',
      files: [file],
    });
  } else {
    // Fallback: download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

/**
 * Share preview as PDF via Web Share API or download fallback
 */
export async function shareAsPDF(
  elements: HTMLElement[],
  title: string = 'NikNote'
): Promise<void> {
  // exportToPDF already triggers download — we just call it
  await exportToPDF(elements, title);
}
