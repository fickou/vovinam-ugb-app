import { useState, useEffect } from 'react';
import { cmsApi } from '@/lib/cms';
import { Event } from '@/types/cms';
import { Loader2, X, ArrowRight } from 'lucide-react';

export default function EventsSection() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setIsLoading(true);
        try {
            const data = await cmsApi.getEvents();
            // Charger les images pour chaque événement
            const eventsWithImages = await Promise.all(
                (data || []).map(async (event) => ({
                    ...event,
                    images: await cmsApi.getEventImages(event.id)
                }))
            );
            setEvents(eventsWithImages);
        } catch (error) {
            console.error('Erreur chargement événements:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const typeColors: Record<string, { bg: string; text: string; dot: string }> = {
        competition: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
        training: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
        ceremony: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
        stage: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    };

    const typeLabels: Record<string, string> = {
        competition: 'Compétition',
        training: 'Entraînement',
        ceremony: 'Événement',
        stage: 'Stage',
    };

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

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 text-[hsl(0,80%,45%)] animate-spin" />
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <p>Aucun événement disponible pour le moment.</p>
                    </div>
                ) : (
                    <>
                        {/* Events grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {events.map((event) => {
                                const colors = typeColors[event.type] || typeColors.training;
                                return (
                                    <div
                                        key={event.id}
                                        className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group cursor-pointer"
                                        onClick={() => setSelectedEvent(event)}
                                    >
                                        {/* Image preview if available */}
                                        {event.images && event.images.length > 0 && (
                                            <div className="relative h-48 bg-gray-200 overflow-hidden">
                                                <img 
                                                    src={event.images[0]?.image_url} 
                                                    alt={event.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                                {event.images.length > 1 && (
                                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
                                                        +{event.images.length - 1}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="p-6">
                                            {/* Badge + title */}
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <div>
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text} mb-3`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                                                        {typeLabels[event.type] || event.type}
                                                    </span>
                                                    <h3 className="font-display font-bold text-xl text-[hsl(220,60%,18%)] uppercase leading-tight group-hover:text-[hsl(0,80%,45%)] transition-colors">
                                                        {event.title}
                                                    </h3>
                                                </div>
                                                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-[hsl(0,80%,45%)] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                                            </div>

                                            {/* Meta */}
                                            <div className="space-y-2 mb-4">
                                                {event.date && (
                                                    <div className="text-slate-500 text-sm">
                                                        <strong>📅</strong> {new Date(event.date).toLocaleDateString('fr-FR')} {event.time && `à ${event.time}`}
                                                    </div>
                                                )}
                                                {event.location && (
                                                    <div className="text-slate-500 text-sm">
                                                        <strong>📍</strong> {event.location}
                                                    </div>
                                                )}
                                            </div>

                                            {event.description && (
                                                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                                                    {event.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Modal détail événement */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setSelectedEvent(null)}>
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}>
                        {/* Close button */}
                        <button 
                            onClick={() => setSelectedEvent(null)}
                            className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 z-10"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Contenu */}
                        <div className="p-6 md:p-8">
                            {/* Badge type */}
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-4 ${typeColors[selectedEvent.type] ? typeColors[selectedEvent.type].bg + ' ' + typeColors[selectedEvent.type].text : 'bg-gray-50'}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${typeColors[selectedEvent.type]?.dot || 'bg-gray-400'}`} />
                                {typeLabels[selectedEvent.type] || selectedEvent.type}
                            </span>

                            {/* Titre */}
                            <h2 className="text-3xl font-bold text-[hsl(220,60%,18%)] uppercase mb-4">{selectedEvent.title}</h2>

                            {/* Infos */}
                            <div className="space-y-2 text-slate-600 mb-6 pb-6 border-b">
                                {selectedEvent.date && (
                                    <p><strong>📅 Date:</strong> {new Date(selectedEvent.date).toLocaleDateString('fr-FR')} {selectedEvent.time && `à ${selectedEvent.time}`}</p>
                                )}
                                {selectedEvent.location && (
                                    <p><strong>📍 Lieu:</strong> {selectedEvent.location}</p>
                                )}
                            </div>

                            {/* Description */}
                            {selectedEvent.description && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-[hsl(220,60%,18%)] mb-2">Description</h3>
                                    <p className="text-slate-600 whitespace-pre-wrap">{selectedEvent.description}</p>
                                </div>
                            )}

                            {/* Images */}
                            {selectedEvent.images && selectedEvent.images.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-[hsl(220,60%,18%)] mb-4">Galerie ({selectedEvent.images.length} image{selectedEvent.images.length > 1 ? 's' : ''})</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {selectedEvent.images.map((image) => (
                                            <div
                                                key={image.id}
                                                className="relative overflow-hidden rounded-lg cursor-pointer group"
                                                onClick={() => setSelectedImage(image.image_url)}
                                            >
                                                <img
                                                    src={image.image_url}
                                                    alt={image.label || 'Image événement'}
                                                    className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/e5e7eb/ffffff?text=Image+non+disponible';
                                                    }}
                                                />
                                                {image.label && (
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                                        <p className="text-white text-sm font-medium opacity-0 group-hover:opacity-100">{image.label}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox pour les images */}
            {selectedImage && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4"
                    onClick={() => setSelectedImage(null)}>
                    <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300"
                    >
                        <X className="h-8 w-8" />
                    </button>
                    <img 
                        src={selectedImage} 
                        alt="Full size"
                        className="max-w-4xl max-h-[90vh] object-contain"
                        onClick={e => e.stopPropagation()}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/1200x800/e5e7eb/ffffff?text=Image+non+disponible';
                        }}
                    />
                </div>
            )}
        </section>
    );
}
