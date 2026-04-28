/**
 * @file src/components/card-generator/templates/ProgrammeCardTemplate.tsx
 * Template visuel du programme régional d'activités (A4 portrait).
 */
import type { CardFormData } from '@/types';

interface Props {
  form: CardFormData;
  clubLogo: string;
  vovinamLogoImg: string;
}

export function ProgrammeCardTemplate({ form, clubLogo, vovinamLogoImg }: Props) {
  return (
    <div style={{ background: '#ffffff', minHeight: '800px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Side stripe */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '8px', background: 'linear-gradient(180deg, #1e3a5f 0%, #dc2626 100%)' }} />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2447 100%)', padding: '20px 30px 20px 38px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '5px solid #dc2626' }}>
        <div style={{ width: '72px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img src={clubLogo} alt="Club" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }} crossOrigin="anonymous" />
        </div>
        <div style={{ textAlign: 'center', flex: 1, padding: '0 16px' }}>
          <div style={{ color: '#dc2626', fontFamily: "'Oswald', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>Vovinam Việt Võ Đạo</div>
          <div style={{ color: '#ffffff', fontFamily: "'Oswald', sans-serif", fontSize: '20px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>Programme d'Activités</div>
          <div style={{ color: '#94a3b8', fontFamily: "'Oswald', sans-serif", fontSize: '12px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginTop: '2px' }}>Vovinam UGB CLUB • Ligue de {form.ligue}</div>
        </div>
        <div style={{ width: '72px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img src={vovinamLogoImg} alt="Vovinam" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }} crossOrigin="anonymous" />
        </div>
      </div>

      {/* Subtitle ribbon */}
      <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '10px 38px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>
          {form.programTitle || 'Calendrier de la Saison'} {form.season}
        </div>
      </div>

      {/* Activities Table */}
      <div style={{ padding: '30px 30px 30px 38px', flex: 1, zIndex: 1 }}>
        <div style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ padding: '12px 15px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', borderBottom: '2px solid #cbd5e1' }}>Date & Heure</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', borderBottom: '2px solid #cbd5e1' }}>Activité</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', borderBottom: '2px solid #cbd5e1' }}>Lieu</th>
              </tr>
            </thead>
            <tbody>
              {form.programActivities && form.programActivities.length > 0 ? (
                form.programActivities.map((act, i) => (
                  <tr key={act.id} style={{ background: i % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 15px', verticalAlign: 'top' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a5f' }}>{act.date}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{act.time}</div>
                    </td>
                    <td style={{ padding: '14px 15px', verticalAlign: 'top' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', lineHeight: 1.4 }}>{act.name}</div>
                    </td>
                    <td style={{ padding: '14px 15px', verticalAlign: 'top' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>{act.location}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px', fontStyle: 'italic' }}>
                    Aucune activité programmée pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Note / Message */}
        <div style={{ marginTop: '30px', padding: '20px', borderRadius: '12px', background: '#eff6ff', border: '1px dashed #bfdbfe', textAlign: 'center' }}>
          <div style={{ color: '#1e40af', fontSize: '13px', fontWeight: 700, fontStyle: 'italic' }}>
            "La ponctualité et la discipline sont les clés de la progression."
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#1e3a5f', padding: '14px 30px 14px 38px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '4px solid #dc2626' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Club</div>
          <div style={{ color: '#ffffff', fontSize: '11px', fontWeight: 600 }}>{form.clubName}</div>
          <div style={{ color: '#cbd5e1', fontSize: '10px' }}>{form.email}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#dc2626', fontFamily: "'Oswald', sans-serif", fontSize: '14px', fontWeight: 900, letterSpacing: '1px' }}>VOVINAM</div>
          <div style={{ color: '#94a3b8', fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Việt Võ Đạo</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Site Web</div>
          <div style={{ color: '#ffffff', fontSize: '10px', fontWeight: 600 }}>{form.website}</div>
        </div>
      </div>
    </div>
  );
}