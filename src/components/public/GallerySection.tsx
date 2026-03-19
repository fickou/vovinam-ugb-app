import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { cmsApi } from '@/lib/cms';
import { GalleryImage } from '@/types/cms';

export default function GallerySection() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [lb, setLb] = useState<GalleryImage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedCats, setExpandedCats] = useState<string[]>([]);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const data = await cmsApi.getGallery();
                setImages(data || []);
            } catch (err) {
                console.error("Erreur chargement galerie", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGallery();
    }, []);

    const scrollToCategory = (cat: string) => {
        if (cat === 'Tous') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const el = document.getElementById(`cat-${cat}`);
        if (el) {
            const yOffset = -120; // Espacement pour la navbar
            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const toggleExpand = (cat: string) => {
        setExpandedCats(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const CATS = Array.from(new Set(images.map(i => i.cat)));
    const categoriesWithImages = CATS.map(cat => ({
        name: cat,
        images: images.filter(i => i.cat === cat)
    }));

    return (
        <section id="gallery" className="py-28 sm:py-36 bg-[#0f172a] relative overflow-hidden">
            {/* Soft atmospheric glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-900/10 rounded-full blur-3xl pointer-events-none mix-blend-screen" />

            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c0392b]/40 to-transparent" />

            <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
                {/* Label */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px w-12 bg-[#e5a800]" />
                    <span className="text-[#e5a800] font-display text-xs font-bold uppercase tracking-[0.3em]">Galerie</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
                    <h2 className="font-display text-4xl sm:text-5xl font-black text-white uppercase leading-none">
                        Nos Moments<br /><span className="text-[#c0392b]">Forts</span>
                    </h2>
                    {/* Navigation pills (Scroll) */}
                    <div className="flex flex-wrap gap-2">
                        {['Tous', ...CATS].map(c => (
                            <button key={c} onClick={() => scrollToCategory(c)}
                                className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide border border-white/10 bg-white/5 backdrop-blur-md text-white/50 hover:border-[#c0392b] hover:bg-[#c0392b]/10 hover:text-white transition-all duration-300 shadow-sm">
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-20 flex justify-center items-center">
                        <Loader2 className="w-8 h-8 text-[#e5a800] animate-spin" />
                    </div>
                ) : images.length === 0 ? (
                    <div className="py-20 text-center text-white/50 border-2 border-dashed border-white/5 rounded-3xl">
                        Aucune image disponible dans la galerie.
                    </div>
                ) : (
                    <div className="space-y-20">
                        {categoriesWithImages.map((group) => (
                            <div key={group.name} id={`cat-${group.name}`} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {/* Category Header */}
                                <div className="flex items-center gap-4">
                                    <h3 className="font-display text-2xl font-bold text-white uppercase tracking-wider">{group.name}</h3>
                                    <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                </div>

                                {/* Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {(expandedCats.includes(group.name) ? group.images : group.images.slice(0, 3)).map((item, idx) => {
                                        const isWide = (idx + group.name.length) % 7 === 0; // Pseudo-random masonry feel
                                        return (
                                            <div key={item.id}
                                                className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-white/5 shadow-xl hover:border-white/25 hover:shadow-2xl transition-all duration-500 ${isWide ? 'md:col-span-2' : ''}`}
                                                style={{ aspectRatio: isWide ? '16/9' : '4/3' }}
                                                onClick={() => setLb(item)}>
                                                <img src={item.src} alt={item.label}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 bg-[#0B1120]"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/1e293b/ffffff?text=Image+non+disponible';
                                                    }}
                                                />
                                                {/* Dark overlay */}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300" />
                                                {/* Caption */}
                                                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                    <p className="text-white text-xs sm:text-sm font-medium leading-snug">{item.label}</p>
                                                    <span className="text-[#e5a800] text-[10px] uppercase tracking-widest font-bold mt-1 inline-block">{group.name}</span>
                                                </div>
                                                {/* Zoom icon */}
                                                <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 border border-white/10">
                                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* See more button */}
                                {group.images.length > 3 && (
                                    <div className="flex justify-center pt-4">
                                        <button
                                            onClick={() => toggleExpand(group.name)}
                                            className="group flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-300 text-xs font-bold uppercase tracking-widest"
                                        >
                                            {expandedCats.includes(group.name) ? (
                                                <>Réduire la catégorie</>
                                            ) : (
                                                <>Voir les {group.images.length - 3} autres photos</>
                                            )}
                                            <svg className={`w-4 h-4 transition-transform duration-300 ${expandedCats.includes(group.name) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {lb && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/92 backdrop-blur-sm"
                    onClick={() => setLb(null)}>
                    <button onClick={() => setLb(null)}
                        className="absolute top-5 right-5 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
                        <X className="h-5 w-5" />
                    </button>
                    <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
                        <img src={lb.src} alt={lb.label}
                            className="w-full max-h-[78vh] object-contain rounded-xl ring-1 ring-white/10"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/1200x800/1e293b/ffffff?text=Image+non+disponible';
                            }}
                        />
                        <div className="mt-5 text-center">
                            <p className="text-white font-medium">{lb.label}</p>
                            <p className="text-[#e5a800] text-xs uppercase tracking-widest font-bold mt-1">{lb.cat}</p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
