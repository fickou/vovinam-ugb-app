import { useState, useEffect } from 'react';
import { cmsApi } from '@/lib/cms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Trash2, Upload, Image as ImageIcon, Save, Plus, X } from 'lucide-react';

export default function AdminEventsTab() {
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    // Form pour créer un nouvel événement
    const [newEventData, setNewEventData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        type: 'training',
    });

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
            toast.error('Erreur lors du chargement des événements');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateEvent = async () => {
        if (!newEventData.title) return toast.error("Veuillez entrer un titre");
        if (!newEventData.date) return toast.error("Veuillez entrer une date");

        try {
            await cmsApi.createEvent(newEventData);
            toast.success("Événement créé avec succès!");
            setNewEventData({
                title: '',
                description: '',
                date: '',
                time: '',
                location: '',
                type: 'training',
            });
            loadEvents();
        } catch (error) {
            console.error('Erreur création événement:', error);
            toast.error("Erreur lors de la création de l'événement");
        }
    };

    const handleUploadImages = async (eventId: string) => {
        if (!uploadedFiles.length) return toast.error("Veuillez sélectionner au moins une image");

        setIsUploading(true);
        try {
            const imagesToAdd = [];
            
            for (const file of uploadedFiles) {
                // Upload l'image vers le bucket Supabase
                const publicUrl = await cmsApi.uploadAsset(file, 'events');
                imagesToAdd.push({
                    image_url: publicUrl,
                    label: file.name.split('.')[0],
                    order_index: imagesToAdd.length,
                });
            }

            // Ajouter toutes les images à la DB en une seule insertion
            await cmsApi.addEventImages(eventId, imagesToAdd);

            toast.success(`${uploadedFiles.length} image(s) ajoutée(s) avec succès!`);
            setUploadedFiles([]);
            setSelectedEventId(null);
            loadEvents();
        } catch (error) {
            console.error('Erreur upload:', error);
            toast.error("Erreur lors de l'upload des images");
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const validFiles = newFiles.filter(file => {
                if (file.size > 5 * 1024 * 1024) {
                    toast.error(`${file.name} est trop volumineux (max 5 Mo)`);
                    return false;
                }
                return true;
            });
            setUploadedFiles(prev => [...prev, ...validFiles]);
        }
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteEvent = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cet événement?")) return;

        try {
            await cmsApi.deleteEvent(id);
            toast.success("Événement supprimé");
            loadEvents();
        } catch (error) {
            console.error("Erreur suppression", error);
            toast.error("Erreur lors de la suppression de l'événement");
        }
    };

    const handleDeleteImage = async (imageId: string, imageUrl: string, eventId: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cette image?")) return;

        try {
            await cmsApi.deleteEventImage(imageId, imageUrl);
            toast.success("Image supprimée");
            
            // Recharger les données de l'événement
            const updatedEvents = events.map(e => 
                e.id === eventId 
                    ? { ...e, images: (e.images || []).filter(img => img.id !== imageId) }
                    : e
            );
            setEvents(updatedEvents);
        } catch (error) {
            console.error("Erreur suppression image", error);
            toast.error("Erreur lors de la suppression de l'image");
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-xl font-bold text-navy mb-1">Gestion des Événements</h2>
                <p className="text-muted-foreground text-sm">Créez des événements et ajoutez des photos pour chaque occasion.</p>
            </div>

            {/* Formulaire de création d'événement */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Créer un nouvel événement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">Titre de l'événement*</label>
                        <Input
                            value={newEventData.title}
                            onChange={e => setNewEventData({ ...newEventData, title: e.target.value })}
                            placeholder="Ex: Tournoi Inter-universitaire"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">Type*</label>
                        <select 
                            value={newEventData.type}
                            onChange={e => setNewEventData({ ...newEventData, type: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="training">Entraînement</option>
                            <option value="competition">Compétition</option>
                            <option value="ceremony">Cérémonie</option>
                            <option value="stage">Stage</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">Date*</label>
                        <Input
                            type="date"
                            value={newEventData.date}
                            onChange={e => setNewEventData({ ...newEventData, date: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">Heure</label>
                        <Input
                            type="time"
                            value={newEventData.time}
                            onChange={e => setNewEventData({ ...newEventData, time: e.target.value })}
                        />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-medium text-gray-500">Lieu</label>
                        <Input
                            value={newEventData.location}
                            onChange={e => setNewEventData({ ...newEventData, location: e.target.value })}
                            placeholder="Ex: Salle Polyvalente UGB"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-medium text-gray-500">Description</label>
                        <textarea
                            value={newEventData.description}
                            onChange={e => setNewEventData({ ...newEventData, description: e.target.value })}
                            placeholder="Description détaillée de l'événement..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            rows={3}
                        />
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button onClick={handleCreateEvent} className="gap-2">
                        <Save className="h-4 w-4" />
                        Créer l'événement
                    </Button>
                </div>
            </div>

            {/* Liste des événements avec upload d'images */}
            <div>
                <h3 className="font-semibold text-navy mb-4">Événements ({events.length})</h3>
                <div className="space-y-6">
                    {events.map(event => (
                        <div key={event.id} className="border border-slate-200 rounded-lg p-6 bg-white">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-semibold text-lg text-navy">{event.title}</h4>
                                    <p className="text-sm text-gray-500">{event.date} {event.time && `à ${event.time}`}</p>
                                    {event.location && <p className="text-sm text-gray-500">{event.location}</p>}
                                </div>
                                <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleDeleteEvent(event.id)}
                                    className="gap-2"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    Supprimer
                                </Button>
                            </div>

                            {event.description && (
                                <p className="text-sm text-gray-600 mb-4">{event.description}</p>
                            )}

                            {/* Section d'upload */}
                            {selectedEventId === event.id && (
                                <div className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-200">
                                    <h5 className="font-medium text-sm text-navy mb-3 flex items-center gap-2">
                                        <Upload className="h-4 w-4" /> Ajouter les images de cet événement
                                    </h5>
                                    
                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-500">Sélectionner les images (5 Mo max par image)</label>
                                            <Input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="bg-white cursor-pointer"
                                            />
                                        </div>

                                        {/* Fichiers sélectionnés */}
                                        {uploadedFiles.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-xs font-medium text-gray-500">{uploadedFiles.length} image(s) en attente</p>
                                                <div className="space-y-1">
                                                    {uploadedFiles.map((file, idx) => (
                                                        <div key={idx} className="flex items-center justify-between bg-white p-2 rounded text-sm">
                                                            <span className="text-gray-700 truncate">{file.name}</span>
                                                            <button
                                                                onClick={() => removeFile(idx)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-2 justify-end">
                                            <Button 
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedEventId(null);
                                                    setUploadedFiles([]);
                                                }}
                                            >
                                                Annuler
                                            </Button>
                                            <Button 
                                                size="sm"
                                                onClick={() => handleUploadImages(event.id)}
                                                disabled={isUploading || !uploadedFiles.length}
                                                className="gap-2"
                                            >
                                                {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                                Enregistrer {uploadedFiles.length > 0 && `(${uploadedFiles.length})`}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedEventId !== event.id && (
                                <Button 
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedEventId(event.id)}
                                    className="gap-2 mb-4"
                                >
                                    <ImageIcon className="h-4 w-4" />
                                    Ajouter des images
                                </Button>
                            )}

                            {/* Galerie des images existantes */}
                            {event.images && event.images.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-2">Images de l'événement ({event.images.length})</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {event.images.map((image: any) => (
                                            <div key={image.id} className="relative group rounded-lg overflow-hidden bg-gray-100">
                                                <img 
                                                    src={image.image_url} 
                                                    alt={image.label} 
                                                    className="w-full h-24 object-cover"
                                                />
                                                <button
                                                    onClick={() => handleDeleteImage(image.id, image.image_url, event.id)}
                                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                >
                                                    <Trash2 className="h-5 w-5 text-white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
