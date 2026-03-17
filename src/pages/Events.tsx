import { useState, useEffect } from 'react';
import { cmsApi } from '@/lib/cms';
import { Event } from '@/types/cms';
import { Loader2, X } from 'lucide-react';

export default function EventsPage() {
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

    const typeColors: Record<string, string> = {
        training: 'bg-blue-50 text-blue-700 border-blue-200',
        competition: 'bg-red-50 text-red-700 border-red-200',
        ceremony: 'bg-amber-50 text-amber-700 border-amber-200',
        stage: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };

    const typeLabels: Record<string, string> = {
        training: 'Entraînement',
        competition: 'Compétition',
        ceremony: 'Cérémonie',
        stage: 'Stage',
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="py-12">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-navy mb-4">Événements</h1>
                    <p className="text-gray-600">Découvrez tous nos événements et nos moments forts</p>
                </div>

                {/* Grid des événements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.map((event) => (
                        <div 
                            key={event.id}
                            className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white"
                            onClick={() => setSelectedEvent(event)}
                        >
                            {/* Image preview (s'il y a des images) */}
                            {event.images && event.images.length > 0 && (
                                <div className="relative h-48 bg-gray-200">
                                    <img 
                                        src={event.images[0]?.image_url} 
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/e5e7eb/ffffff?text=Pas+d\'image';
                                        }}
                                    />
                                    {event.images.length > 1 && (
                                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                                            +{event.images.length - 1} photo
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Contenu */}
                            <div className="p-6">
                                {/* Badge type */}
                                <span className={`inline-block px-3 py-1 rounded text-xs font-semibold mb-3 border ${typeColors[event.type] || 'bg-gray-50'}`}>
                                    {typeLabels[event.type] || event.type}
                                </span>

                                {/* Titre */}
                                <h3 className="text-xl font-bold text-navy mb-2">{event.title}</h3>

                                {/* Infos */}
                                <div className="space-y-1 text-sm text-gray-600 mb-3">
                                    {event.date && (
                                        <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString('fr-FR')} {event.time && `à ${event.time}`}</p>
                                    )}
                                    {event.location && (
                                        <p><strong>Lieu:</strong> {event.location}</p>
                                    )}
                                </div>

                                {/* Description courte */}
                                {event.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                                )}

                                {/* Lien pour plus de détails */}
                                {(event.description || (event.images && event.images.length > 0)) && (
                                    <button className="mt-4 text-primary font-semibold text-sm hover:underline">
                                        Voir les détails →
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {events.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p>Aucun événement à afficher pour le moment.</p>
                    </div>
                )}
            </div>

            {/* Modal détail événement */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setSelectedEvent(null)}>
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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
                            <span className={`inline-block px-3 py-1 rounded text-xs font-semibold mb-4 border ${typeColors[selectedEvent.type] || 'bg-gray-50'}`}>
                                {typeLabels[selectedEvent.type] || selectedEvent.type}
                            </span>

                            {/* Titre */}
                            <h2 className="text-3xl font-bold text-navy mb-4">{selectedEvent.title}</h2>

                            {/* Infos */}
                            <div className="space-y-2 text-gray-600 mb-6 pb-6 border-b">
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
                                    <h3 className="font-semibold text-navy mb-2">Description</h3>
                                    <p className="text-gray-600 whitespace-pre-wrap">{selectedEvent.description}</p>
                                </div>
                            )}

                            {/* Images */}
                            {selectedEvent.images && selectedEvent.images.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-navy mb-4">Galerie ({selectedEvent.images.length} image{selectedEvent.images.length > 1 ? 's' : ''})</h3>
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
        </div>
    );
}
