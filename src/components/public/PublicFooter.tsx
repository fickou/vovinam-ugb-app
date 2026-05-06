import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

const SECTIONS = [
    { label: 'Accueil', href: '#hero' },
    { label: 'À propos', href: '#about' },
    { label: 'Philosophie', href: '#philosophy' },
    { label: 'Entraînements', href: '#schedule' },
    { label: 'Galerie', href: '#gallery' },
    { label: 'Contact', href: '#contact' },
];

const go = (href: string) => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

export default function PublicFooter() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-[#030710] text-white border-t border-white/8">
            {/* Main */}
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20 grid grid-cols-1 md:grid-cols-12 gap-10">

                {/* Brand col */}
                <div className="md:col-span-4">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="h-16 w-16 flex items-center justify-center">
                            <img src={logo} alt="Logo" className="w-full h-full object-contain scale-[1.3] origin-center drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                        </div>
                        <div>
                            <div className="font-display font-black text-white uppercase tracking-wide text-sm">
                                Vovinam <span className="text-[#c0392b]">UGB</span> <span className="text-[#e5a800]">SC</span>
                            </div>
                            <div className="text-white/30 text-[10px] uppercase tracking-widest"> Club · Vovinam VVD</div>
                        </div>
                    </div>
                    <p className="text-white/40 text-sm leading-relaxed mb-5 max-w-xs">
                        Section officielle de Vovinam Viet Vo Dao de l'Université Gaston Berger de Saint-Louis, Sénégal.
                    </p>
                    <div className="flex items-center gap-2 text-white/30 text-xs">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#e5a800]" />
                        <span>Entraînements : Lun · Mer · Ven · 18h–20h</span>
                    </div>
                </div>

                {/* Nav col */}
                <div className="md:col-span-3 md:col-start-6">
                    <h4 className="text-white/30 text-[10px] font-bold uppercase tracking-[0.25em] mb-5">Navigation</h4>
                    <ul className="space-y-3">
                        {SECTIONS.map(s => (
                            <li key={s.href}>
                                <button onClick={() => go(s.href)}
                                    className="text-white/50 hover:text-white text-sm transition-colors hover:translate-x-1 inline-flex items-center gap-2 group">
                                    <span className="inline-block h-px w-0 group-hover:w-4 bg-[#c0392b] transition-all duration-200" />
                                    {s.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Access col */}
                <div className="md:col-span-3 md:col-start-10">
                    <h4 className="text-white/30 text-[10px] font-bold uppercase tracking-[0.25em] mb-5">Espace Membres</h4>
                    <p className="text-white/40 text-sm leading-relaxed mb-5">
                        Les pratiquants inscrits accèdent à leur espace de gestion personnel.
                    </p>
                    <Link to="/auth"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/8 hover:bg-[#c0392b] border border-white/12 hover:border-[#c0392b] text-white text-sm font-bold transition-all duration-300">
                        Connexion
                    </Link>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/5 py-6">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/25 text-xs">
                    <span>© {year} Vovinam Viet Vo Dao UGB  Club · Tous droits réservés · Saint-Louis, Sénégal</span>
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-1 rounded-full bg-[#c0392b]" />
                        <span>Art Martial Vietnamien · Fondé 1938</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
