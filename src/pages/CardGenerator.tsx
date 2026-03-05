import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileImage, FileText, Upload } from 'lucide-react';
import vovinamLogo from '@/assets/logo.png';

export default function CardGenerator() {
    const cardRef = useRef<HTMLDivElement>(null);

    const [form, setForm] = useState({
        ligue: 'DAKAR',
        clubName: 'VOVINAM UGB SC',
        firstName: 'DAOUDA',
        lastName: 'FICKOU',
        phone: '+221 78 282 96 73',
        season: '2026',
        website: 'https://vovinam-ugb-sc.netlify.app/',
    });

    const [clubLogo, setClubLogo] = useState<string>(vovinamLogo);
    const [vovinamLogoImg, setVovinamLogoImg] = useState<string>('');
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

    const exportPNG = async () => {
        if (!cardRef.current) return;
        const canvas = await html2canvas(cardRef.current, {
            scale: 3,
            useCORS: true,
            backgroundColor: '#ffffff',
        });
        const link = document.createElement('a');
        link.download = `carte_${form.firstName}_${form.lastName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const exportPDF = async () => {
        if (!cardRef.current) return;
        const canvas = await html2canvas(cardRef.current, {
            scale: 3,
            useCORS: true,
            backgroundColor: '#ffffff',
        });
        const imgData = canvas.toDataURL('image/png');
        const cardWidth = 86; // mm (credit card size)
        const cardHeight = (canvas.height / canvas.width) * cardWidth;
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [cardWidth + 10, cardHeight + 10] });
        pdf.addImage(imgData, 'PNG', 5, 5, cardWidth, cardHeight);
        pdf.save(`carte_${form.firstName}_${form.lastName}.pdf`);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-display font-bold text-navy">Carte d'Accès</h1>
                    <p className="text-muted-foreground">Générez des cartes d'accès pour les pratiquants</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* ══════════════ FORM ══════════════ */}
                    <Card className="border-none shadow-md rounded-2xl overflow-hidden">
                        <CardHeader className="bg-navy text-white pb-4">
                            <CardTitle className="font-display text-lg">Informations de la carte</CardTitle>
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

                            {/* Photo Upload */}
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

                            {/* Export Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button onClick={exportPNG} className="flex-1 bg-navy hover:bg-navy-light h-12 rounded-xl text-base gap-2 shadow-lg shadow-navy/20">
                                    <FileImage className="h-5 w-5" /> Télécharger PNG
                                </Button>
                                <Button onClick={exportPDF} variant="outline" className="flex-1 h-12 rounded-xl text-base gap-2 border-navy text-navy hover:bg-navy/5">
                                    <FileText className="h-5 w-5" /> Télécharger PDF
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

                        <div className="flex justify-center">
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
                                {/* ── HEADER ── */}
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

                                {/* ── BODY ── */}
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

                                {/* ── FOOTER ── */}
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

                                    {/* Website */}
                                    <div
                                        style={{
                                            background: '#dc2626',
                                            color: '#ffffff',
                                            fontWeight: 700,
                                            fontSize: '13px',
                                            padding: '8px 16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                        }}
                                    >
                                        <span style={{ fontWeight: 800 }}>Site web :</span> {form.website}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Export Buttons */}
                        <div className="flex gap-3 xl:hidden pt-2">
                            <Button onClick={exportPNG} className="flex-1 bg-navy hover:bg-navy-light h-12 rounded-xl text-base gap-2">
                                <FileImage className="h-5 w-5" /> PNG
                            </Button>
                            <Button onClick={exportPDF} variant="outline" className="flex-1 h-12 rounded-xl text-base gap-2 border-navy text-navy">
                                <FileText className="h-5 w-5" /> PDF
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
