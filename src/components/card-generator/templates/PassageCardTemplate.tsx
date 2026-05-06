/**
 * @file src/components/card-generator/templates/PassageCardTemplate.tsx
 * Template visuel "Passage de Grade" – rendu fidèle à l'affiche USV fournie.
 * Même container 600px que AccessCardTemplate (défini dans CardGenerator).
 */
import type { CardFormData } from '@/types';

interface Props {
  form: CardFormData;
  clubLogo: string;
  vovinamLogoImg: string;
  passageBg: string;        // photo de fond (groupe/dojo)
  passageBeltImg: string;   // image ceinture / symbole croisé
  passageMasterImg: string; // photo du maître / pratiquant au premier plan
}

export function PassageCardTemplate({
  form,
  clubLogo,
  vovinamLogoImg,
  passageBg,
  passageBeltImg,
  passageMasterImg,
}: Props) {
  return (
    <>
      {/* ══════════════════════════════════════════════
          ZONE PRINCIPALE  (fond photo + overlay bleu)
      ══════════════════════════════════════════════ */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '420px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Photo de fond (groupe / dojo) ── */}
        {passageBg ? (
          <img
            src={passageBg}
            alt="Fond"
            crossOrigin="anonymous"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(160deg, #1a3a6e 0%, #0d2040 50%, #1a1a2e 100%)',
            }}
          />
        )}

        {/* Overlay semi-transparent pour lisibilité */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: passageBg
              ? 'linear-gradient(180deg, rgba(10,26,58,0.78) 0%, rgba(10,26,58,0.45) 45%, rgba(10,26,58,0.60) 75%, rgba(10,26,58,0.90) 100%)'
              : 'transparent',
          }}
        />

        {/* ── Contenu sur fond ── */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>

          {/* ── HEADER : logos + organisateur ── */}
          <div
            style={{
              padding: '14px 20px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              borderBottom: '3px solid #dc2626',
            }}
          >
            {/* Logo gauche */}
            <div style={{ flexShrink: 0, width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {clubLogo ? (
                <img
                  src={clubLogo}
                  alt="Club"
                  crossOrigin="anonymous"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }}
                />
              ) : (
                <div style={{ width: '62px', height: '62px', borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', textAlign: 'center' }}>Logo</span>
                </div>
              )}
            </div>

            {/* Titre central */}
            <div style={{ flex: 1, textAlign: 'center', padding: '0 8px' }}>
              <div
                style={{
                  color: '#ffffff',
                  fontFamily: "'Arial Black', 'Arial', sans-serif",
                  fontWeight: 900,
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  lineHeight: 1.25,
                  textShadow: '0 1px 4px rgba(0,0,0,0.7)',
                }}
              >
                {form.passageOrganizer || 'UNION SENEGALAISE DE VOVINAM VIET VO DAO (USV)'}
              </div>
              <div
                style={{
                  color: '#94a3b8',
                  fontWeight: 700,
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  marginTop: '4px',
                }}
              >
                {form.clubName ? `${form.clubName} • LIGUE DE ${form.ligue}` : `VOVINAM UGB CLUB • LIGUE DE ${form.ligue}`}
              </div>
            </div>

            {/* Logo droit */}
            <div style={{ flexShrink: 0, width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {vovinamLogoImg ? (
                <img
                  src={vovinamLogoImg}
                  alt="Vovinam"
                  crossOrigin="anonymous"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }}
                />
              ) : (
                <div style={{ width: '62px', height: '62px', borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', textAlign: 'center' }}>Logo</span>
                </div>
              )}
            </div>
          </div>

          {/* ── TITRE PRINCIPAL "PASSAGE DE GRADE" ── */}
          <div style={{ textAlign: 'center', padding: '22px 20px 4px' }}>
            <div
              style={{
                color: '#fbbf24',
                fontFamily: "'Arial Black', 'Arial', sans-serif",
                fontWeight: 900,
                fontSize: '44px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                lineHeight: 1,
                whiteSpace: 'nowrap',
                textShadow: '0 3px 16px rgba(0,0,0,0.85), 0 0 40px rgba(251,191,36,0.25)',
              }}
            >
              {form.passageTitle || 'PASSAGE DE GRADE'}
            </div>
          </div>

          {/* ── GRADES / CEINTURES ── */}
          <div style={{ textAlign: 'center', padding: '8px 20px 0' }}>
            <div
              style={{
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                textShadow: '0 1px 6px rgba(0,0,0,0.9)',
              }}
            >
              {form.passageGrades || 'CEINTURE JAUNE \u2013 1er DANG \u2013 2e DANG \u2013 3e DANG'}
            </div>
          </div>

          {/* ── ZONE CENTRALE : ceinture / symbole + maître ── */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '180px',
              padding: '10px 20px',
            }}
          >
            {/* Image ceinture OU croix SVG de substitution */}
            {passageBeltImg ? (
              <img
                src={passageBeltImg}
                alt="Ceinture"
                crossOrigin="anonymous"
                style={{
                  maxWidth: '300px',
                  maxHeight: '170px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.7))',
                }}
              />
            ) : (
              /* Croix X dorée (SVG) – symbolise les ceintures croisées */
              <svg
                viewBox="0 0 300 180"
                style={{ width: '300px', height: '180px' }}
                aria-label="Ceintures croisées"
              >
                {/* Barre diagonale ↘ */}
                <rect x="20" y="68" width="260" height="44" rx="8"
                  fill="#fbbf24"
                  transform="rotate(-32 150 90)"
                  style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))' }}
                />
                {/* Barre diagonale ↗ */}
                <rect x="20" y="68" width="260" height="44" rx="8"
                  fill="#f59e0b"
                  transform="rotate(32 150 90)"
                  style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))' }}
                />
                {/* Reflet haut sur barre ↘ */}
                <rect x="20" y="68" width="260" height="14" rx="7"
                  fill="rgba(255,255,255,0.22)"
                  transform="rotate(-32 150 90)"
                />
                {/* Trait rouge central sur barre ↘ (simuler la ceinture rouge) */}
                <rect x="20" y="87" width="260" height="6" rx="3"
                  fill="#dc2626"
                  opacity="0.65"
                  transform="rotate(-32 150 90)"
                />
              </svg>
            )}

            {/* Photo du maître positionnée en bas-centre */}
            {passageMasterImg && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 3,
                }}
              >
                <img
                  src={passageMasterImg}
                  alt="Maître"
                  crossOrigin="anonymous"
                  style={{
                    maxHeight: '200px',
                    maxWidth: '160px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.85))',
                  }}
                />
              </div>
            )}
          </div>

          {/* ── LIEU & HEURE ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              margin: '8px 20px 0',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.93)',
            }}
          >
            {/* Lieu */}
            <div
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRight: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <span style={{ fontSize: '22px', lineHeight: 1 }}>📍</span>
              <span
                style={{
                  color: '#0a1a3a',
                  fontFamily: "'Arial Black', 'Arial', sans-serif",
                  fontWeight: 900,
                  fontSize: '18px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {form.passageLocation || 'UGB'}
              </span>
            </div>
            {/* Heure */}
            <div
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '22px', lineHeight: 1 }}>⏰</span>
              <div>
                <div style={{ color: '#64748b', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  À PARTIR DE
                </div>
                <div
                  style={{
                    color: '#0a1a3a',
                    fontFamily: "'Arial Black', 'Arial', sans-serif",
                    fontWeight: 900,
                    fontSize: '16px',
                    letterSpacing: '1px',
                  }}
                >
                  {form.passageTime || '08H00'}
                </div>
              </div>
            </div>
          </div>

          {/* ── DATE ── */}
          <div style={{ textAlign: 'center', padding: '14px 20px 16px' }}>
            <div
              style={{
                color: '#dc2626',
                fontFamily: "'Arial Black', 'Arial', sans-serif",
                fontWeight: 900,
                fontSize: '28px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                textShadow: '0 2px 10px rgba(0,0,0,0.7)',
              }}
            >
              {form.passageDate || 'SAMEDI 17 JANVIER 2026'}
            </div>
          </div>

        </div>{/* fin contenu relatif */}
      </div>{/* fin zone principale */}

      {/* ══════════════════════════════════════════════
          FOOTER  (fond bleu marine, contacts)
      ══════════════════════════════════════════════ */}
      <div
        style={{
          background: '#1e3a5f',
          borderTop: '3px solid #dc2626',
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'space-between',
          minHeight: '42px',
        }}
      >
        <div
          style={{
            color: '#e2e8f0',
            fontSize: '11px',
            fontWeight: 600,
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ fontSize: '14px' }}>📞</span>
          {form.passagePhone || '+221 77 000 00 00'}
        </div>
        <div
          style={{
            background: '#dc2626',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 600,
            padding: '4px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ fontSize: '13px' }}>✉️</span>
          {form.passageEmail || 'vovinam.ugb.sc@gmail.com'}
        </div>
      </div>
    </>
  );
}
