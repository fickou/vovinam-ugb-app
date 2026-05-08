/**
 * @file src/components/card-generator/useCardExport.ts
 * Hook gérant l'export PNG/PDF pour tous les types de cartes.
 *
 * Principe : on capture le DOM tel quel (largeur naturelle 600px × hauteur auto),
 * puis on exporte sans jamais forcer de redimensionnement, de sorte que l'image
 * téléchargée respecte toujours ses proportions originales.
 */
import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { CardType } from '@/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Résolution du canvas (px par px DOM). 3 = haute qualité impression. */
const CAPTURE_SCALE = 3;

/**
 * Capture le nœud DOM en canvas haute-résolution.
 * On NE force pas de dimension : html2canvas lit la taille naturelle de l'élément.
 */
async function captureElement(element: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(element, {
    scale: CAPTURE_SCALE,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 15000,
    // On ne passe PAS width/height : html2canvas mesure l'élément lui-même.
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
 * Construit un PDF dont les dimensions (mm) correspondent EXACTEMENT au ratio
 * du canvas capturé, avec une largeur cible en mm qui dépend du type de carte.
 *
 * Largeurs cibles (identiques aux standards d'impression) :
 *  - access   : 86 mm  (carte de crédit)
 *  - reminder : 105 mm (A6 ½)
 *  - passage  : 148 mm (A5 paysage ½ ou format affiche)
 *  - autres   : 190 mm (A4 avec marges)
 */
function getTargetMmWidth(cardType: CardType): number {
  if (cardType === 'access') return 86;
  if (cardType === 'reminder') return 105;
  if (cardType === 'passage') return 148;
  return 190; // renewal, reglement, principes, programme
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

  const baseFilename = `${cardType}_${firstName || 'carte'}_${lastName || ''}`.replace(/\s+/g, '_');

  // ── Export PNG ──────────────────────────────────────────────────────────────
  // Le PNG est exporté à la résolution native du canvas (600px × CAPTURE_SCALE).
  // Aucun redimensionnement → aucune déformation.
  const exportPNG = async () => {
    if (exporting || !cardRef.current) return;
    setExporting(true);
    try {
      const canvas = await captureElement(cardRef.current);
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, `${baseFilename}.png`);
      }, 'image/png');
    } finally {
      setExporting(false);
    }
  };

  // ── Export PDF ──────────────────────────────────────────────────────────────
  // On calcule la hauteur en mm à partir du ratio réel du canvas, puis on crée
  // une page PDF dont les dimensions correspondent exactement à ce ratio.
  // → Ni étirement, ni compression, ni bandes blanches.
  const exportPDF = async () => {
    if (exporting || !cardRef.current) return;
    setExporting(true);
    try {
      const canvas = await captureElement(cardRef.current);

      const imgData = canvas.toDataURL('image/png');

      // Ratio hauteur/largeur du canvas (dimensions en px)
      const aspectRatio = canvas.height / canvas.width;

      // Largeur cible en mm selon le type de carte
      const MARGIN = 0; // pas de marge : le PDF est exactement la carte
      const targetWidth = getTargetMmWidth(cardType);
      const targetHeight = targetWidth * aspectRatio;

      // Orientation : paysage si la carte est plus large que haute
      const orientation: 'landscape' | 'portrait' = targetWidth > targetHeight ? 'landscape' : 'portrait';

      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: [targetWidth, targetHeight],
        compress: true,
      });

      // addImage avec les dimensions exactes de la page → aucun recadrage
      pdf.addImage(imgData, 'PNG', MARGIN, MARGIN, targetWidth, targetHeight, '', 'FAST');

      downloadBlob(pdf.output('blob'), `${baseFilename}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return { exporting, exportPNG, exportPDF };
}
