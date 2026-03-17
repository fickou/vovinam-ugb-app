import { useState, useEffect } from 'react';
import { MapPin, Clock, ArrowUpRight } from 'lucide-react';
import { cmsApi } from '@/lib/cms';
import { ContactContent } from '@/types/cms';

const fallbackContact: ContactContent = {
    label: 'Contact & Infos',
    titleLine1: 'Venez nous',
    titleLine2: 'Rejoindre',
    description: 'La meilleure façon de découvrir le Vovinam est de venir essayer. Présentez-vous directement au DOJO lors d\'une séance ou contactez-nous via WhatsApp.',
    infoCards: [
        { iconName: 'MapPin', label: 'Adresse', value: 'Université Gaston Berger', sub: 'Route de Ngallèle, Saint-Louis, Sénégal', color: '#c0392b' },
        { iconName: 'Clock', label: 'Entraînements', value: 'Lun · Mer · Ven', sub: '18h00 – 20h00 · DOJO Universitaire', color: '#e5a800' }
    ],
    whatsappNumber: '+221 78 282 96 73',
    whatsappMessage: 'Bonjour, je souhaite rejoindre le club Vovinam UGB. Pouvez-vous me donner plus d\'informations ?',
    faqLabel: 'Questions fréquentes',
    faqs: [
        { q: 'Faut-il une expérience préalable ?', a: 'Non. Le Vovinam accueille les débutants à n\'importe quel âge. La première séance est gratuite et sans obligation.' },
        { q: 'Quel équipement faut-il apporter ?', a: 'Pour commencer, une tenue de sport suffit. L\'uniforme Vovinam (Võ phục) peut être acquis après votre inscription.' },
        { q: 'Y a-t-il des compétitions ?', a: 'Oui. Des tournois inter-universitaires sont organisés régionalement. La participation est encouragée mais non obligatoire.' },
        { q: 'Quelle est la cotisation ?', a: 'La cotisation est adaptée au contexte universitaire. Renseignez-vous directement auprès de nos encadrants lors d\'une séance.' },
    ],
    finalCtaLabel: 'Prêt à commencer ?',
    finalCtaTitle: 'Première séance gratuite',
    finalCtaDesc: 'Pas besoin d\'expérience préalable. Venez simplement en tenue de sport au DOJO lors d\'une de nos séances — Lundi, Mercredi ou Vendredi à 18h00.',
    finalCtaButton: 'Nous écrire',
};

export default function ContactSection() {
    const [data, setData] = useState<ContactContent>(fallbackContact);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const settings = await cmsApi.getSettings('contact');
                if (settings) setData(settings);
            } catch (err) {
                console.error("Erreur chargement contenu contact", err);
            }
        };
        fetchContent();
    }, []);

    const wa = `https://wa.me/${(data?.whatsappNumber || fallbackContact.whatsappNumber).replace(/\s+/g, '')}?text=${encodeURIComponent(data?.whatsappMessage || fallbackContact.whatsappMessage)}`;

    return (
        <section id="contact" className="py-28 sm:py-36 bg-[#0B1120] relative overflow-hidden">
            {/* Soft atmospheric glow */}
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-3xl pointer-events-none mix-blend-screen" />

            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c0392b]/40 to-transparent" />

            <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">

                {/* Label */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px w-12 bg-[#c0392b]" />
                    <span className="text-[#c0392b] font-display text-xs font-bold uppercase tracking-[0.3em]">{data.label}</span>
                </div>

                {/* Heading */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16 items-end">
                    <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase leading-none">
                        {data?.titleLine1 || fallbackContact.titleLine1}<br />
                        <span className="text-[#e5a800]">{data?.titleLine2 || fallbackContact.titleLine2}</span>
                    </h2>
                    <p className="text-white/50 text-base leading-relaxed whitespace-pre-line">
                        {data?.description || fallbackContact.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
                    {/* Info cards (dynamique via infoCards array) */}
                    <div className="lg:col-span-2 space-y-4">
                        {(data?.infoCards || fallbackContact.infoCards).map((card, i) => {
                            const Icon = card.iconName === 'MapPin' ? MapPin : Clock;
                            return (
                                <div key={i} className="flex gap-5 p-6 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md shadow-xl hover:border-white/15 hover:bg-white/10 transition-all duration-300">
                                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner" style={{ backgroundColor: `${card.color}15`, border: `1px solid ${card.color}25` }}>
                                        <Icon className="h-6 w-6" style={{ color: card.color }} />
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">{card.label}</p>
                                        <p className="text-white font-display font-medium text-lg">{card.value}</p>
                                        <p className="text-white/50 text-sm mt-0.5">{card.sub}</p>
                                    </div>
                                </div>
                            );
                        })}

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
                                    <p className="text-white/50 text-xs mt-0.5">Réponse rapide · {data?.whatsappNumber || fallbackContact.whatsappNumber}</p>
                                </div>
                            </div>
                            <ArrowUpRight className="h-5 w-5 text-[#25D366]/60 group-hover:text-[#25D366] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                        </a>
                    </div>

                    {/* FAQ */}
                    <div className="lg:col-span-3">
                        <h3 className="font-display font-black text-white uppercase text-xl mb-6">
                            {data?.faqLabel || fallbackContact.faqLabel}
                        </h3>
                        <div className="space-y-4">
                            {(data?.faqs || fallbackContact.faqs).map((faq, i) => (
                                <div key={i}
                                    className="group p-6 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md hover:border-white/15 hover:bg-white/10 transition-all duration-300">
                                    <div className="flex gap-5">
                                        <span className="text-[#c0392b] font-display font-black text-xl flex-shrink-0">Q.</span>
                                        <div>
                                            <p className="text-white font-display font-medium text-lg mb-2">{faq.q}</p>
                                            <p className="text-white/50 text-sm leading-relaxed">{faq.a}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Final big CTA banner */}
                <div className="relative rounded-[2.5rem] overflow-hidden p-12 sm:p-20 text-center shadow-2xl border border-white/10"
                    style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
                    <div className="absolute inset-0 opacity-40 mix-blend-screen"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 50% 100%, rgba(192,57,43,0.3), transparent 60%)',
                        }} />
                    <div className="relative z-10">
                        <p className="text-[#e5a800] text-xs font-bold uppercase tracking-[0.3em] mb-4">
                            {data?.finalCtaLabel || fallbackContact.finalCtaLabel}
                        </p>
                        <h3 className="font-display text-4xl sm:text-6xl font-black text-white uppercase mb-6 tracking-tight">
                            {data?.finalCtaTitle || fallbackContact.finalCtaTitle}
                        </h3>
                        <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto mb-10 font-light leading-relaxed whitespace-pre-line">
                            {data?.finalCtaDesc || fallbackContact.finalCtaDesc}
                        </p>
                        <a href={wa} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-[#c0392b] to-[#e63946] hover:from-[#a93226] hover:to-[#c0392b] text-white font-display font-medium text-base uppercase tracking-wider transition-all duration-300 shadow-2xl shadow-red-900/40 hover:-translate-y-1">
                            <span className="relative z-10">{data?.finalCtaButton || fallbackContact.finalCtaButton}</span>
                            <ArrowUpRight className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
