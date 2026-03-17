import { MapPin, Clock, ArrowUpRight } from 'lucide-react';

const CONTACT_ITEMS = [
    {
        icon: MapPin,
        label: 'Adresse',
        value: 'Université Gaston Berger',
        sub: 'Route de Ngallèle, Saint-Louis, Sénégal',
        color: '#c0392b',
    },
    {
        icon: Clock,
        label: 'Entraînements',
        value: 'Lun · Mer · Ven',
        sub: '18h00 – 20h00 · DOJO Universitaire',
        color: '#e5a800',
    },
];

const FAQS = [
    {
        q: 'Faut-il une expérience préalable ?',
        a: 'Non. Le Vovinam accueille les débutants à n\'importe quel âge. La première séance est gratuite et sans obligation.',
    },
    {
        q: 'Quel équipement faut-il apporter ?',
        a: 'Pour commencer, une tenue de sport suffit. L\'uniforme Vovinam (Võ phục) peut être acquis après votre inscription.',
    },
    {
        q: 'Y a-t-il des compétitions ?',
        a: 'Oui. Des tournois inter-universitaires sont organisés régionalement. La participation est encouragée mais non obligatoire.',
    },
    {
        q: 'Quelle est la cotisation ?',
        a: 'La cotisation est adaptée au contexte universitaire. Renseignez-vous directement auprès de nos encadrants lors d\'une séance.',
    },
];

export default function ContactSection() {
    const wa = `https://wa.me/221782829673?text=${encodeURIComponent('Bonjour, je souhaite rejoindre le club Vovinam UGB. Pouvez-vous me donner plus d\'informations ?')}`;

    return (
        <section id="contact" className="py-28 sm:py-36 bg-[#07101f] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c0392b]/40 to-transparent" />

            <div className="max-w-7xl mx-auto px-5 sm:px-8">

                {/* Label */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px w-12 bg-[#c0392b]" />
                    <span className="text-[#c0392b] font-display text-xs font-bold uppercase tracking-[0.3em]">Contact & Infos</span>
                </div>

                {/* Heading */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16 items-end">
                    <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase leading-none">
                        Venez nous<br />
                        <span className="text-[#e5a800]">Rejoindre</span>
                    </h2>
                    <p className="text-white/50 text-base leading-relaxed">
                        La meilleure façon de découvrir le Vovinam est de venir essayer.
                        Présentez-vous directement au DOJO lors d'une séance ou contactez-nous via WhatsApp.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
                    {/* Info cards */}
                    <div className="lg:col-span-2 space-y-4">
                        {CONTACT_ITEMS.map((c) => (
                            <div key={c.label} className="flex gap-5 p-6 rounded-2xl border border-white/8 bg-white/2 hover:border-white/15 transition-all">
                                <div className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: c.color + '20', border: `1px solid ${c.color}30` }}>
                                    <c.icon className="h-6 w-6" style={{ color: c.color }} />
                                </div>
                                <div>
                                    <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-1">{c.label}</p>
                                    <p className="text-white font-display font-bold text-base">{c.value}</p>
                                    <p className="text-white/50 text-sm mt-0.5">{c.sub}</p>
                                </div>
                            </div>
                        ))}

                        {/* WhatsApp CTA */}
                        <a href={wa} target="_blank" rel="noopener noreferrer"
                            className="group flex items-center justify-between p-6 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 hover:border-[#25D366]/40 transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0">
                                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[#25D366] font-display font-bold uppercase text-sm">WhatsApp</p>
                                    <p className="text-white/50 text-xs mt-0.5">Réponse rapide · 78 282 96 73</p>
                                </div>
                            </div>
                            <ArrowUpRight className="h-5 w-5 text-[#25D366]/60 group-hover:text-[#25D366] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                        </a>
                    </div>

                    {/* FAQ */}
                    <div className="lg:col-span-3">
                        <h3 className="font-display font-black text-white uppercase text-xl mb-6">
                            Questions fréquentes
                        </h3>
                        <div className="space-y-4">
                            {FAQS.map((faq, i) => (
                                <div key={i}
                                    className="group p-6 rounded-2xl border border-white/8 bg-white/2 hover:border-white/15 transition-all">
                                    <div className="flex gap-4">
                                        <span className="text-[#c0392b] font-display font-black text-sm flex-shrink-0 mt-0.5">Q.</span>
                                        <div>
                                            <p className="text-white font-semibold text-sm mb-2">{faq.q}</p>
                                            <p className="text-white/50 text-sm leading-relaxed">{faq.a}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Final big CTA banner */}
                <div className="relative rounded-2xl overflow-hidden p-10 sm:p-14 text-center"
                    style={{ background: 'linear-gradient(135deg, #0d1f3c 0%, #1a0a08 100%)' }}>
                    <div className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(192,57,43,0.4), transparent)',
                        }} />
                    <div className="relative z-10">
                        <p className="text-[#e5a800] text-xs font-bold uppercase tracking-[0.3em] mb-4">
                            Prêt à commencer ?
                        </p>
                        <h3 className="font-display text-3xl sm:text-5xl font-black text-white uppercase mb-4">
                            Première séance gratuite
                        </h3>
                        <p className="text-white/60 text-base max-w-xl mx-auto mb-8">
                            Pas besoin d'expérience. Venez simplement en tenue de sport au DOJO lors d'une séance —
                            <span className="text-white font-semibold"> Lundi, Mercredi ou Vendredi à 18h00.</span>
                        </p>
                        <a href={wa} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-[#c0392b] hover:bg-[#a93226] text-white font-display font-bold text-base uppercase tracking-wider transition-all shadow-2xl shadow-red-900/50 hover:-translate-y-0.5">
                            Nous contacter sur WhatsApp
                            <ArrowUpRight className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
