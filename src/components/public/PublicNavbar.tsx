import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '@/assets/logo.png';

const NAV_LINKS = [
    { label: 'Accueil', href: '#hero' },
    { label: 'À propos', href: '#about' },
    { label: 'Philosophie', href: '#philosophy' },
    { label: 'Entraînements', href: '#schedule' },
    { label: 'Galerie', href: '#gallery' },
    { label: 'Contact', href: '#contact' },
];

export default function PublicNavbar() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    const go = (href: string) => {
        setOpen(false);
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0a0f1e]/95 backdrop-blur-xl shadow-2xl shadow-black/50' : 'bg-transparent'}`}>
            <nav className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-[70px] sm:h-20">

                {/* Brand */}
                <button onClick={() => go('#hero')} className="flex items-center gap-3 group">
                    <div className="h-20 w-20 rounded-lg  overflow-hidden ring-1 ring-white/30 group-hover:ring-white/5 transition-all duration-300 bg-white">
                        <img src={logo} alt="Logo" className="h-full w-full object-contain scale-[1.6] origin-center" />
                    </div>
                    <span className="font-display font-black text-white text-base tracking-widest uppercase hidden sm:inline">
                        Vovinam <span className="text-[#c0392b]">UGB</span>
                        <span className="text-[#e5a800] ml-1">SC</span>
                    </span>
                </button>

                {/* Desktop nav */}
                <ul className="hidden lg:flex items-center gap-1">
                    {NAV_LINKS.map(l => (
                        <li key={l.href}>
                            <button onClick={() => go(l.href)}
                                className="px-4 py-2 text-sm text-white/70 hover:text-white font-medium tracking-wide rounded-lg hover:bg-white/8 transition-all duration-200">
                                {l.label}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* CTA */}
                <div className="hidden lg:block">
                    <Link to="/auth"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#c0392b] hover:bg-[#a93226] text-white font-bold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-red-900/40 hover:shadow-red-900/60 hover:-translate-y-px">
                        Espace Membres
                    </Link>
                </div>

                {/* Hamburger */}
                <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-all">
                    {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </nav>

            {/* Mobile drawer */}
            <div className={`lg:hidden transition-all duration-300 overflow-hidden ${open ? 'max-h-screen' : 'max-h-0'}`}>
                <div className="bg-[#0a0f1e]/98 backdrop-blur-xl border-t border-white/10 px-5 py-4 space-y-1">
                    {NAV_LINKS.map(l => (
                        <button key={l.href} onClick={() => go(l.href)}
                            className="block w-full text-left px-4 py-3.5 text-white/80 hover:text-white hover:bg-white/8 rounded-xl text-base font-medium transition-all">
                            {l.label}
                        </button>
                    ))}
                    <Link to="/auth" onClick={() => setOpen(false)}
                        className="block mt-3 w-full text-center px-4 py-3.5 bg-[#c0392b] hover:bg-[#a93226] text-white font-bold text-base rounded-xl transition-all">
                        Espace Membres
                    </Link>
                </div>
            </div>
        </header>
    );
}
