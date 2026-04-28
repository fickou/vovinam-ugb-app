/**
 * @file src/components/card-generator/templates/AccessCardTemplate.tsx
 * Template visuel de la carte d'accès adhérent.
 */
import type { CardFormData } from '@/types';

interface Props {
  form: CardFormData;
  clubLogo: string;
  vovinamLogoImg: string;
  memberPhoto: string;
}

export function AccessCardTemplate({ form, clubLogo, vovinamLogoImg, memberPhoto }: Props) {
  return (
    <>
      {/* ── HEADER ── */}
      <div style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', padding: '14px 20px 10px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{ flexShrink: 0, width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {clubLogo && <img src={clubLogo} alt="Club" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '50%' }} crossOrigin="anonymous" />}
        </div>
        <div style={{ flex: 1, textAlign: 'center', paddingTop: '2px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#1a1a2e', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: "'Oswald', sans-serif" }}>
            UNION SENEGALAISE VOVINAM VIET VO DAO
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a1a2e', fontFamily: "'Oswald', sans-serif" }}>(USV)</div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#444', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
            LIGUE DE {form.ligue} DE VOVINAM
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e3a5f', fontFamily: "'Oswald', sans-serif", marginTop: '2px' }}>
            {form.clubName}
          </div>
        </div>
        <div style={{ flexShrink: 0, width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {vovinamLogoImg && <img src={vovinamLogoImg} alt="Vovinam" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} crossOrigin="anonymous" />}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ padding: '8px 20px 16px', display: 'flex', gap: '20px', alignItems: 'flex-start', minHeight: '200px' }}>
        {/* Left: Badge + Photo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', flexShrink: 0 }}>
          <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', color: '#ffffff', fontWeight: 900, fontSize: '16px', padding: '5px 16px', borderRadius: '4px', fontFamily: "'Oswald', sans-serif", letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 2px 8px rgba(30,58,95,0.3)' }}>
            CARTE D'ACCÈS
          </div>
          <div style={{ width: '160px', height: '160px', borderRadius: '50%', border: '5px solid #1e3a5f', overflow: 'hidden', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            {memberPhoto ? (
              <img src={memberPhoto} alt="Membre" style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
            ) : (
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
        </div>

        {/* Right: Info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '6px', paddingTop: '4px' }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 900, fontSize: '18px', color: '#dc2626', letterSpacing: '1px' }}>VOVINAM </span>
            <span style={{ fontFamily: 'serif', fontWeight: 700, fontSize: '18px', color: '#1e3a5f' }}>VIỆT VÕ ĐẠO</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '4px' }}>
            {[
              { label: 'Prénom', value: form.firstName },
              { label: 'Nom', value: form.lastName },
              { label: 'Tél', value: form.phone },
            ].map(({ label, value }) => (
              <div key={label}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>{label} : </span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#1a1a2e' }}>{value || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: '#1e3a5f', display: 'flex', alignItems: 'stretch', justifyContent: 'space-between', minHeight: '42px' }}>
        <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '16px', padding: '8px 20px', display: 'flex', alignItems: 'center', fontFamily: "'Oswald', sans-serif", letterSpacing: '0.5px' }}>
          Saison {form.season}
        </div>
        <div style={{ background: '#dc2626', color: '#ffffff', fontWeight: 700, fontSize: '11px', padding: '4px 16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontWeight: 800 }}>Web :</span> {form.website}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <span style={{ fontWeight: 800 }}>Email :</span> {form.email}
          </div>
        </div>
      </div>
    </>
  );
}
