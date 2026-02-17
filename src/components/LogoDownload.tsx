import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import clubLogo from "@/assets/logo.png";
import jsPDF from "jspdf";

const LogoDownload = () => {
  const handleDownloadPNG = () => {
    const link = document.createElement('a');
    link.download = 'vovinam-ugb-logo.png';
    link.href = clubLogo;
    link.click();
  };

  const handleDownloadSVG = () => {
    // Create SVG with embedded PNG
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1024" height="1024" viewBox="0 0 1024 1024">
  <image width="1024" height="1024" xlink:href="${clubLogo}"/>
</svg>`;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = 'vovinam-ugb-logo.svg';
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleDownloadPDF = async () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Calculate center position for A4
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const logoSize = 150; // mm
    const x = (pageWidth - logoSize) / 2;
    const y = (pageHeight - logoSize) / 2 - 20;
    
    // Add logo
    pdf.addImage(clubLogo, 'PNG', x, y, logoSize, logoSize);
    
    // Add club name
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('VOVINAM VIET VO DAO', pageWidth / 2, y + logoSize + 15, { align: 'center' });
    pdf.text('UGB SPORTING CLUB', pageWidth / 2, y + logoSize + 25, { align: 'center' });
    
    pdf.save('vovinam-ugb-logo.pdf');
  };

  return (
    <div className="bg-muted/50 rounded-xl p-6 mb-6">
      <h3 className="font-display font-bold text-navy text-lg mb-4 text-center uppercase tracking-wide">
        Télécharger le Logo
      </h3>
      
      <div className="flex justify-center mb-6">
        <img 
          src={clubLogo} 
          alt="VOVINAM VIET VO DAO UGB SC Logo" 
          className="w-40 h-40 object-contain"
        />
      </div>
      
      <div className="flex flex-wrap justify-center gap-3">
        <Button 
          onClick={handleDownloadPNG}
          className="bg-navy hover:bg-navy-light text-primary-foreground font-display uppercase tracking-wide gap-2"
        >
          <Download className="w-4 h-4" />
          PNG
        </Button>
        <Button 
          onClick={handleDownloadSVG}
          variant="outline"
          className="border-navy text-navy hover:bg-navy hover:text-primary-foreground font-display uppercase tracking-wide gap-2"
        >
          <Download className="w-4 h-4" />
          SVG
        </Button>
        <Button 
          onClick={handleDownloadPDF}
          className="bg-red-martial hover:bg-red-martial-light text-primary-foreground font-display uppercase tracking-wide gap-2"
        >
          <Download className="w-4 h-4" />
          PDF
        </Button>
      </div>
    </div>
  );
};

export default LogoDownload;
