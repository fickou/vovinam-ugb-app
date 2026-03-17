import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { cmsApi } from '@/lib/cms';
import { GalleryImage } from '@/types/cms';

export default function GallerySection() {
    const [active, setActive] = useState('Tous');
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [lb, setLb] = useState<GalleryImage | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    const CATS = ['Tous', ...Array.from(new Set(images.map(i => i.cat)))];
    const filtered = active === 'Tous' ? images : images.filter(i => i.cat === active);

    return (
        <section id="gallery" className="py-28 sm:py-36 bg-[#0E1524] relative overflow-hidden">
            {/* Soft atmospheric glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-900/10 rounded-full blur-3xl pointer-events-none mix-blend-screen" />

            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c0392b]/40 to-transparent" />

            <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
                {/* Label */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px w-12 bg-[#e5a800]" />
                    <span className="text-[#e5a800] font-display text-xs font-bold uppercase tracking-[0.3em]">Galerie</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
                    <h2 className="font-display text-4xl sm:text-5xl font-black text-white uppercase leading-none">
                        Nos Moments<br /><span className="text-[#c0392b]">Forts</span>
                    </h2>
                    {/* Filter pills */}
                    <div className="flex flex-wrap gap-2">
                        {CATS.map(c => (
                            <button key={c} onClick={() => setActive(c)}
                                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide border transition-all duration-300 shadow-sm ${active === c
                                    ? 'bg-[#c0392b] border-[#c0392b] text-white shadow-red-900/20'
                                    : 'border-white/10 bg-white/5 backdrop-blur-md text-white/50 hover:border-white/30 hover:bg-white/10 hover:text-white'
                                    }`}>
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Masonry-style grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {isLoading ? (
                        <div className="col-span-full py-20 flex justify-center items-center">
                            <Loader2 className="w-8 h-8 text-[#e5a800] animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-white/50">
                            Aucune image disponible dans cette catégorie.
                        </div>
                    ) : (
                        filtered.map((item, idx) => {
                            const large = idx % 5 === 0; // Every 5th item spans 2 cols
                            return (
                                <div key={item.id}
                                    className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-white/5 shadow-xl hover:border-white/25 hover:shadow-2xl transition-all duration-500 ${large ? 'col-span-2 row-span-2' : ''}`}
                                    style={{ aspectRatio: large ? '16/9' : '4/3' }}
                                    onClick={() => setLb(item)}>
                                    <img src={item.src} alt={item.label}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 bg-[#0B1120]"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/1e293b/ffffff?text=Image+non+disponible';
                                        }}
                                    />
                                    {/* Dark overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300" />
                                    {/* Caption */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <p className="text-white text-xs sm:text-sm font-medium leading-snug">{item.label}</p>
                                        <span className="text-[#e5a800] text-[10px] uppercase tracking-widest font-bold">{item.cat}</span>
                                    </div>
                                    {/* Zoom icon */}
                                    <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                        </svg>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
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
