import { useState, useEffect } from 'react';
import ugbBuilding from '@/assets/ugb-building.png';
import { cmsApi } from '@/lib/cms';
import { AboutContent } from '@/types/cms';

const fallbackAbout: AboutContent = {
    label: 'Notre club',
    titleLine1: 'Vovinam UGB',
    titleLine2: 'Sporting Club',
    description: 'Fondée au sein de l\'Université Gaston Berger de Saint-Louis du Sénégal, notre section porte la tradition millénaire du combat vietnamien dans un cadre académique d\'excellence. Nous formons des pratiquants complets : athlètes, étudiants et citoyens.',
    imageCaptionTitle: 'Université Gaston Berger',
    imageCaptionSub: 'Saint-Louis · Sénégal',
    stats: [
        { label: 'Art martial', value: 'Vovinam Viet Vo Dao', sub: 'Arts martiaux vietnamiens — fondé 1938' },
        { label: 'Université', value: 'UGB Saint-Louis', sub: 'Université Gaston Berger — 1990' },
        { label: 'Public', value: 'Tous niveaux', sub: 'Étudiants, débutants et confirmés' },
        { label: 'Cotisation', value: 'Accessible', sub: '1ère séance d\'essai offerte' },
    ],
    pillars: [
        { num: '01', title: 'L\'Homme Révolutionnaire', body: 'Le premier principe du Vovinam : former des individus capables non seulement de se défendre mais de transformer positivement la société. La révolution intérieure précède la révolution du monde.' },
        { num: '02', title: 'Corps et Âme Ensemble', body: 'Contrairement à de nombreux arts martiaux, le Vovinam considère que la force physique sans la culture de l\'âme est incomplète. Chaque technique porte une leçon morale.' },
        { num: '03', title: 'Le Métal forjé par le Feu', body: 'L\'entraînement rigoureux est la voie de la transformation. La douleur de l\'effort forge le caractère comme le feu durcit l\'acier — c\'est la promesse faite à chaque pratiquant.' },
    ]
};

export default function AboutSection() {
    const [data, setData] = useState<AboutContent>(fallbackAbout);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const settings = await cmsApi.getSettings('about');
                if (settings) setData(settings);
            } catch (err) {
                console.error("Erreur chargement contenu about", err);
            }
        };
        fetchContent();
    }, []);

    return (
        <section id="about" className="py-28 sm:py-36 bg-[#0B1120] relative overflow-hidden">
            {/* Soft atmospheric glow */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-3xl pointer-events-none mix-blend-screen" />

            {/* Subtle side accent */}
            <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#c0392b]/20 to-transparent" />

            <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">

                {/* Section label */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px w-12 bg-[#c0392b]" />
                    <span className="text-[#c0392b] font-display text-xs font-bold uppercase tracking-[0.3em]">{data.label}</span>
                </div>

                {/* Title block */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16 items-end">
                    <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-none">
                        {data.titleLine1}<br />
                        <span className="text-[#e5a800]">{data.titleLine2}</span>
                    </h2>
                    <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-xl whitespace-pre-line">
                        {data.description}
                    </p>
                </div>

                {/* Image + details */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-20">
                    {/* Image */}
                    <div className="lg:col-span-3 relative group rounded-2xl overflow-hidden border border-white/10">
                        <img
                            src={data.imageUrl || ugbBuilding}
                            alt="Campus Université Gaston Berger Saint-Louis"
                            className="w-full h-64 sm:h-96 lg:h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0"
                            style={{ background: 'linear-gradient(to right, rgba(11,17,32,0.95) 0%, rgba(11,17,32,0.2) 60%, transparent 100%)' }} />
                        <div className="absolute bottom-0 left-0 p-8">
                            <p className="text-[#e5a800] text-xs font-bold uppercase tracking-widest mb-1">Siège du club</p>
                            <h3 className="font-display text-white text-2xl font-black uppercase">
                                {data.imageCaptionTitle}
                            </h3>
                            <p className="text-white/60 text-sm mt-1">{data.imageCaptionSub}</p>
                        </div>
                    </div>

                    {/* Info cards (Stats) */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        {data.stats.map((c, i) => (
                            <div key={i}
                                className="p-5 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md shadow-xl shadow-black/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300">
                                <p className="text-[#c0392b] text-[10px] uppercase tracking-widest font-bold mb-1">{c.label}</p>
                                <p className="text-white font-display font-bold text-base sm:text-lg">{c.value}</p>
                                <p className="text-white/40 text-xs mt-0.5">{c.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {data.pillars.map((p, i) => (
                        <div key={i}
                            className="group relative p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/20 hover:border-white/15 hover:bg-white/10 hover:-translate-y-1 transition-all duration-400">
                            <div className="font-display text-[5rem] font-black text-white/5 leading-none absolute top-4 right-6 select-none group-hover:text-[#c0392b]/15 transition-colors">{p.num}</div>
                            <h3 className="font-display font-bold text-white uppercase text-lg mb-4 leading-tight">{p.title}</h3>
                            <p className="text-white/50 text-sm leading-relaxed whitespace-pre-line">{p.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
