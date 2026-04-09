import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileImage, FileText, Upload, Loader2, CreditCard, Bell, AlertCircle, Users, CalendarDays, MapPin, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import vovinamLogo from '@/assets/logo.png';
import vovinam_Logo from '@/assets/logo-vovinam.png';

export default function CardGenerator() {
    const cardRef = useRef<HTMLDivElement>(null);
    const [exporting, setExporting] = useState(false);

    const [cardType, setCardType] = useState<'access' | 'reminder' | 'renewal'>('access');
    const [form, setForm] = useState({
        ligue: 'SAINT-LOUIS',
        clubName: 'VOVINAM UGB SPORTING CLUB',
        firstName: 'DAOUDA',
        lastName: 'FICKOU',
        phone: '+221 78 282 96 73',
        season: '2026',
        website: 'https://vovinam-ugb-sc.netlify.app/',
        email: 'vovinam.ugb.sc@gmail.com',
        inscriptionAmount: '2 000',
        mensualiteAmount: '1 000',
        paymentMethod: 'Wave au 75 557 55 51',
        renewalTitle: 'ASSEMBLÉE GÉNÉRALE ORDINAIRE',
        renewalSubtitle: 'Renouvellement du Bureau',
        renewalDate: 'Samedi 15 Mai 2026',
        renewalTime: '15h00',
        renewalLocation: "Dojo de l'UGB",
        renewalAgenda1: 'Bilan Moral et Financier',
        renewalAgenda2: 'Élection du nouveau bureau',
        renewalAgenda3: 'Perspectives et divers',
        renewalMessage: 'La présence de tous les membres est vivement souhaitée pour la bonne marche de notre club.',
    });

    const [clubLogo, setClubLogo] = useState<string>(vovinamLogo);
    const [vovinamLogoImg, setVovinamLogoImg] = useState<string>(vovinam_Logo);
    const [memberPhoto, setMemberPhoto] = useState<string>('');

    const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

    const handleImageUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: (v: string) => void,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setter(reader.result as string);
        reader.readAsDataURL(file);
    };

    // Detect mobile for lower canvas scale (memory)
    const isMobile = () => window.innerWidth < 768;

    const captureCard = async () => {
        if (!cardRef.current) return null;
        return html2canvas(cardRef.current, {
            scale: isMobile() ? 2 : 3,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
        });
    };

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        // Cleanup after a delay (iOS needs time)
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 1000);
    };

    const exportPNG = async () => {
        if (exporting) return;
        setExporting(true);
        try {
            const canvas = await captureCard();
            if (!canvas) return;
            const filename = `${cardType}_${form.firstName}_${form.lastName}.png`;
            // Convert to blob for better mobile compatibility
            canvas.toBlob((blob) => {
                if (blob) downloadBlob(blob, filename);
            }, 'image/png');
        } finally {
            setExporting(false);
        }
    };

    const exportPDF = async () => {
        if (exporting) return;
        setExporting(true);
        try {
            const canvas = await captureCard();
            if (!canvas) return;
            const imgData = canvas.toDataURL('image/png');
            const cardWidth = 86; // mm (credit card size)
            const cardHeight = (canvas.height / canvas.width) * cardWidth;
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [cardWidth + 10, cardHeight + 10] });
            pdf.addImage(imgData, 'PNG', 5, 5, cardWidth, cardHeight);
            const filename = `${cardType}_${form.firstName}_${form.lastName}.pdf`;
            // Use blob output for better mobile compatibility
            const pdfBlob = pdf.output('blob');
            downloadBlob(pdfBlob, filename);
        } finally {
            setExporting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-display font-bold text-navy">Gestion des Cartes</h1>
                    <p className="text-muted-foreground">Générez des cartes d'accès ou des rappels de paiement</p>
                </div>

                <Tabs defaultValue="access" onValueChange={(v) => setCardType(v as any)} className="w-full">
                    <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-8">
                        <TabsTrigger value="access" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
                            <CreditCard className="h-4 w-4 hidden sm:block" /> Carte Adhérent
                        </TabsTrigger>
                        <TabsTrigger value="reminder" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
                            <Bell className="h-4 w-4 hidden sm:block" /> Rappel
                        </TabsTrigger>
                        <TabsTrigger value="renewal" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-base">
                            <Users className="h-4 w-4 hidden sm:block" /> Élections
                        </TabsTrigger>
                    </TabsList>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* ══════════════ FORM ══════════════ */}
                        <Card className="border-none shadow-md rounded-2xl overflow-hidden">
                            <CardHeader className="bg-navy text-white pb-4">
                                <CardTitle className="font-display text-lg">
                                    {cardType === 'access' ? "Informations de l'adhérent" : cardType === 'reminder' ? "Détails du rappel" : "Informations de l'Assemblée"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">
                                {/* Logos */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Logo du Club</Label>
                                        <label className="flex items-center justify-center gap-2 h-20 border-2 border-dashed rounded-xl cursor-pointer hover:border-navy/40 hover:bg-navy/5 transition-all">
                                            {clubLogo ? (
                                                <img src={clubLogo} alt="Club" className="h-16 w-16 object-contain" />
                                            ) : (
                                                <div className="text-center text-muted-foreground text-xs"><Upload className="h-5 w-5 mx-auto mb-1" />Charger</div>
                                            )}
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setClubLogo)} />
                                        </label>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Logo Vovinam</Label>
                                        <label className="flex items-center justify-center gap-2 h-20 border-2 border-dashed rounded-xl cursor-pointer hover:border-navy/40 hover:bg-navy/5 transition-all">
                                            {vovinamLogoImg ? (
                                                <img src={vovinamLogoImg} alt="Vovinam" className="h-16 w-16 object-contain" />
                                            ) : (
                                                <div className="text-center text-muted-foreground text-xs"><Upload className="h-5 w-5 mx-auto mb-1" />Charger</div>
                                            )}
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setVovinamLogoImg)} />
                                        </label>
                                    </div>
                                </div>

                                {/* Text Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">La Ligue</Label>
                                        <Input value={form.ligue} onChange={(e) => update('ligue', e.target.value)} className="rounded-lg" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nom du Club</Label>
                                        <Input value={form.clubName} onChange={(e) => update('clubName', e.target.value)} className="rounded-lg" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Prénom</Label>
                                        <Input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className="rounded-lg" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nom</Label>
                                        <Input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} className="rounded-lg" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Téléphone</Label>
                                    <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="rounded-lg" />
                                </div>

                                {cardType === 'access' && (
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Photo du Pratiquant</Label>
                                        <label className="flex items-center justify-center h-28 border-2 border-dashed rounded-xl cursor-pointer hover:border-navy/40 hover:bg-navy/5 transition-all">
                                            {memberPhoto ? (
                                                <img src={memberPhoto} alt="Membre" className="h-24 w-24 rounded-full object-cover border-4 border-[#1e3a5f]" />
                                            ) : (
                                                <div className="text-center text-muted-foreground text-sm"><Upload className="h-6 w-6 mx-auto mb-1" />Charger la photo</div>
                                            )}
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setMemberPhoto)} />
                                        </label>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Saison</Label>
                                        <Input value={form.season} onChange={(e) => update('season', e.target.value)} className="rounded-lg" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Site Web</Label>
                                        <Input value={form.website} onChange={(e) => update('website', e.target.value)} className="rounded-lg" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</Label>
                                    <Input value={form.email} onChange={(e) => update('email', e.target.value)} className="rounded-lg" />
                                </div>

                                {cardType === 'reminder' && (
                                    <div className="space-y-4 pt-2 border-t border-navy/10 mt-2">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-red-martial">Montant Inscription (FCFA)</Label>
                                                <Input value={form.inscriptionAmount} onChange={(e) => update('inscriptionAmount', e.target.value)} className="rounded-lg border-red-martial/20 focus:border-red-martial" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-red-martial">Montant Mensualité (FCFA)</Label>
                                                <Input value={form.mensualiteAmount} onChange={(e) => update('mensualiteAmount', e.target.value)} className="rounded-lg border-red-martial/20 focus:border-red-martial" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-red-martial">Méthode de Paiement</Label>
                                            <Input value={form.paymentMethod} onChange={(e) => update('paymentMethod', e.target.value)} className="rounded-lg border-red-martial/20 focus:border-red-martial" />
                                        </div>
                                    </div>
                                )}

                                {cardType === 'renewal' && (
                                    <div className="space-y-4 pt-2 border-t border-navy/10 mt-2">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-navy">Titre Principal</Label>
                                                <Input value={form.renewalTitle} onChange={(e) => update('renewalTitle', e.target.value)} className="rounded-lg" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-navy">Sous-titre</Label>
                                                <Input value={form.renewalSubtitle} onChange={(e) => update('renewalSubtitle', e.target.value)} className="rounded-lg" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-navy">Date</Label>
                                                <Input value={form.renewalDate} onChange={(e) => update('renewalDate', e.target.value)} className="rounded-lg" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-navy">Heure</Label>
                                                <Input value={form.renewalTime} onChange={(e) => update('renewalTime', e.target.value)} className="rounded-lg" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-navy">Lieu</Label>
                                                <Input value={form.renewalLocation} onChange={(e) => update('renewalLocation', e.target.value)} className="rounded-lg" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-navy">Ordre du Jour (3 max)</Label>
                                            <Input value={form.renewalAgenda1} onChange={(e) => update('renewalAgenda1', e.target.value)} className="rounded-lg mb-1" placeholder="Point 1" />
                                            <Input value={form.renewalAgenda2} onChange={(e) => update('renewalAgenda2', e.target.value)} className="rounded-lg mb-1" placeholder="Point 2" />
                                            <Input value={form.renewalAgenda3} onChange={(e) => update('renewalAgenda3', e.target.value)} className="rounded-lg" placeholder="Point 3" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-navy">Message Final</Label>
                                            <Input value={form.renewalMessage} onChange={(e) => update('renewalMessage', e.target.value)} className="rounded-lg" />
                                        </div>
                                    </div>
                                )}

                                {/* Export Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <Button onClick={exportPNG} disabled={exporting} className="flex-1 bg-navy hover:bg-navy-light h-12 rounded-xl text-base gap-2 shadow-lg shadow-navy/20">
                                        {exporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileImage className="h-5 w-5" />} Télécharger PNG
                                    </Button>
                                    <Button onClick={exportPDF} disabled={exporting} variant="outline" className="flex-1 h-12 rounded-xl text-base gap-2 border-navy text-navy hover:bg-navy/5">
                                        {exporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />} Télécharger PDF
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* ══════════════ CARD PREVIEW ══════════════ */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Download className="h-5 w-5 text-navy" />
                                <h2 className="font-display font-bold text-navy text-lg">Aperçu en temps réel</h2>
                            </div>

                            <div className="overflow-x-auto -mx-4 px-4 pb-2">
                                <div
                                    ref={cardRef}
                                    style={{
                                        width: '600px',
                                        fontFamily: "'Open Sans', Arial, sans-serif",
                                        backgroundColor: '#ffffff',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                                        border: '1px solid #e2e8f0',
                                    }}
                                >
                                    {cardType === 'access' && (
                                        <>
                                            {/* ── ACCESS CARD HEADER ── */}
                                            <div
                                                style={{
                                                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                                    padding: '14px 20px 10px',
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '10px',
                                                }}
                                            >
                                                {/* Left Logo */}
                                                <div style={{ flexShrink: 0, width: '70px', height: '70px' }}>
                                                    {clubLogo && (
                                                        <img
                                                            src={clubLogo}
                                                            alt="Club"
                                                            style={{ width: '70px', height: '70px', objectFit: 'contain', borderRadius: '50%' }}
                                                            crossOrigin="anonymous"
                                                        />
                                                    )}
                                                </div>

                                                {/* Center Text */}
                                                <div style={{ flex: 1, textAlign: 'center', paddingTop: '2px' }}>
                                                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#1a1a2e', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: "'Oswald', sans-serif" }}>
                                                        UNION SENEGALAISE VOVINAM VIET VO DAO
                                                    </div>
                                                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a1a2e', fontFamily: "'Oswald', sans-serif" }}>
                                                        (USV)
                                                    </div>
                                                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#444', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                                                        LIGUE DE {form.ligue} DE VOVINAM
                                                    </div>
                                                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e3a5f', fontFamily: "'Oswald', sans-serif", marginTop: '2px' }}>
                                                        {form.clubName}
                                                    </div>
                                                </div>

                                                {/* Right Logo */}
                                                <div style={{ flexShrink: 0, width: '70px', height: '70px' }}>
                                                    {vovinamLogoImg && (
                                                        <img
                                                            src={vovinamLogoImg}
                                                            alt="Vovinam"
                                                            style={{ width: '70px', height: '70px', objectFit: 'contain' }}
                                                            crossOrigin="anonymous"
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* ── ACCESS CARD BODY ── */}
                                            <div style={{ padding: '8px 20px 16px', display: 'flex', gap: '20px', alignItems: 'flex-start', minHeight: '200px' }}>
                                                {/* Left Column: Badge + Photo */}
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', flexShrink: 0 }}>
                                                    {/* CARTE D'ACCÈS Badge */}
                                                    <div
                                                        style={{
                                                            background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
                                                            color: '#ffffff',
                                                            fontWeight: 900,
                                                            fontSize: '16px',
                                                            padding: '5px 16px',
                                                            borderRadius: '4px',
                                                            fontFamily: "'Oswald', sans-serif",
                                                            letterSpacing: '1px',
                                                            textTransform: 'uppercase',
                                                            boxShadow: '0 2px 8px rgba(30,58,95,0.3)',
                                                        }}
                                                    >
                                                        CARTE D'ACCÈS
                                                    </div>

                                                    {/* Member Photo */}
                                                    <div
                                                        style={{
                                                            width: '160px',
                                                            height: '160px',
                                                            borderRadius: '50%',
                                                            border: '5px solid #1e3a5f',
                                                            overflow: 'hidden',
                                                            backgroundColor: '#e2e8f0',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                        }}
                                                    >
                                                        {memberPhoto ? (
                                                            <img
                                                                src={memberPhoto}
                                                                alt="Membre"
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                crossOrigin="anonymous"
                                                            />
                                                        ) : (
                                                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                                <circle cx="12" cy="7" r="4" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right Column: Vovinam text + Info */}
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '6px', paddingTop: '4px' }}>
                                                    {/* "Vovinam Việt Võ Đạo" text */}
                                                    <div style={{ marginBottom: '8px' }}>
                                                        <span style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 900, fontSize: '18px', color: '#dc2626', letterSpacing: '1px' }}>VOVINAM </span>
                                                        <span style={{ fontFamily: "serif", fontWeight: 700, fontSize: '18px', color: '#1e3a5f' }}>VIỆT VÕ ĐẠO</span>
                                                    </div>

                                                    {/* Member Info */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '4px' }}>
                                                        <div>
                                                            <span style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>Prénom : </span>
                                                            <span style={{ fontSize: '18px', fontWeight: 800, color: '#1a1a2e' }}>{form.firstName || '—'}</span>
                                                        </div>
                                                        <div>
                                                            <span style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>Nom : </span>
                                                            <span style={{ fontSize: '18px', fontWeight: 800, color: '#1a1a2e' }}>{form.lastName || '—'}</span>
                                                        </div>
                                                        <div>
                                                            <span style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>Tél : </span>
                                                            <span style={{ fontSize: '18px', fontWeight: 800, color: '#1a1a2e' }}>{form.phone || '—'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ── ACCESS CARD FOOTER ── */}
                                            <div
                                                style={{
                                                    background: '#1e3a5f',
                                                    display: 'flex',
                                                    alignItems: 'stretch',
                                                    justifyContent: 'space-between',
                                                    minHeight: '42px',
                                                }}
                                            >
                                                {/* Season */}
                                                <div
                                                    style={{
                                                        color: '#ffffff',
                                                        fontWeight: 800,
                                                        fontSize: '16px',
                                                        padding: '8px 20px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        fontFamily: "'Oswald', sans-serif",
                                                        letterSpacing: '0.5px',
                                                    }}
                                                >
                                                    Saison {form.season}
                                                </div>

                                                {/* Website and Email */}
                                                <div
                                                    style={{
                                                        background: '#dc2626',
                                                        color: '#ffffff',
                                                        fontWeight: 700,
                                                        fontSize: '11px',
                                                        padding: '4px 16px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'flex-end',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span style={{ fontWeight: 800 }}>Web :</span> {form.website}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                                        <span style={{ fontWeight: 800 }}>Email :</span> {form.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {cardType === 'reminder' && (
                                        <>
                                            {/* ── REMINDER CARD ── */}
                                            <div
                                                style={{
                                                    background: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)',
                                                    padding: '24px',
                                                    minHeight: '340px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    position: 'relative',
                                                }}
                                            >
                                                {/* Watermark Logo */}
                                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.05, pointerEvents: 'none' }}>
                                                    <img src={vovinamLogoImg} alt="" style={{ width: '300px' }} />
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                                    <div>
                                                        <img src={clubLogo} alt="Club" style={{ width: '60px', height: '60px', objectFit: 'contain', marginBottom: '8px' }} />
                                                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e3a5f', maxWidth: '200px' }}>{form.clubName}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{
                                                            background: '#dc2626',
                                                            color: '#ffffff',
                                                            padding: '4px 12px',
                                                            borderRadius: '4px',
                                                            fontSize: '14px',
                                                            fontWeight: 900,
                                                            textTransform: 'uppercase',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}>
                                                            <AlertCircle style={{ width: '14px', height: '14px' }} /> Rappel de Paiement
                                                        </div>
                                                        <div style={{ fontSize: '12px', marginTop: '4px', color: '#666', fontWeight: 600 }}>Saison {form.season}</div>
                                                    </div>
                                                </div>

                                                <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
                                                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', textAlign: 'center', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                                                        <div style={{ 
                                                            fontSize: '28px', 
                                                            fontWeight: 900, 
                                                            color: '#1e3a5f', 
                                                            letterSpacing: '1px',
                                                            marginBottom: '16px'
                                                        }}>
                                                            INSCRIPTION : {form.inscriptionAmount} FCFA
                                                        </div>
                                                        <div style={{ 
                                                            width: '60px', 
                                                            height: '2px', 
                                                            background: '#dc2626', 
                                                            margin: '0 auto 16px' 
                                                        }}></div>
                                                        <div style={{ 
                                                            fontSize: '28px', 
                                                            fontWeight: 900, 
                                                            color: '#1e3a5f', 
                                                            letterSpacing: '1px' 
                                                        }}>
                                                            MENSUALITÉ : {form.mensualiteAmount} FCFA
                                                        </div>
                                                    </div>

                                                    <div style={{ fontSize: '14px', color: '#444', textAlign: 'center', fontWeight: 600, padding: '0 10px' }}>
                                                        Merci de régulariser votre cotisation pour la suite de vos entraînements.
                                                    </div>
                                                </div>

                                                <div style={{ marginTop: 'auto', borderTop: '2px solid #dc2626', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ background: '#1e3a5f', padding: '6px', borderRadius: '4px' }}>
                                                            <img src={vovinam_Logo} alt="Vovinam" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', flexDirection: 'column' }}>
                                                            <span>{form.website}</span>
                                                            <span>{form.email}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '15px', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>Règlement via</div>
                                                        <div style={{ fontWeight: 800, color: '#1e3a5f', fontSize: '20px' }}>{form.paymentMethod}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {cardType === 'renewal' && (
                                        <>
                                            {/* ── RENEWAL / ELECTION POSTER ── */}
                                            <div
                                                style={{
                                                    background: '#ffffff',
                                                    padding: '0',
                                                    minHeight: '600px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    position: 'relative',
                                                }}
                                            >
                                                {/* Header Banner */}
                                                <div style={{ background: '#1e3a5f', padding: '24px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '6px solid #dc2626' }}>
                                                    <img src={clubLogo} alt="Club" style={{ width: '80px', height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} crossOrigin="anonymous" />
                                                    <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
                                                        <div style={{ color: '#ffffff', fontFamily: "'Oswald', sans-serif", fontSize: '20px', fontWeight: 800, letterSpacing: '1px' }}>
                                                            {form.clubName}
                                                        </div>
                                                        <div style={{ color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '4px' }}>
                                                            Ligue de {form.ligue}
                                                        </div>
                                                    </div>
                                                    <img src={vovinamLogoImg} alt="Vovinam" style={{ width: '80px', height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} crossOrigin="anonymous" />
                                                </div>

                                                {/* Watermark Logo */}
                                                <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.03, pointerEvents: 'none' }}>
                                                    <img src={vovinamLogoImg} alt="" style={{ width: '400px' }} crossOrigin="anonymous" />
                                                </div>

                                                <div style={{ padding: '40px 30px', flex: 1, display: 'flex', flexDirection: 'column', zIndex: 1 }}>
                                                    {/* Titles */}
                                                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                                        <div style={{ 
                                                            display: 'inline-block',
                                                            background: '#dc2626',
                                                            color: '#ffffff',
                                                            padding: '6px 20px',
                                                            borderRadius: '50px',
                                                            fontSize: '14px',
                                                            fontWeight: 800,
                                                            letterSpacing: '2px',
                                                            textTransform: 'uppercase',
                                                            marginBottom: '16px'
                                                        }}>
                                                            Convocation Officielle
                                                        </div>
                                                        <div style={{ fontSize: '32px', fontWeight: 900, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '1px', lineHeight: 1.2, fontFamily: "'Oswald', sans-serif" }}>
                                                            {form.renewalTitle}
                                                        </div>
                                                        <div style={{ fontSize: '22px', fontWeight: 700, color: '#dc2626', marginTop: '8px', textTransform: 'uppercase' }}>
                                                            {form.renewalSubtitle}
                                                        </div>
                                                    </div>

                                                    {/* Info Boxes */}
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                                                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                                            <div style={{ background: '#1e3a5f', color: '#ffffff', padding: '12px', borderRadius: '50%' }}>
                                                                <CalendarDays style={{ width: '24px', height: '24px' }} />
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Date & Heure</div>
                                                                <div style={{ fontSize: '16px', color: '#1e3a5f', fontWeight: 800, marginTop: '4px' }}>{form.renewalDate}</div>
                                                                <div style={{ fontSize: '15px', color: '#dc2626', fontWeight: 800 }}>{form.renewalTime}</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                                            <div style={{ background: '#1e3a5f', color: '#ffffff', padding: '12px', borderRadius: '50%' }}>
                                                                <MapPin style={{ width: '24px', height: '24px' }} />
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Lieu de la rencontre</div>
                                                                <div style={{ fontSize: '16px', color: '#1e3a5f', fontWeight: 800, marginTop: '4px' }}>{form.renewalLocation}</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Agenda */}
                                                    <div style={{ background: '#ffffff', border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '24px', marginBottom: '40px' }}>
                                                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e3a5f', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div style={{ width: '8px', height: '8px', background: '#dc2626', borderRadius: '50%' }}></div>
                                                            Ordre du Jour
                                                        </div>
                                                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                            {[form.renewalAgenda1, form.renewalAgenda2, form.renewalAgenda3].filter(Boolean).map((agenda, index) => (
                                                                <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '18px', fontWeight: 600, color: '#334155' }}>
                                                                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '15px' }}>
                                                                        {index + 1}
                                                                    </div>
                                                                    {agenda}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    {/* Final Message */}
                                                    <div style={{ fontSize: '16px', color: '#475569', textAlign: 'center', fontWeight: 500, fontStyle: 'italic', padding: '0 20px', marginBottom: 'auto' }}>
                                                        "{form.renewalMessage}"
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div style={{ background: '#f1f5f9', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>
                                                    <div style={{ fontSize: '10px', color: '#1e3a5f', fontWeight: 700 }}>
                                                        Info : {form.phone}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{form.email}</div>
                                                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{form.website}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
