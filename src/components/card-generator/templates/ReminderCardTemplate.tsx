/**
 * @file src/components/card-generator/templates/ReminderCardTemplate.tsx
 * Template visuel du rappel de paiement (flyer A6).
 */
import { AlertCircle } from 'lucide-react';
import type { CardFormData } from '@/types';

interface Props {
  form: CardFormData;
  clubLogo: string;
  vovinamLogoImg: string;
}

export function ReminderCardTemplate({ form, clubLogo, vovinamLogoImg }: Props) {
  return (
    <div style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)', padding: '24px', minHeight: '340px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Watermark */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.05, pointerEvents: 'none' }}>
        <img src={vovinamLogoImg} alt="" style={{ width: '300px' }} />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
        <div style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
          <img src={clubLogo} alt="Club" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e3a5f', maxWidth: '200px' }}>{form.clubName}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ background: '#dc2626', color: '#ffffff', padding: '4px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle style={{ width: '14px', height: '14px' }} /> Rappel de Paiement
          </div>
          <div style={{ fontSize: '12px', marginTop: '4px', color: '#666', fontWeight: 600 }}>Saison {form.season}</div>
        </div>
      </div>

      {/* Amounts */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', textAlign: 'center', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#1e3a5f', letterSpacing: '1px', marginBottom: '16px' }}>
            INSCRIPTION : {form.inscriptionAmount} FCFA
          </div>
          <div style={{ width: '60px', height: '2px', background: '#dc2626', margin: '0 auto 16px' }} />
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#1e3a5f', letterSpacing: '1px' }}>
            MENSUALITÉ : {form.mensualiteAmount} FCFA
          </div>
        </div>
        <div style={{ fontSize: '14px', color: '#444', textAlign: 'center', fontWeight: 600, padding: '0 10px' }}>
          Merci de régulariser votre cotisation pour la suite de vos entraînements.
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', borderTop: '2px solid #dc2626', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: '#1e3a5f', width: '36px', height: '36px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={vovinamLogoImg} alt="Vovinam" style={{ maxWidth: '24px', maxHeight: '24px', objectFit: 'contain' }} />
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
  );
}
