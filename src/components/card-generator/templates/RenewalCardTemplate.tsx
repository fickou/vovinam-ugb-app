/**
 * @file src/components/card-generator/templates/RenewalCardTemplate.tsx
 * Template visuel affiche de convocation / élections du bureau (A4).
 */
import { CalendarDays, MapPin } from 'lucide-react';
import type { CardFormData } from '@/types';

interface Props {
  form: CardFormData;
  clubLogo: string;
  vovinamLogoImg: string;
}

export function RenewalCardTemplate({ form, clubLogo, vovinamLogoImg }: Props) {
  const agendaItems = [form.renewalAgenda1, form.renewalAgenda2, form.renewalAgenda3].filter(Boolean);

  return (
    <div style={{ background: '#ffffff', padding: '0', minHeight: '600px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Header Banner */}
      <div style={{ background: '#1e3a5f', padding: '24px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '6px solid #dc2626' }}>
        <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img src={clubLogo} alt="Club" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} crossOrigin="anonymous" />
        </div>
        <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
          <div style={{ color: '#ffffff', fontFamily: "'Oswald', sans-serif", fontSize: '20px', fontWeight: 800, letterSpacing: '1px' }}>{form.clubName}</div>
          <div style={{ color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '4px' }}>Ligue de {form.ligue}</div>
        </div>
        <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img src={vovinamLogoImg} alt="Vovinam" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} crossOrigin="anonymous" />
        </div>
      </div>

      {/* Watermark */}
      <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.03, pointerEvents: 'none' }}>
        <img src={vovinamLogoImg} alt="" style={{ width: '400px' }} crossOrigin="anonymous" />
      </div>

      <div style={{ padding: '40px 30px', flex: 1, display: 'flex', flexDirection: 'column', zIndex: 1 }}>
        {/* Titles */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-block', background: '#dc2626', color: '#ffffff', padding: '6px 20px', borderRadius: '50px', fontSize: '14px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
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
          {[
            {
              icon: <CalendarDays style={{ width: '24px', height: '24px' }} />,
              label: 'Date & Heure',
              primary: form.renewalDate,
              secondary: form.renewalTime,
              secondaryColor: '#dc2626',
            },
            {
              icon: <MapPin style={{ width: '24px', height: '24px' }} />,
              label: 'Lieu de la rencontre',
              primary: form.renewalLocation,
            },
          ].map(({ icon, label, primary, secondary, secondaryColor }) => (
            <div key={label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ background: '#1e3a5f', color: '#ffffff', padding: '12px', borderRadius: '50%' }}>{icon}</div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: '16px', color: '#1e3a5f', fontWeight: 800, marginTop: '4px' }}>{primary}</div>
                {secondary && <div style={{ fontSize: '15px', color: secondaryColor ?? '#1e3a5f', fontWeight: 800 }}>{secondary}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Agenda */}
        <div style={{ background: '#ffffff', border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '24px', marginBottom: '40px' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e3a5f', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', background: '#dc2626', borderRadius: '50%' }} />
            Ordre du Jour
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {agendaItems.map((agenda, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '18px', fontWeight: 600, color: '#334155' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '15px' }}>
                  {index + 1}
                </div>
                {agenda}
              </li>
            ))}
          </ul>
        </div>

        {/* Message */}
        <div style={{ fontSize: '16px', color: '#475569', textAlign: 'center', fontWeight: 500, fontStyle: 'italic', padding: '0 20px', marginBottom: 'auto' }}>
          "{form.renewalMessage}"
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#f1f5f9', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '10px', color: '#1e3a5f', fontWeight: 700 }}>Info : {form.phone}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{form.email}</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{form.website}</div>
        </div>
      </div>
    </div>
  );
}
