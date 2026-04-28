/**
 * @file src/components/card-generator/templates/ReglementCardTemplate.tsx
 * Template visuel affiche Règlement Intérieur du Club (A4 portrait).
 */
import { REGLEMENT_ARTICLES } from '@/components/card-generator/data/reglement';
import type { CardFormData } from '@/types';

interface Props {
  form: CardFormData;
  clubLogo: string;
  vovinamLogoImg: string;
}

export function ReglementCardTemplate({ form, clubLogo, vovinamLogoImg }: Props) {
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
          <div style={{ color: '#ffffff', fontFamily: "'Oswald', sans-serif", fontSize: '22px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>Règlement Intérieur</div>
          <div style={{ color: '#94a3b8', fontFamily: "'Oswald', sans-serif", fontSize: '13px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginTop: '2px' }}>{form.clubName}</div>
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
      <div style={{ background: '#eff6ff', borderBottom: '1px solid #bfdbfe', padding: '8px 38px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1 }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1e3a5f', flexShrink: 0 }} />
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Saison {form.season} — À respecter par tous les membres
        </div>
      </div>

      {/* Articles */}
      <div style={{ padding: '18px 30px 18px 38px', flex: 1, zIndex: 1 }}>
        {REGLEMENT_ARTICLES.map((art, i) => (
          <div key={art.num} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: i < 9 ? '10px' : '0', paddingBottom: i < 9 ? '10px' : '0', borderBottom: i < 9 ? '1px solid #f1f5f9' : 'none' }}>
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <div style={{ fontSize: '8px', fontWeight: 800, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Art.</div>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: i % 2 === 0 ? '#1e3a5f' : '#7c3aed', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '13px', fontFamily: "'Oswald', sans-serif", boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                {art.num}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{art.titre}</div>
              <div style={{ fontSize: '11px', fontWeight: 500, color: '#475569', lineHeight: 1.45 }}>{art.texte}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ background: '#1e3a5f', padding: '14px 30px 14px 38px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '4px solid #7c3aed' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Contact</div>
          <div style={{ color: '#ffffff', fontSize: '11px', fontWeight: 600 }}>{form.phone}</div>
          <div style={{ color: '#cbd5e1', fontSize: '10px' }}>{form.email}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#a78bfa', fontFamily: "'Oswald', sans-serif", fontSize: '13px', fontWeight: 900, letterSpacing: '1px' }}>RÈGLEMENT</div>
          <div style={{ color: '#94a3b8', fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Intérieur du Club</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Site Web</div>
          <div style={{ color: '#ffffff', fontSize: '10px', fontWeight: 600 }}>{form.website}</div>
        </div>
      </div>
    </div>
  );
}
