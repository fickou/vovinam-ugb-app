import ugbBuilding from '@/assets/ugb-building.png';

const PILLARS = [
    {
        num: '01',
        title: 'L\'Homme Révolutionnaire',
        body: 'Le premier principe du Vovinam : former des individus capables non seulement de se défendre mais de transformer positivement la société. La révolution intérieure précède la révolution du monde.',
    },
    {
        num: '02',
        title: 'Corps et Âme Ensemble',
        body: 'Contrairement à de nombreux arts martiaux, le Vovinam considère que la force physique sans la culture de l\'âme est incomplète. Chaque technique porte une leçon morale.',
    },
    {
        num: '03',
        title: 'Le Métal forjé par le Feu',
        body: 'L\'entraînement rigoureux est la voie de la transformation. La douleur de l\'effort forge le caractère comme le feu durcit l\'acier — c\'est la promesse faite à chaque pratiquant.',
    },
];

export default function AboutSection() {
    return (
        <section id="about" className="py-28 sm:py-36 bg-[#07101f] relative overflow-hidden">
            {/* Subtle side accent */}
            <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#c0392b]/30 to-transparent" />

            <div className="max-w-7xl mx-auto px-5 sm:px-8">

                {/* Section label */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px w-12 bg-[#c0392b]" />
                    <span className="text-[#c0392b] font-display text-xs font-bold uppercase tracking-[0.3em]">Notre club</span>
                </div>

                {/* Title block */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16 items-end">
                    <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-none">
                        Vovinam UGB<br />
                        <span className="text-[#e5a800]">Sporting Club</span>
                    </h2>
                    <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-xl">
                        Fondée au sein de l'Université Gaston Berger de Saint-Louis du Sénégal,
                        notre section porte la tradition millénaire du combat vietnamien dans un cadre
                        académique d'excellence. Nous formons des pratiquants complets : athlètes,
                        étudiants et citoyens.
                    </p>
                </div>

                {/* Image + details */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-20">
                    {/* Image */}
                    <div className="lg:col-span-3 relative group rounded-2xl overflow-hidden border border-white/10">
                        <img
                            src={ugbBuilding}
                            alt="Campus Université Gaston Berger Saint-Louis"
                            className="w-full h-64 sm:h-96 lg:h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0"
                            style={{ background: 'linear-gradient(to right, rgba(7,16,31,0.7) 0%, rgba(7,16,31,0.1) 60%, transparent 100%)' }} />
                        <div className="absolute bottom-0 left-0 p-8">
                            <p className="text-[#e5a800] text-xs font-bold uppercase tracking-widest mb-1">Siège du club</p>
                            <h3 className="font-display text-white text-2xl font-black uppercase">
                                Université Gaston Berger
                            </h3>
                            <p className="text-white/60 text-sm mt-1">Saint-Louis · Sénégal</p>
                        </div>
                    </div>

                    {/* Info cards */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        {[
                            {
                                label: 'Art martial',
                                value: 'Vovinam Viet Vo Dao',
                                sub: 'Arts martiaux vietnamiens — fondé 1938',
                            },
                            {
                                label: 'Université',
                                value: 'UGB Saint-Louis',
                                sub: 'Université Gaston Berger — 1990',
                            },
                            {
                                label: 'Public',
                                value: 'Tous niveaux',
                                sub: 'Étudiants, débutants et confirmés',
                            },
                            {
                                label: 'Cotisation',
                                value: 'Accessible',
                                sub: '1ère séance d\'essai offerte',
                            },
                        ].map(c => (
                            <div key={c.label}
                                className="p-5 rounded-xl border border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/5 transition-all duration-300">
                                <p className="text-[#c0392b] text-[10px] uppercase tracking-widest font-bold mb-1">{c.label}</p>
                                <p className="text-white font-display font-bold text-base sm:text-lg">{c.value}</p>
                                <p className="text-white/40 text-xs mt-0.5">{c.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PILLARS.map((p) => (
                        <div key={p.num}
                            className="group relative p-8 rounded-2xl border border-white/8 bg-white/2 hover:border-[#c0392b]/40 hover:bg-[#c0392b]/5 transition-all duration-400">
                            <div className="font-display text-[5rem] font-black text-white/4 leading-none absolute top-4 right-6 select-none group-hover:text-[#c0392b]/10 transition-colors">{p.num}</div>
                            <h3 className="font-display font-bold text-white uppercase text-lg mb-4 leading-tight">{p.title}</h3>
                            <p className="text-white/50 text-sm leading-relaxed">{p.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
