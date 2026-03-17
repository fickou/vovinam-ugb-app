// ============================================================
// Sources vérifiées :
// - vovinam.fr (Fédération Française de Vovinam Viet Vo Dao)
// - vovinamworldfederation.eu (Fédération Mondiale)
// - vovinam-rosny.fr, vovinam-bures.com, vietvodao-bordeaux.com
// - vovinam-geneve.ch, vovinampontault.fr, vovinam-vietvodao.com
//
// Les 10 principes ont été créés en 1964.
// Devise officielle : « Être fort pour être utile »
// Salut : « Main d'acier sur cœur de bonté » (Chí cương — Tâm từ bi)
// ============================================================

const PRINCIPLES = [
    {
        num: '01',
        title: 'Servir l\'humanité',
        text: 'Atteindre le plus haut niveau de l\'art martial pour servir la nation et l\'humanité.',
    },
    {
        num: '02',
        title: 'Fidélité à l\'idéal',
        text: 'Être fidèle à l\'idéal du Vovinam Viet Vo Dao, dévoué à sa cause et former une nouvelle génération de jeunes pratiquants engagés.',
    },
    {
        num: '03',
        title: 'Unité & Respect',
        text: 'Être toujours uni, respecter les maîtres et les aînés, et aimer sincèrement ses condisciples comme des frères et sœurs.',
    },
    {
        num: '04',
        title: 'Discipline & Honneur',
        text: 'Respecter rigoureusement la discipline du Vovinam et placer l\'honneur personnnel et collectif au-dessus de tout.',
    },
    {
        num: '05',
        title: 'Respect des autres arts',
        text: 'Respecter les autres disciplines martiales et n\'utiliser le Vovinam Viet Vo Dao qu\'en cas de légitime défense et pour une juste cause.',
    },
    {
        num: '06',
        title: 'Cultiver le savoir',
        text: 'Cultiver la connaissance, forger l\'esprit et progresser sur la voie de l\'homme vrai — entier, juste et utile.',
    },
    {
        num: '07',
        title: 'Justice & Noblesse',
        text: 'Vivre avec justice, simplicité, loyauté et noblesse d\'esprit dans chaque acte de la vie quotidienne.',
    },
    {
        num: '08',
        title: 'Volonté d\'acier',
        text: 'Développer une volonté de fer, persévérer et vaincre toutes les difficultés qui se dressent sur la voie.',
    },
    {
        num: '09',
        title: 'Lucidité & Persévérance',
        text: 'Être lucide dans ses décisions, persévérant et actif dans ses actes — agir avec discernement et résolution.',
    },
    {
        num: '10',
        title: 'Maîtrise de soi',
        text: 'Avoir confiance en soi, être maître de soi, modeste, tolérant, respectueux et se remettre constamment en question afin de progresser.',
    },
];

const SYMBOLS = [
    {
        title: 'Devise officielle',
        value: '« Être fort pour être utile »',
        sub: 'Mạnh để phục vụ — Le fondement de toute la philosophie Vovinam.',
        color: '#e5a800',
    },
    {
        title: 'Salut emblématique',
        value: '« Main d\'acier sur cœur de bonté »',
        sub: 'Chí cương · Tâm từ bi — La force au service de la compassion.',
        color: '#c0392b',
    },
    {
        title: 'Philosophie centrale',
        value: 'Cách Mạng Tâm Thân',
        sub: '« Révolution du corps et de l\'esprit » — développement holistique de l\'individu.',
        color: '#27ae60',
    },
    {
        title: 'Symbole du bambou',
        value: '« Plier sans se rompre »',
        sub: 'Le bambou incarne la droiture, la souplesse, la constance et le désintéressement.',
        color: '#2980b9',
    },
];

