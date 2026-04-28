/**
 * @file src/components/card-generator/CardFormPanel.tsx
 * Panneau gauche du générateur de cartes : logos, champs, boutons export.
 * Reçoit toutes les données en props et ne possède aucun état propre.
 */
import { Upload, FileImage, FileText, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CardFormData, CardType } from '@/types';

// ─── Sous-composant : zone d'upload image ────────────────────────────────────

interface ImageUploadProps {
  label: string;
  value: string;
  alt: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function ImageUpload({ label, value, alt, onChange }: ImageUploadProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</Label>
      <label className="flex items-center justify-center gap-2 h-20 border-2 border-dashed rounded-xl cursor-pointer hover:border-navy/40 hover:bg-navy/5 transition-all">
        {value ? (
          <img src={value} alt={alt} className="h-16 w-16 object-contain" />
        ) : (
          <div className="text-center text-muted-foreground text-xs">
            <Upload className="h-5 w-5 mx-auto mb-1" />Charger
          </div>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={onChange} />
      </label>
    </div>
  );
}

// ─── Sous-composant : champ texte standard ────────────────────────────────────

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

function Field({ label, value, onChange, placeholder, className = '' }: FieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="rounded-lg" />
    </div>
  );
}

// ─── Titre du panneau selon le type de carte ──────────────────────────────────

const PANEL_TITLES: Record<CardType, string> = {
  access:    "Informations de l'adhérent",
  reminder:  'Détails du rappel',
  renewal:   "Informations de l'Assemblée",
  reglement: 'Règlement Intérieur du Club',
  principes: '10 Principes du Pratiquant',
  programme: 'Programme de la saison',
};

// ─── Composant principal ──────────────────────────────────────────────────────

interface CardFormPanelProps {
  cardType: CardType;
  form: CardFormData;
  clubLogo: string;
  vovinamLogoImg: string;
  memberPhoto: string;
  exporting: boolean;
  onUpdate: (key: keyof CardFormData, value: string) => void;
  onClubLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVovinamLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMemberPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportPNG: () => void;
  onExportPDF: () => void;
}

export function CardFormPanel({
  cardType,
  form,
  clubLogo,
  vovinamLogoImg,
  memberPhoto,
  exporting,
  onUpdate,
  onClubLogoChange,
  onVovinamLogoChange,
  onMemberPhotoChange,
  onExportPNG,
  onExportPDF,
}: CardFormPanelProps) {
  return (
    <Card className="border-none shadow-md rounded-2xl overflow-hidden">
      <CardHeader className="bg-navy text-white pb-4">
        <CardTitle className="font-display text-lg">{PANEL_TITLES[cardType]}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">

        {/* Logos */}
        <div className="grid grid-cols-2 gap-4">
          <ImageUpload label="Logo du Club"   value={clubLogo}      alt="Club"    onChange={onClubLogoChange} />
          <ImageUpload label="Logo Vovinam"   value={vovinamLogoImg} alt="Vovinam" onChange={onVovinamLogoChange} />
        </div>

        {/* Champs communs */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="La Ligue"    value={form.ligue}    onChange={(v) => onUpdate('ligue', v)} />
          <Field label="Nom du Club" value={form.clubName} onChange={(v) => onUpdate('clubName', v)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Prénom" value={form.firstName} onChange={(v) => onUpdate('firstName', v)} />
          <Field label="Nom"    value={form.lastName}  onChange={(v) => onUpdate('lastName', v)} />
        </div>
        <Field label="Téléphone" value={form.phone} onChange={(v) => onUpdate('phone', v)} />

        {/* Photo membre — accès uniquement */}
        {cardType === 'access' && (
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Photo du Pratiquant</Label>
            <label className="flex items-center justify-center h-28 border-2 border-dashed rounded-xl cursor-pointer hover:border-navy/40 hover:bg-navy/5 transition-all">
              {memberPhoto ? (
                <img src={memberPhoto} alt="Membre" className="h-24 w-24 rounded-full object-cover border-4 border-[#1e3a5f]" />
              ) : (
                <div className="text-center text-muted-foreground text-sm">
                  <Upload className="h-6 w-6 mx-auto mb-1" />Charger la photo
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={onMemberPhotoChange} />
            </label>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Saison"   value={form.season}  onChange={(v) => onUpdate('season', v)} />
          <Field label="Site Web" value={form.website} onChange={(v) => onUpdate('website', v)} />
        </div>
        <Field label="Email" value={form.email} onChange={(v) => onUpdate('email', v)} />

        {/* Champs rappel paiement */}
        {cardType === 'reminder' && (
          <div className="space-y-4 pt-2 border-t border-navy/10 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Montant Inscription (FCFA)" value={form.inscriptionAmount} onChange={(v) => onUpdate('inscriptionAmount', v)} className="text-red-martial" />
              <Field label="Montant Mensualité (FCFA)"  value={form.mensualiteAmount}  onChange={(v) => onUpdate('mensualiteAmount', v)}  className="text-red-martial" />
            </div>
            <Field label="Méthode de Paiement" value={form.paymentMethod} onChange={(v) => onUpdate('paymentMethod', v)} />
          </div>
        )}

        {/* Champs élections / renouvellement */}
        {cardType === 'renewal' && (
          <div className="space-y-4 pt-2 border-t border-navy/10 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Titre Principal" value={form.renewalTitle}    onChange={(v) => onUpdate('renewalTitle', v)} />
              <Field label="Sous-titre"      value={form.renewalSubtitle} onChange={(v) => onUpdate('renewalSubtitle', v)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Date" value={form.renewalDate}     onChange={(v) => onUpdate('renewalDate', v)} />
              <Field label="Heure" value={form.renewalTime}    onChange={(v) => onUpdate('renewalTime', v)} />
              <Field label="Lieu"  value={form.renewalLocation} onChange={(v) => onUpdate('renewalLocation', v)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ordre du Jour (3 max)</Label>
              <Input value={form.renewalAgenda1} onChange={(e) => onUpdate('renewalAgenda1', e.target.value)} className="rounded-lg mb-1" placeholder="Point 1" />
              <Input value={form.renewalAgenda2} onChange={(e) => onUpdate('renewalAgenda2', e.target.value)} className="rounded-lg mb-1" placeholder="Point 2" />
              <Input value={form.renewalAgenda3} onChange={(e) => onUpdate('renewalAgenda3', e.target.value)} className="rounded-lg"    placeholder="Point 3" />
            </div>
            <Field label="Message Final" value={form.renewalMessage} onChange={(v) => onUpdate('renewalMessage', v)} />
          </div>
        )}

        {/* Champs programme */}
        {cardType === 'programme' && (
          <div className="space-y-4 pt-2 border-t border-navy/10 mt-2">
            <Field label="Titre du Programme" value={form.programTitle} onChange={(v) => onUpdate('programTitle', v)} />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Activités</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onUpdate('programActivities', [...form.programActivities, { id: Date.now().toString(), name: '', date: '', location: '', time: '' }])}
                >
                  <Plus className="h-3 w-3 mr-1" /> Ajouter
                </Button>
              </div>
              
              {form.programActivities.map((activity, index) => (
                <div key={activity.id} className="p-3 border rounded-lg space-y-3 bg-slate-50 relative">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 h-6 w-6 text-destructive hover:bg-destructive/10"
                    onClick={() => onUpdate('programActivities', form.programActivities.filter(a => a.id !== activity.id))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  <div className="space-y-1.5 pr-8">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Activité</Label>
                    <Input 
                      value={activity.name} 
                      onChange={(e) => {
                        const newActivities = [...form.programActivities];
                        newActivities[index].name = e.target.value;
                        onUpdate('programActivities', newActivities);
                      }} 
                      placeholder="Ex: Ouverture de saison" 
                      className="h-8 text-sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Date</Label>
                      <Input 
                        value={activity.date} 
                        onChange={(e) => {
                          const newActivities = [...form.programActivities];
                          newActivities[index].date = e.target.value;
                          onUpdate('programActivities', newActivities);
                        }} 
                        placeholder="JJ/MM/AAAA" 
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Lieu</Label>
                      <Input 
                        value={activity.location} 
                        onChange={(e) => {
                          const newActivities = [...form.programActivities];
                          newActivities[index].location = e.target.value;
                          onUpdate('programActivities', newActivities);
                        }} 
                        placeholder="Lieu" 
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Heure</Label>
                      <Input 
                        value={activity.time} 
                        onChange={(e) => {
                          const newActivities = [...form.programActivities];
                          newActivities[index].time = e.target.value;
                          onUpdate('programActivities', newActivities);
                        }} 
                        placeholder="Ex: 09h00" 
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Boutons export */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button onClick={onExportPNG} disabled={exporting} className="flex-1 bg-navy hover:bg-navy-light h-12 rounded-xl text-base gap-2 shadow-lg shadow-navy/20">
            {exporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileImage className="h-5 w-5" />}
            Télécharger PNG
          </Button>
          <Button onClick={onExportPDF} disabled={exporting} variant="outline" className="flex-1 h-12 rounded-xl text-base gap-2 border-navy text-navy hover:bg-navy/5">
            {exporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
            Télécharger PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
