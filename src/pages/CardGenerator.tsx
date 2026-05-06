/**
 * @file src/pages/CardGenerator.tsx
 * Orchestrateur du générateur de cartes.
 *
 * Avant refactoring : 1 012 lignes (tout en un).
 * Après  refactoring :  ~70 lignes (orchestration pure).
 *
 * Chaque responsabilité est déléguée à son module :
 *  - Données statiques  → card-generator/data/
 *  - Export PNG/PDF     → card-generator/useCardExport.ts
 *  - Templates visuels  → card-generator/templates/
 *  - Formulaire         → card-generator/CardFormPanel.tsx
 *  - Onglets            → card-generator/CardTabsNav.tsx
 */
import { useState, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Download } from 'lucide-react';
import { Tabs, TabsContent } from '@/components/ui/tabs';

import { useCardExport } from '@/components/card-generator/useCardExport';
import { CardTabsNav } from '@/components/card-generator/CardTabsNav';
import { CardFormPanel } from '@/components/card-generator/CardFormPanel';
import { AccessCardTemplate }   from '@/components/card-generator/templates/AccessCardTemplate';
import { ReminderCardTemplate } from '@/components/card-generator/templates/ReminderCardTemplate';
import { RenewalCardTemplate }  from '@/components/card-generator/templates/RenewalCardTemplate';
import { ReglementCardTemplate } from '@/components/card-generator/templates/ReglementCardTemplate';
import { PrincipesCardTemplate } from '@/components/card-generator/templates/PrincipesCardTemplate';
import { ProgrammeCardTemplate } from '@/components/card-generator/templates/ProgrammeCardTemplate';
import { PassageCardTemplate }  from '@/components/card-generator/templates/PassageCardTemplate';

import vovinamLogo   from '@/assets/logo.png';
import vovinam_Logo  from '@/assets/logo-vovinam.png';
import type { CardType, CardFormData } from '@/types';

// ─── Valeurs par défaut du formulaire ────────────────────────────────────────

const DEFAULT_FORM: CardFormData = {
  ligue:            'SAINT-LOUIS',
  clubName:         'VOVINAM UGB  CLUB',
  firstName:        'DAOUDA',
  lastName:         'FICKOU',
  phone:            '+221 78 282 96 73',
  season:           '2026',
  website:          'https://vovinam-ugb-sc.netlify.app/',
  email:            'vovinam.ugb.sc@gmail.com',
  inscriptionAmount:'2 000',
  mensualiteAmount: '1 000',
  paymentMethod:    'Wave au 75 557 55 51',
  renewalTitle:     'ASSEMBLÉE GÉNÉRALE ORDINAIRE',
  renewalSubtitle:  'Renouvellement du Bureau',
  renewalDate:      'Samedi 15 Mai 2026',
  renewalTime:      '15h00',
  renewalLocation:  "Dojo de l'UGB",
  renewalAgenda1:   'Bilan Moral et Financier',
  renewalAgenda2:   'Élection du nouveau bureau',
  renewalAgenda3:   'Perspectives et divers',
  renewalMessage:   'La présence de tous les membres est vivement souhaitée pour la bonne marche de notre club.',
  programTitle:     'Programme régional de la ligue nord',
  programActivities: [
    { id: '1', name: 'Ouverture de saison', date: '07/12/2025', location: 'Pikine poste courant', time: '09h00' },
    { id: '2', name: 'Passage de grade régional(3cap)', date: '18/04/2026', location: 'UGB', time: '16h00' },
  ],
  // ── Passage de Grade ──
  passageOrganizer:    '',
  passageTitle:        '',
  passageGrades:       '',
  passageDate:         '',
  passageLocation:     '',
  passageTime:         '',
  passagePhone:        '',
  passageEmail:        '',
};

// ─── Gestionnaire upload image ────────────────────────────────────────────────

function readImageFile(
  e: React.ChangeEvent<HTMLInputElement>,
  setter: (v: string) => void,
) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => setter(reader.result as string);
  reader.readAsDataURL(file);
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function CardGenerator() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardType, setCardType]         = useState<CardType>('access');
  const [form, setForm]                 = useState<CardFormData>(DEFAULT_FORM);
  const [clubLogo, setClubLogo]         = useState<string>(vovinamLogo);
  const [vovinamLogoImg, setVovinamLogoImg] = useState<string>(vovinam_Logo);
  const [memberPhoto, setMemberPhoto]   = useState<string>('');
  // Images spécifiques à l'onglet Passage (toutes vides par défaut)
  const [passageBg, setPassageBg]           = useState<string>('');
  const [passageBeltImg, setPassageBeltImg] = useState<string>('');
  const [passageMasterImg, setPassageMasterImg] = useState<string>('');

  const { exporting, exportPNG, exportPDF } = useCardExport({
    cardRef,
    cardType,
    firstName: form.firstName,
    lastName:  form.lastName,
  });

  const update = (key: keyof CardFormData, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Props partagées entre tous les templates
  const templateProps = { form, clubLogo, vovinamLogoImg, memberPhoto };
  const passageTemplateProps = { form, clubLogo, vovinamLogoImg, passageBg, passageBeltImg, passageMasterImg };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy">Gestion des Cartes</h1>
          <p className="text-muted-foreground">Générez des cartes d'accès ou des rappels de paiement</p>
        </div>

        <Tabs defaultValue="access" onValueChange={(v) => setCardType(v as CardType)} className="w-full">
          <CardTabsNav />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* ── Formulaire ── */}
            <CardFormPanel
              cardType={cardType}
              form={form}
              clubLogo={clubLogo}
              vovinamLogoImg={vovinamLogoImg}
              memberPhoto={memberPhoto}
              passageBg={passageBg}
              passageBeltImg={passageBeltImg}
              passageMasterImg={passageMasterImg}
              exporting={exporting}
              onUpdate={update}
              onClubLogoChange={(e) => readImageFile(e, setClubLogo)}
              onVovinamLogoChange={(e) => readImageFile(e, setVovinamLogoImg)}
              onMemberPhotoChange={(e) => readImageFile(e, setMemberPhoto)}
              onPassageBgChange={(e) => readImageFile(e, setPassageBg)}
              onPassageBeltChange={(e) => readImageFile(e, setPassageBeltImg)}
              onPassageMasterChange={(e) => readImageFile(e, setPassageMasterImg)}
              onExportPNG={exportPNG}
              onExportPDF={exportPDF}
            />

            {/* ── Aperçu ── */}
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
                  <TabsContent value="access"    className="mt-0"><AccessCardTemplate   {...templateProps} /></TabsContent>
                  <TabsContent value="reminder"  className="mt-0"><ReminderCardTemplate {...templateProps} /></TabsContent>
                  <TabsContent value="renewal"   className="mt-0"><RenewalCardTemplate  {...templateProps} /></TabsContent>
                  <TabsContent value="reglement" className="mt-0"><ReglementCardTemplate {...templateProps} /></TabsContent>
                  <TabsContent value="principes" className="mt-0"><PrincipesCardTemplate {...templateProps} /></TabsContent>
                  <TabsContent value="programme" className="mt-0"><ProgrammeCardTemplate {...templateProps} /></TabsContent>
                  <TabsContent value="passage"   className="mt-0"><PassageCardTemplate  {...passageTemplateProps} /></TabsContent>
                </div>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
