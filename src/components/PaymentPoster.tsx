import { CreditCard, Phone, Users, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import html2canvas from "html2canvas";
import clubLogo from "@/assets/logo.png";
import waveQrCode from "@/assets/wave-qr-code.png";

const PaymentPoster = () => {
  const posterRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPNG = async () => {
    if (!posterRef.current) return;

    const canvas = await html2canvas(posterRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const link = document.createElement('a');
    link.download = 'affiche-vovinam-paiement.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="w-full max-w-[210mm] mx-auto">
      {/* Buttons - hidden when printing */}
      <div className="flex justify-center gap-3 mb-4 print:hidden flex-wrap">
        <Button
          onClick={handleDownloadPNG}
          className="bg-red-martial hover:bg-red-martial-light text-primary-foreground font-display uppercase tracking-wide gap-2"
        >
          <Download className="w-5 h-5" />
          Télécharger PNG
        </Button>
        <Button
          onClick={handlePrint}
          variant="outline"
          className="border-navy text-navy hover:bg-navy hover:text-primary-foreground font-display uppercase tracking-wide gap-2"
        >
          <Printer className="w-5 h-5" />
          Imprimer
        </Button>
      </div>

      <div ref={posterRef} className="bg-background shadow-2xl print:shadow-none">
        {/* A4 aspect ratio container */}
        <div className="relative aspect-[210/297] bg-background overflow-hidden">
          {/* Top decorative bar */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-navy via-red-martial to-navy" />

          {/* Main content */}
          <div className="flex flex-col h-full px-6 py-8 sm:px-10 sm:py-10">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-4">
              <img
                src={clubLogo}
                alt="VOVINAM VIET VO DAO UGB SC Logo"
                className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
              />
            </div>

            {/* Title Section */}
            <div className="text-center mb-4">
              <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-navy tracking-wide uppercase">
                Communiqué
              </h1>
              <div className="flex items-center justify-center gap-3 mt-2">
                <div className="h-0.5 w-10 bg-red-martial" />
                <h2 className="font-display font-semibold text-lg sm:text-xl md:text-2xl text-red-martial uppercase">
                  Rappel de Paiement
                </h2>
                <div className="h-0.5 w-10 bg-red-martial" />
              </div>
              <p className="font-display font-semibold text-navy text-base sm:text-lg mt-2 uppercase">
                Saison 2024 / 2025
              </p>
            </div>

            {/* Introduction Text */}
            <div className="mb-4 px-2">
              <p className="font-body text-foreground text-sm sm:text-base leading-relaxed text-justify">
                Le <span className="font-semibold">VOVINAM VIET VO DAO UGB SPORTING CLUB</span> informe l'ensemble de ses pratiquants que, pour la saison sportive 2024 / 2025, les frais étaient fixés comme suit :
              </p>
            </div>

            {/* Pricing Section */}
            <div className="bg-muted rounded-lg p-4 sm:p-5 mb-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="font-body text-foreground text-sm sm:text-base">• Frais d'inscription</span>
                  <span className="font-display font-bold text-navy text-base sm:text-lg">2 000 FCFA</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="font-body text-foreground text-sm sm:text-base">• Mensualité</span>
                  <span className="font-display font-bold text-navy text-base sm:text-lg">1 000 FCFA</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-navy rounded-md px-4 -mx-2">
                  <span className="font-body text-primary-foreground text-sm sm:text-base font-semibold">• Montant total annuel</span>
                  <span className="font-display font-bold text-primary-foreground text-lg sm:text-xl">10 000 FCFA</span>
                </div>
              </div>
            </div>

            {/* Information Text */}
            <div className="mb-4 px-2">
              <p className="font-body text-foreground text-sm sm:text-base leading-relaxed text-justify">
                À cet effet, les pratiquants n'ayant pas encore réglé la totalité des frais de la saison 2024 / 2025 sont priés de <span className="font-semibold text-red-martial">se mettre à jour dans les meilleurs délais</span>, afin de régulariser leur situation et permettre le bon fonctionnement des activités du club.
              </p>
            </div>

            {/* Payment Section Title */}
            <div className="text-center mb-3">
              <span className="font-display font-semibold text-navy text-base sm:text-lg uppercase tracking-wide">
                👉 Modalité de paiement
              </span>
            </div>

            {/* Payment Info */}
            <div className="bg-gradient-to-r from-navy to-navy-light rounded-lg p-4 sm:p-5 mb-3 text-primary-foreground">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <span className="font-display font-semibold text-sm sm:text-base uppercase tracking-wide">
                  📲 Paiement Wave
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-4 bg-[#1cbcfc]/5 p-6 rounded-2xl border-2 border-[#1cbcfc]/20">
                  <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-slate-100">
                    <img
                      src={waveQrCode}
                      alt="Wave QR Code"
                      className="w-44 h-44 object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-[#1cbcfc] font-bold text-lg leading-tight">
                      Scanner pour payer
                    </p>
                    <p className="text-navy/60 text-sm italic">
                      via l'application Wave
                    </p>
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <span className="font-display font-bold text-2xl sm:text-3xl tracking-wider block">
                    75 557 55 51
                  </span>
                  <p className="text-xs sm:text-sm font-medium italic opacity-90">
                    Club Marchand (Numéro Officiel)
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-red-martial/10 border-2 border-red-martial rounded-lg p-4 sm:p-5 mb-3">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-red-martial flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-body text-foreground text-sm sm:text-base leading-relaxed">
                    📩 Après paiement, merci de vous signaler au :
                  </p>
                  <p className="font-display font-bold text-red-martial text-xl sm:text-2xl mt-1 tracking-wider">
                    78 282 96 73 (Preuve de paiement)
                  </p>
                </div>
              </div>
            </div>

            {/* Closing Text */}
            <div className="text-center mb-auto px-2">
              <p className="font-body text-foreground text-sm sm:text-base italic">
                Nous comptons sur la compréhension et la collaboration de tous.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t-2 border-navy">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-navy" />
                <span className="font-display font-semibold text-navy text-sm sm:text-base uppercase tracking-wide">
                  Le Bureau
                </span>
              </div>
              <p className="font-display font-bold text-center text-navy text-xs sm:text-sm uppercase tracking-wider">
                VOVINAM VIET VO DAO UGB SPORTING CLUB
              </p>
            </div>

            {/* Bottom decorative bar */}
            <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-navy via-red-martial to-navy" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPoster;