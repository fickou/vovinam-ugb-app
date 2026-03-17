import { Clock, MapPin, CheckCircle2 } from 'lucide-react';

const SESSIONS = [
    {
        day: 'Lundi',
        dayFr: 'LUN',
        time: '18h00 – 20h00',
        location: 'DOJO',
        type: 'Technique & Conditionnement',
        focus: 'Techniques de base (Quyền), conditionnement physique, travail des frappes.',
    },
    {
        day: 'Mercredi',
        dayFr: 'MER',
        time: '18h00 – 20h00',
        location: 'DOJO',
        type: 'Combat & Projections',
        focus: 'Travail en binôme (Đối luyện), projections, techniques de chute, combat libre supervisé.',
    },
    {
        day: 'Vendredi',
        dayFr: 'VEN',
        time: '18h00 – 20h00',
        location: 'DOJO',
        type: 'Formes & Perfectionnement',
        focus: 'Enchaînements codifiés (Quyền tổng hợp), révisions des grades, préparation compétitions.',
    },
];

const SESSION_STRUCTURE = [
    { phase: '18h00 – 18h15', desc: 'Échauffement et étirements dynamiques' },
    { phase: '18h15 – 19h15', desc: 'Travail technique principal de la séance' },
    { phase: '19h15 – 19h45', desc: 'Pratique en partenaire ou formes libres' },
    { phase: '19h45 – 20h00', desc: 'Retour au calme, méditation et bilan' },
];

const BENEFITS = [
    'Renforcement musculaire complet',
    'Souplesse et mobilité articulaire',
    'Coordination et équilibre',
    'Self-défense efficace',
    'Discipline et gestion du stress',
    'Esprit d\'équipe et fraternité',
];

export default function ScheduleSection() {
    return (
        <section id="schedule" className="py-28 sm:py-36 bg-[#07101f] relative overflow-hidden">
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e5a800]/40 to-transparent" />

            <div className="max-w-7xl mx-auto px-5 sm:px-8">

                {/* Section label */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px w-12 bg-[#c0392b]" />
                    <span className="text-[#c0392b] font-display text-xs font-bold uppercase tracking-[0.3em]">Rejoindre le club</span>
                </div>

                {/* Heading */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16 items-end">
                    <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase leading-none">
                        Entraînements<br />
                        <span className="text-[#e5a800]">Hebdomadaires</span>
                    </h2>
                    <p className="text-white/50 text-base leading-relaxed">
                        Trois séances par semaine pour une progression régulière et structurée.
                        Chaque séance est encadrée par nos ceintures noires et adaptée à tous les niveaux.
                        <span className="block mt-2 text-[#27ae60] font-semibold">Première séance d'essai gratuite et sans engagement.</span>
                    </p>
                </div>

                {/* Sessions timeline */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
                    {SESSIONS.map((s, i) => (
                        <div key={i}
                            className="group relative rounded-2xl border border-white/10 bg-white/3 hover:border-[#c0392b]/40 hover:bg-[#c0392b]/5 transition-all duration-300 overflow-hidden">
                            {/* Day badge */}
                            <div className="absolute top-4 right-4 font-display text-[3rem] font-black text-white/5 select-none leading-none group-hover:text-[#c0392b]/15 transition-colors">
                                {s.dayFr}
                            </div>
                            <div className="p-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c0392b]/15 border border-[#c0392b]/20 mb-6">
                                    <div className="h-2 w-2 rounded-full bg-[#c0392b] animate-pulse" />
                                    <span className="text-[#c0392b] font-display font-bold text-xs uppercase tracking-wider">{s.day}</span>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-4 w-4 text-[#e5a800] flex-shrink-0" />
                                        <span className="text-white font-display font-bold text-lg">{s.time}</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-4 w-4 text-white/40 flex-shrink-0 mt-0.5" />
                                        <span className="text-white/60 text-sm">{s.location}</span>
                                    </div>
                                </div>

                                <div className="border-t border-white/8 pt-5">
                                    <p className="text-[#e5a800] text-xs font-bold uppercase tracking-widest mb-2">{s.type}</p>
                                    <p className="text-white/50 text-sm leading-relaxed">{s.focus}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2-col: Structure + Benefits */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Session structure */}
                    <div className="rounded-2xl border border-white/10 bg-white/2 overflow-hidden">
                        <div className="px-8 py-5 border-b border-white/8 bg-white/3">
                            <h3 className="font-display font-black text-white uppercase text-lg">Structure d'une séance</h3>
                        </div>
                        <div className="divide-y divide-white/6">
                            {SESSION_STRUCTURE.map((item, i) => (
                                <div key={i} className="flex gap-6 px-8 py-5">
                                    <div className="shrink-0">
                                        <span className="font-display font-bold text-[#e5a800] text-sm">{item.phase}</span>
                                    </div>
                                    <p className="text-white/60 text-sm leading-relaxed self-center">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="rounded-2xl border border-white/10 bg-white/2 overflow-hidden">
                        <div className="px-8 py-5 border-b border-white/8 bg-white/3">
                            <h3 className="font-display font-black text-white uppercase text-lg">Bénéfices de la pratique</h3>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {BENEFITS.map((b, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="h-4 w-4 text-[#27ae60] flex-shrink-0" />
                                        <span className="text-white/70 text-sm">{b}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Big CTA */}
                            <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-[#c0392b]/20 to-[#c0392b]/5 border border-[#c0392b]/20 text-center">
                                <p className="text-white/80 text-sm mb-1">Vous souhaitez nous rejoindre ?</p>
                                <p className="text-white font-display font-black uppercase text-xl">
                                    Venez à la prochaine séance !
                                </p>
                                <p className="text-[#e5a800] font-bold text-sm mt-1">Lundi / Mercredi / Vendredi · 18h00</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
