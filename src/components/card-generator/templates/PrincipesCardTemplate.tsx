/**
 * @file src/components/card-generator/templates/PrincipesCardTemplate.tsx
 * Template visuel affiche des 10 Principes du Vovinam (A4 portrait).
 */
import { PRINCIPES } from '@/components/card-generator/data/principes';
import type { CardFormData } from '@/types';

interface Props {
  form: CardFormData;
  clubLogo: string;
  vovinamLogoImg: string;
}

export function PrincipesCardTemplate({ form, clubLogo, vovinamLogoImg }: Props) {
  return (
    <div style={{ background: '#ffffff', minHeight: '800px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Side stripe */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '8px', background: 'linear-gradient(180deg, #dc2626 0%, #1e3a5f 100%)' }} />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2447 100%)', padding: '20px 30px 20px 38px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '5px solid #dc2626' }}>
        <div style={{ width: '72px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img src={clubLogo} alt="Club" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }} crossOrigin="anonymous" />
        </div>
        <div style={{ textAlign: 'center', flex: 1, padding: '0 16px' }}>
          <div style={{ color: '#dc2626', fontFamily: "'Oswald', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>Vovinam Việt Võ Đạo</div>
          <div style={{ color: '#ffffff', fontFamily: "'Oswald', sans-serif", fontSize: '22px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>10 Principes</div>
          <div style={{ color: '#94a3b8', fontFamily: "'Oswald', sans-serif", fontSize: '13px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginTop: '2px' }}>Du Pratiquant</div>
        </div>
        <div style={{ width: '72px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img src={vovinamLogoImg} alt="Vovinam" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }} crossOrigin="anonymous" />
        </div>
      </div>

      {/* Watermark */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -40%)', opacity: 0.03, pointerEvents: 'none', zIndex: 0 }}>
        <img src={vovinamLogoImg} alt="" style={{ width: '450px' }} />
      </div>

      {/* Subtitle ribbon */}
      <div style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca', padding: '8px 38px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1 }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626', flexShrink: 0 }} />
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#7f1d1d', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          {form.clubName} — Saison {form.season}
        </div>
      </div>

      {/* Principes */}
      <div style={{ padding: '18px 30px 18px 38px', flex: 1, zIndex: 1 }}>
        {PRINCIPES.map((p, i) => (
          <div key={p.num} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: i < 9 ? '11px' : '0', paddingBottom: i < 9 ? '11px' : '0', borderBottom: i < 9 ? '1px solid #f1f5f9' : 'none' }}>
            <div style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '8px', background: i % 2 === 0 ? '#1e3a5f' : '#dc2626', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '15px', fontFamily: "'Oswald', sans-serif", boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
              {p.num}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', lineHeight: 1.5, marginBottom: '2px' }}>{p.fr}</div>
              <div style={{ fontSize: '10.5px', fontWeight: 500, color: '#64748b', fontStyle: 'italic', lineHeight: 1.4 }}>{p.vn}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ background: '#1e3a5f', padding: '14px 30px 14px 38px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '4px solid #dc2626' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Contact</div>
          <div style={{ color: '#ffffff', fontSize: '11px', fontWeight: 600 }}>{form.phone}</div>
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
