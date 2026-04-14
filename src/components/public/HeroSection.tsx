import { useState, useEffect } from 'react';
import logo from '@/assets/logo.png';
import vovinamLogo from '@/assets/logo-vovinam.png';
import { cmsApi } from '@/lib/cms';
import { HeroContent } from '@/types/cms';

const fallbackContent: HeroContent = {
    titleLine1: 'VOVINAM',
    titleLine2: 'VIET VO DAO',
    subtitle: 'Fondé en 1938 par Maître Nguyễn Lộc, le Vovinam est un art martial humaniste qui forge le corps, l\'esprit et le caractère. Rejoignez notre section à l\'Université Gaston Berger de Saint-Louis.',
    ctaPrimaryText: 'Voir les entraînements',
    ctaSecondaryText: 'Découvrir le Vovinam',
};

export default function HeroSection() {
    const [data, setData] = useState<HeroContent>(fallbackContent);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const settings = await cmsApi.getSettings('hero');
                if (settings) {
                    setData(settings);
                }
            } catch (err) {
                console.error("Erreur chargement contenu hero", err);
            }
        };
        fetchContent();
    }, []);

    return (
        <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0f172a]">

            {/* === Layered background === */}
            {data.backgroundImageUrl ? (
                <div className="absolute inset-0">
                    <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
                        style={{ backgroundImage: `url(${data.backgroundImageUrl})` }}
                    />
                    <div className="absolute inset-0 bg-[#0f172a]/70 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f172a]" />
                </div>
            ) : null}

            {/* Radial glow — center */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0"
                    style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(192,57,43,0.08) 0%, transparent 70%)' }} />
                {/* Top-left atmospheric light */}
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30 mix-blend-screen blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4), transparent 70%)' }} />
                {/* Diagonal stripe pattern */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, white 0px, white 1px, transparent 0px, transparent 50%)',
                        backgroundSize: '24px 24px',
                    }} />
                {/* Bottom vignette */}
                <div className="absolute bottom-0 left-0 right-0 h-48"
                    style={{ background: 'linear-gradient(to top, #0f172a, transparent)' }} />
            </div>

            {/* === Vietnamese / geometric accent bars === */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#c0392b] to-transparent opacity-60" />
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#e5a800] to-transparent opacity-40" />

            {/* === Main content === */}
            <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-24 pb-16 flex flex-col items-center text-center">

                {/* Logos */}
                <div className="flex items-center gap-8 sm:gap-16 mb-12">
                    {[
                        { src: logo, alt: 'Logo Club UGB', label: 'UGB SC' },
                        { src: vovinamLogo, alt: 'Logo Vovinam Viet Vo Dao', label: 'VVD' },
                    ].map((lg, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div className="relative group">
                                <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-[#c0392b]/30 to-[#e5a800]/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative h-20 w-20 sm:h-28 sm:w-28 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm hover:border-white/25 transition-all duration-500">
                                    <img src={lg.src} alt={lg.alt} className="h-full w-full object-contain" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Eyebrow */}
                <p className="mb-6 inline-flex items-center gap-3 text-[#e5a800] font-display text-xs sm:text-sm font-bold tracking-[0.3em] uppercase">
                    <span className="inline-block h-px w-8 bg-[#e5a800]" />
                    Art Martial Vietnamien · Section UGB · Saint-Louis
                    <span className="inline-block h-px w-8 bg-[#e5a800]" />
                </p>

                {/* Main title */}
                <h1 className="font-display text-[clamp(3.5rem,12vw,9rem)] font-black tracking-[-0.02em] leading-[0.9] text-white uppercase mb-8">
                    {data.titleLine1}<br />
                    <span className="relative inline-block">
                        <span
                            className="text-transparent"
                            style={{ WebkitTextStroke: '2px #c0392b' }}>
                            {data.titleLine2}
                        </span>
                    </span>
                </h1>

                {/* Sub-tagline */}
                <p className="max-w-2xl text-white/55 text-base sm:text-xl leading-relaxed mb-10 font-light whitespace-pre-line">
                    {data.subtitle}
                </p>

                {/* Stats row - Glassmorphism */}
                <div className="flex flex-wrap justify-center gap-px mb-14 rounded-3xl overflow-hidden border border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/20">
                    {[
                        { n: '1938', sub: 'Fondation mondiale' },
                        { n: '2020', sub: 'Fondation UGB' },
                        { n: '3×/sem', sub: 'Entraînements' },
                        { n: '100%', sub: 'Gratuit en essai' },
                    ].map((s, i) => (
                        <div key={i} className="flex-1 min-w-[calc(50%-1px)] sm:min-w-0 px-6 py-5 border-r border-b border-white/10 last:border-r-0 text-center">
                            <div className="font-display text-2xl sm:text-3xl font-black text-[#e5a800]">{s.n}</div>
                            <div className="text-white/40 text-xs mt-1 uppercase tracking-widest">{s.sub}</div>
                        </div>
                    ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-5">
                    <button
                        onClick={() => document.querySelector('#schedule')?.scrollIntoView({ behavior: 'smooth' })}
                        className="group flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-[#c0392b] to-[#e63946] hover:from-[#a93226] hover:to-[#c0392b] text-white font-display font-medium text-base tracking-wider transition-all duration-300 shadow-xl shadow-red-900/30 hover:shadow-red-900/50 hover:-translate-y-1">
                        {data.ctaPrimaryText}
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                    <button
                        onClick={() => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-10 py-4 rounded-full border border-white/10 hover:border-white/30 text-white/80 hover:text-white font-display font-medium text-base tracking-wider transition-all duration-300 hover:bg-white/5 hover:-translate-y-1 shadow-lg shadow-black/10">
                        {data.ctaSecondaryText}
                    </button>
                </div>
            </div>

            {/* Scroll hint */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
                <span className="text-[10px] uppercase tracking-[0.25em]">Défiler</span>
                <div className="h-10 w-px bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
            </div>
        </section>
    );
}
