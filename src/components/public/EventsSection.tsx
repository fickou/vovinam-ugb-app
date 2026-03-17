import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';

interface Event {
    id: number;
    title: string;
    date: string;
    time: string;
    location: string;
    type: 'competition' | 'training' | 'cérémonie' | 'stage';
    description: string;
}

const EVENTS: Event[] = [
    {
        id: 1,
        title: 'Tournoi Inter-universitaire',
        date: '15 Avril 2026',
        time: '09h00',
        location: 'Salle Polyvalente UGB',
        type: 'competition',
        description: 'Compétition interne ouverte à tous les pratiquants du campus avec classement par grade.',
    },
    {
        id: 2,
        title: 'Stage de perfectionnement',
        date: '22 Avril 2026',
        time: '14h00',
        location: 'DOJO UGB',
        type: 'stage',
        description: 'Stage animé par nos ceintures noires sur les techniques de combat rapproché.',
    },
    {
        id: 3,
        title: 'Journée portes ouvertes',
        date: '3 Mai 2026',
        time: '10h00',
        location: 'Esplanade UGB',
        type: 'cérémonie',
        description: 'Venez découvrir le Vovinam ! Démonstrations, initiations gratuites pour tous.',
    },
    {
        id: 4,
        title: 'Entraînement hebdomadaire',
        date: 'Tous les Mardis & Jeudis',
        time: '17h00 – 19h00',
        location: 'DOJO UGB',
        type: 'training',
        description: 'Séances régulières ouvertes à tous les niveaux. Première séance d\'essai gratuite.',
    },
];

const typeColors: Record<string, { bg: string; text: string; dot: string }> = {
    competition: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    training: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    cérémonie: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    stage: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

const typeLabels: Record<string, string> = {
    competition: 'Compétition',
    training: 'Entraînement',
    cérémonie: 'Événement',
    stage: 'Stage',
};

export default function EventsSection() {
    return (
        <section id="events" className="py-24 sm:py-32 bg-[hsl(220,30%,97%)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[hsl(220,60%,18%)] via-[hsl(0,80%,45%)] to-[hsl(45,90%,55%)]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <p className="text-[hsl(0,80%,45%)] font-display font-bold uppercase tracking-widest text-sm mb-3">
                        Agenda
                    </p>
                    <h2 className="font-display text-4xl sm:text-5xl font-black text-[hsl(220,60%,18%)] uppercase tracking-tight">
                        Événements & Activités
                    </h2>
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <div className="h-px w-16 bg-[hsl(0,80%,45%)]" />
                        <div className="h-2 w-2 rounded-full bg-[hsl(45,90%,55%)]" />
                        <div className="h-px w-16 bg-[hsl(0,80%,45%)]" />
                    </div>
                </div>

                {/* Events grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {EVENTS.map((event) => {
                        const colors = typeColors[event.type];
                        return (
                            <div
                                key={event.id}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
                            >
                                {/* Color bar */}
                                <div className={`h-1.5 w-full ${colors.dot}`} />

                                <div className="p-6">
                                    {/* Badge + title */}
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text} mb-3`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                                                {typeLabels[event.type]}
                                            </span>
                                            <h3 className="font-display font-bold text-xl text-[hsl(220,60%,18%)] uppercase leading-tight group-hover:text-[hsl(0,80%,45%)] transition-colors">
                                                {event.title}
                                            </h3>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-[hsl(0,80%,45%)] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                                    </div>

                                    {/* Meta */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                            <Calendar className="h-4 w-4 text-[hsl(220,60%,18%)]" />
                                            <span className="font-medium">{event.date}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                            <Clock className="h-4 w-4 text-[hsl(220,60%,18%)]" />
                                            <span>{event.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                            <MapPin className="h-4 w-4 text-[hsl(220,60%,18%)]" />
                                            <span>{event.location}</span>
                                        </div>
                                    </div>

                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        {event.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
