import { useState, useEffect } from 'react';
import { cmsApi } from '@/lib/cms';
import { PhilosophyContent } from '@/types/cms';

const fallbackPhilosophy: PhilosophyContent = {
    label: 'Philosophie officielle · Sources vérifiées',
    titleLine1: 'Philosophie &',
    titleLine2: '10 Principes',
    description: [
        'Le Vovinam Viet Vo Dao se distingue de tous les sports de combat par sa philosophie profondément humaniste : former des **« hommes vrais »** — des individus justes, clairvoyants et utiles à la société.',
        'Les **10 principes fondamentaux**, rédigés en 1964, régissent la conduite et la vie de chaque pratiquant, du débutant au maître.'
    ],
    symbols: [
        { title: 'Devise officielle', value: '« Être fort pour être utile »', sub: 'Mạnh để phục vụ — Le fondement de toute la philosophie Vovinam.', color: '#e5a800' },
        { title: 'Salut emblématique', value: '« Main d\'acier sur cœur de bonté »', sub: 'Chí cương · Tâm từ bi — La force au service de la compassion.', color: '#c0392b' },
        { title: 'Philosophie centrale', value: 'Cách Mạng Tâm Thân', sub: '« Révolution du corps et de l\'esprit » — développement holistique de l\'individu.', color: '#27ae60' },
        { title: 'Symbole du bambou', value: '« Plier sans se rompre »', sub: 'Le bambou incarne la droiture, la souplesse, la constance et le désintéressement.', color: '#2980b9' },
    ],
    principlesLabel: 'Les 10 principes fondamentaux',
    principles: [
        { num: '01', title: 'Servir l\'humanité', text: 'Atteindre le plus haut niveau de l\'art martial pour servir la nation et l\'humanité.' },
        { num: '02', title: 'Fidélité à l\'idéal', text: 'Être fidèle à l\'idéal du Vovinam Viet Vo Dao, dévoué à sa cause et former une nouvelle génération de jeunes pratiquants engagés.' },
        { num: '03', title: 'Unité & Respect', text: 'Être toujours uni, respecter les maîtres et les aînés, et aimer sincèrement ses condisciples comme des frères et sœurs.' },
        { num: '04', title: 'Discipline & Honneur', text: 'Respecter rigoureusement la discipline du Vovinam et placer l\'honneur personnnel et collectif au-dessus de tout.' },
        { num: '05', title: 'Respect des autres arts', text: 'Respecter les autres disciplines martiales et n\'utiliser le Vovinam Viet Vo Dao qu\'en cas de légitime défense et pour une juste cause.' },
        { num: '06', title: 'Cultiver le savoir', text: 'Cultiver la connaissance, forger l\'esprit et progresser sur la voie de l\'homme vrai — entier, juste et utile.' },
        { num: '07', title: 'Justice & Noblesse', text: 'Vivre avec justice, simplicité, loyauté et noblesse d\'esprit dans chaque acte de la vie quotidienne.' },
        { num: '08', title: 'Volonté d\'acier', text: 'Développer une volonté de fer, persévérer et vaincre toutes les difficultés qui se dressent sur la voie.' },
        { num: '09', title: 'Lucidité & Persévérance', text: 'Être lucide dans ses décisions, persévérant et actif dans ses actes — agir avec discernement et résolution.' },
        { num: '10', title: 'Maîtrise de soi', text: 'Avoir confiance en soi, être maître de soi, modeste, tolérant, respectueux et se remettre constamment en question afin de progresser.' },
    ],
    saluteQuoteLine1: 'Être fort',
    saluteQuoteLine2: 'pour être utile',
    saluteQuoteAuthor: '— Mạnh để phục vụ\nMaître Nguyễn Lộc · Fondateur du Vovinam (1938)',
    saluteExplanationTitle: 'Main d\'acier sur cœur de bonté',
    saluteExplanationSub: 'Chí cương · Tâm từ bi',
    saluteExplanationText: 'Le pratiquant pose sa main droite fermée (force, acier) sur son cœur ouvert (bonté, compassion). Ce salut fondateur exprime l\'alliance indissociable de la puissance martiale et de la bienveillance humaine.',
    sourcesText: 'Sources : Fédération Française de Vovinam Viet Vo Dao (vovinam.fr) · Fédération Mondiale de Vovinam (vovinamworldfederation.eu) · Clubs affiliés français (vovinam-rosny.fr, vietvodao-bordeaux.com, vovinam-bures.com). Les 10 principes ont été rédigés en 1964 sous l\'impulsion de la direction du mouvement.'
};