export default function PhilosophySection() {
    return (
        <section id="philosophy" className="py-28 sm:py-36 bg-[#060b18] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c0392b]/50 to-transparent" />

            <div className="max-w-7xl mx-auto px-5 sm:px-8">

                {/* Section label */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px w-12 bg-[#e5a800]" />
                    <span className="text-[#e5a800] font-display text-xs font-bold uppercase tracking-[0.3em]">Philosophie officielle · Sources vérifiées</span>
                </div>

                {/* Heading */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 sm:mb-20 items-end">
                    <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase leading-none">
                        Philosophie &<br />
                        <span className="text-[#c0392b]">10 Principes</span>
                    </h2>
                    <div className="space-y-3 text-white/55 text-base leading-relaxed">
                        <p>
                            Le Vovinam Viet Vo Dao se distingue de tous les sports de combat par sa philosophie
                            profondément humaniste : former des <strong className="text-white/80">« hommes vrais »</strong> —
                            des individus justes, clairvoyants et utiles à la société.
                        </p>
                        <p>
                            Les <strong className="text-white/80">10 principes fondamentaux</strong>, rédigés en 1964,
                            régissent la conduite et la vie de chaque pratiquant, du débutant au maître.
                        </p>
                    </div>
                </div>

                {/* Symbols row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                    {SYMBOLS.map(s => (
                        <div key={s.title}
                            className="p-6 rounded-2xl border border-white/8 bg-white/2 hover:border-white/15 transition-all group">
                            <div className="h-1 w-8 rounded-full mb-5 transition-all group-hover:w-14"
                                style={{ backgroundColor: s.color }} />
                            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-2">{s.title}</p>
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
                            Les 10 principes fondamentaux
                        </h3>
                        <div className="h-px flex-1 bg-white/8" />
                        <span className="text-white/30 text-xs font-mono">Créés en 1964</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {PRINCIPLES.map((p) => (
                            <div key={p.num}
                                className="group flex gap-5 p-6 rounded-2xl border border-white/8 bg-white/2 hover:border-[#c0392b]/30 hover:bg-[#c0392b]/4 transition-all duration-300">
                                {/* Number */}
                                <div className="flex-shrink-0">
                                    <div className="font-display text-[#c0392b]/40 font-black text-2xl leading-none group-hover:text-[#c0392b]/70 transition-colors">
                                        {p.num}
                                    </div>
                                </div>
                                {/* Content */}
                                <div>
                                    <h4 className="font-display font-bold text-white uppercase text-sm mb-2 group-hover:text-[#e5a800] transition-colors">
                                        {p.title}
                                    </h4>
                                    <p className="text-white/50 text-sm leading-relaxed">{p.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Official salute explanation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Quote */}
                    <div className="relative rounded-2xl overflow-hidden p-8 sm:p-10 border border-white/8"
                        style={{ background: 'linear-gradient(135deg, rgba(192,57,43,0.08) 0%, rgba(6,11,24,0.6) 100%)' }}>
                        <div className="absolute top-4 left-6 font-display text-[6rem] leading-none text-[#c0392b]/8 font-black select-none">"</div>
                        <div className="relative z-10">
                            <p className="text-[#e5a800] text-xs font-bold uppercase tracking-widest mb-5">Devise officielle</p>
                            <blockquote>
                                <p className="font-display text-white text-2xl sm:text-3xl font-black uppercase leading-tight mb-3">
                                    Être fort<br />pour être utile
                                </p>
                                <p className="text-white/40 text-sm font-light italic">
                                    — Mạnh để phục vụ<br />
                                    Maître Nguyễn Lộc · Fondateur du Vovinam (1938)
                                </p>
                            </blockquote>
                        </div>
                    </div>

                    {/* Salute explanation */}
                    <div className="p-8 sm:p-10 rounded-2xl border border-white/8 bg-white/2">
                        <p className="text-[#e5a800] text-xs font-bold uppercase tracking-widest mb-5">Le salut Vovinam</p>
                        <div className="flex items-start gap-5 mb-6">
                            {/* Stylized salute icon */}
                            <div className="flex-shrink-0 h-16 w-16 rounded-xl border border-[#c0392b]/30 bg-[#c0392b]/10 flex items-center justify-center">
                                <div className="flex gap-1.5">
                                    <div className="h-8 w-1.5 rounded-full bg-[#c0392b]" /> {/* Steel */}
                                    <div className="h-8 w-1.5 rounded-full bg-[#2980b9]" /> {/* Heart */}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-display font-bold text-white uppercase text-base mb-2">
                                    Main d'acier sur cœur de bonté
                                </h4>
                                <p className="text-white/40 text-xs font-light italic">Chí cương · Tâm từ bi</p>
                            </div>
                        </div>
                        <p className="text-white/55 text-sm leading-relaxed mb-5">
                            Le pratiquant pose sa main droite fermée (force, acier) sur son cœur ouvert (bonté, compassion).
                            Ce salut fondateur exprime l'alliance indissociable de la <strong className="text-white/80">puissance martiale</strong> et de la <strong className="text-white/80">bienveillance humaine</strong>.
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
                    <p className="text-white/25 text-xs leading-relaxed">
                        Sources : Fédération Française de Vovinam Viet Vo Dao (vovinam.fr) · Fédération Mondiale de Vovinam
                        (vovinamworldfederation.eu) · Clubs affiliés français (vovinam-rosny.fr, vietvodao-bordeaux.com,
                        vovinam-bures.com). Les 10 principes ont été rédigés en 1964 sous l'impulsion de la direction du mouvement.
                    </p>
                </div>
            </div>
        </section>
    );
}
