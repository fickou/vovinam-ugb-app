/**
 * @file src/components/card-generator/useCardExport.ts
 * Hook gérant l'export PNG/PDF pour tous les types de cartes.
 * Extrait de CardGenerator.tsx pour isoler la logique d'export.
 */
import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { CardType } from '@/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isMobile(): boolean {
  return window.innerWidth < 768;
}

function getCanvasScale(cardType: CardType): number {
  const isPoster = (['reglement', 'principes', 'renewal', 'programme'] as CardType[]).includes(cardType);
  return isPoster ? 4 : isMobile() ? 2 : 3;
}

async function captureElement(
  element: HTMLDivElement,
  cardType: CardType,
): Promise<HTMLCanvasElement> {
  return html2canvas(element, {
    scale: getCanvasScale(cardType),
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 15000,
  });
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Renvoie la configuration PDF selon le type de carte :
 * - access   : 86 × ~130mm paysage (carte physique crédit)
 * - reminder : A6 portrait (105 × 148mm)
 * - renewal / reglement / principes / programme : A4 portrait (210 × 297mm)
 */
function getPdfConfig(cardType: CardType) {
  if (cardType === 'access') {
    return { contentWidth: 82, margin: 5, orientation: 'landscape' as const };
  }
  if (cardType === 'reminder') {
    return { contentWidth: 89, margin: 8, orientation: 'portrait' as const };
  }
  return { contentWidth: 190, margin: 10, orientation: 'portrait' as const };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseCardExportOptions {
  cardRef: React.RefObject<HTMLDivElement | null>;
  cardType: CardType;
  firstName: string;
  lastName: string;
}

export function useCardExport({ cardRef, cardType, firstName, lastName }: UseCardExportOptions) {
  const [exporting, setExporting] = useState(false);

  const baseFilename = `${cardType}_${firstName}_${lastName}`;

  const exportPNG = async () => {
    if (exporting || !cardRef.current) return;
    setExporting(true);
    try {
      const canvas = await captureElement(cardRef.current, cardType);
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, `${baseFilename}.png`);
      }, 'image/png');
    } finally {
      setExporting(false);
    }
  };

  const exportPDF = async () => {
    if (exporting || !cardRef.current) return;
    setExporting(true);
    try {
      const canvas = await captureElement(cardRef.current, cardType);
      const imgData = canvas.toDataURL('image/png');
      const { contentWidth, margin, orientation } = getPdfConfig(cardType);
      const contentHeight = (canvas.height / canvas.width) * contentWidth;
      const pageW = contentWidth + margin * 2;
      const pageH = contentHeight + margin * 2;

      const pdf = new jsPDF({ orientation, unit: 'mm', format: [pageW, pageH], compress: true });
      pdf.internal.scaleFactor = 1;
      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight, '', 'FAST');

      const pdfBlob = pdf.output('blob');
      downloadBlob(pdfBlob, `${baseFilename}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return { exporting, exportPNG, exportPDF };
}