export default function PhilosophySection() {
    const [data, setData] = useState<PhilosophyContent>(fallbackPhilosophy);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const settings = await cmsApi.getSettings('philosophy');
                if (settings) setData(settings);
            } catch (err) {
                console.error("Erreur chargement contenu philosophy", err);
            }
        };
        fetchContent();
    }, []);

    return (
        <section id="philosophy" className="py-28 sm:py-36 bg-[#0E1524] relative overflow-hidden">
            {/* Ligne très fine en top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Soft atmospheric glow */}
            <div className="absolute -left-[400px] top-40 w-[800px] h-[800px] bg-red-900/10 rounded-full blur-3xl pointer-events-none mix-blend-screen" />

            <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">

                {/* Section label */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px w-12 bg-[#e5a800]" />
                    <span className="text-[#e5a800] font-display text-xs font-bold uppercase tracking-[0.3em]">{data.label}</span>
                </div>

                {/* Heading */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 sm:mb-20 items-end">
                    <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase leading-none">
                        {data.titleLine1}<br />
                        <span className="text-[#c0392b]">{data.titleLine2}</span>
                    </h2>
                    <div className="space-y-3 text-white/55 text-base leading-relaxed">
                        {data.description.map((paragraph, i) => {
                            // Convertir les **texte** en balises <strong className="text-white/80">
                            const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                            return (
                                <p key={i}>
                                    {parts.map((part, idx) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                            return <strong key={idx} className="text-white/80">{part.slice(2, -2)}</strong>;
                                        }
                                        return part;
                                    })}
                                </p>
                            );
                        })}
                    </div>
                </div>

                {/* Symbols row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {data.symbols.map(s => (
                        <div key={s.title}
                            className="p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md shadow-2xl shadow-black/10 hover:border-white/20 hover:bg-white/10 hover:-translate-y-1 transition-all group">
                            <div className="h-1.5 w-10 rounded-full mb-6 transition-all group-hover:w-16"
                                style={{ backgroundColor: s.color }} />
                            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-3">{s.title}</p>
                            <p className="text-white font-display font-bold text-sm leading-snug mb-3" style={{ color: s.color }}>
                                {s.value}
                            </p>
                            <p className="text-white/40 text-xs leading-relaxed">{s.sub}</p>
                        </div>
                    ))}
                </div>

                {/* 10 Principles */}
                <div className="mb-16">
                    <div className="flex items-center gap-4 mb-8">
                        <h3 className="font-display font-black text-white uppercase text-xl sm:text-2xl">
                            {data.principlesLabel}
                        </h3>
                        <div className="h-px flex-1 bg-white/8" />
                        <span className="text-white/30 text-xs font-mono">1964</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.principles.map((p, i) => (
                            <div key={i} className="group perspective-1000 h-[180px] sm:h-[150px]">
                                <div className="relative w-full h-full transition-all duration-500 preserve-3d group-hover:rotate-y-180">
                                    {/* Recto (Front) */}
                                    <div className="absolute inset-0 backface-hidden flex items-center gap-6 p-7 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md transition-all group-hover:border-white/10">
                                        {/* Number */}
                                        <div className="flex-shrink-0">
                                            <div className="font-display text-[#c0392b]/40 font-black text-3xl leading-none group-hover:text-[#c0392b] transition-colors">
                                                {p.num}
                                            </div>
                                        </div>
                                        {/* Title */}
                                        <div>
                                            <h4 className="font-display font-bold text-white uppercase text-sm sm:text-base mb-1 group-hover:text-[#e5a800] transition-colors">
                                                {p.title}
                                            </h4>
                                            <p className="text-white/20 text-[10px] uppercase tracking-widest font-bold">Survolez pour voir le détail</p>
                                        </div>
                                    </div>

                                    {/* Verso (Back) */}
                                    <div className="absolute inset-0 backface-hidden rotate-y-180 flex items-center p-7 rounded-3xl border border-[#c0392b]/30 bg-white/10 backdrop-blur-xl shadow-2xl shadow-[#c0392b]/10">
                                        <p className="text-white/80 text-sm leading-relaxed italic font-light">
                                            {p.text}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Official salute explanation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {/* Quote */}
                    <div className="relative rounded-3xl overflow-hidden p-10 sm:p-12 border border-white/10 shadow-2xl shadow-black/30"
                        style={{ background: 'linear-gradient(135deg, rgba(30,58,138,0.2) 0%, rgba(15,23,42,0.95) 100%)' }}>
                        <div className="absolute top-4 left-6 font-display text-[8rem] leading-none text-white/5 font-black select-none">"</div>
                        <div className="relative z-10">
                            <p className="text-[#e5a800] text-xs font-bold uppercase tracking-widest mb-6">Devise officielle</p>
                            <blockquote>
                                <p className="font-display text-white text-2xl sm:text-3xl font-black uppercase leading-tight mb-3">
                                    {data.saluteQuoteLine1}<br />{data.saluteQuoteLine2}
                                </p>
                                <p className="text-white/40 text-sm font-light italic whitespace-pre-line">
                                    {data.saluteQuoteAuthor}
                                </p>
                            </blockquote>
                        </div>
                    </div>

                    {/* Salute explanation */}
                    <div className="p-10 sm:p-12 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl">
                        <p className="text-[#e5a800] text-xs font-bold uppercase tracking-widest mb-6">Le salut Vovinam</p>
                        <div className="flex items-start gap-6 mb-8">
                            {/* Stylized salute icon */}
                            <div className="flex-shrink-0 h-16 w-16 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center backdrop-blur-sm shadow-inner">
                                <div className="flex gap-1.5">
                                    <div className="h-8 w-1.5 rounded-full bg-[#c0392b]" /> {/* Steel */}
                                    <div className="h-8 w-1.5 rounded-full bg-[#2980b9]" /> {/* Heart */}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-display font-bold text-white uppercase text-base mb-2">
                                    {data.saluteExplanationTitle}
                                </h4>
                                <p className="text-white/40 text-xs font-light italic">{data.saluteExplanationSub}</p>
                            </div>
                        </div>
                        <p className="text-white/55 text-sm leading-relaxed mb-5 whitespace-pre-line">
                            {data.saluteExplanationText}
                        </p>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/3 border border-white/8">
                            <div className="h-3 w-3 rounded-sm bg-[#c0392b]" />
                            <span className="text-white/40 text-xs">Rouge = Force | </span>
                            <div className="h-3 w-3 rounded-sm bg-[#2980b9]" />
                            <span className="text-white/40 text-xs">Bleu = Souplesse & Harmonie</span>
                        </div>
                    </div>
                </div>

                {/* Source footnote */}
                <div className="mt-10 pt-6 border-t border-white/6 flex items-start gap-3">
                    <div className="h-1 w-1 rounded-full bg-white/20 mt-2 flex-shrink-0" />
                    <p className="text-white/25 text-xs leading-relaxed whitespace-pre-line">
                        {data.sourcesText}
                    </p>
                </div>
            </div>
        </section>
    );
}
