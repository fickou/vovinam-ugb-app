import { useState, useEffect } from 'react';
import { cmsApi } from '@/lib/cms';
import { GalleryImage } from '@/types/cms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Trash2, Upload, Image as ImageIcon, Save } from 'lucide-react';

export default function AdminGalleryTab() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // Formulaire d'ajout rapide
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadLabel, setUploadLabel] = useState('');
    const [uploadCategory, setUploadCategory] = useState('');

    useEffect(() => {
        loadGallery();
    }, []);

    const loadGallery = async () => {
        setIsLoading(true);
        try {
            const data = await cmsApi.getGallery();
            setImages(data || []);
        } catch (error) {
            console.error('Erreur chargement galerie:', error);
            toast.error('Erreur lors du chargement de la galerie');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!uploadFile) return toast.error("Veuillez sélectionner une image");
        if (!uploadLabel) return toast.error("Veuillez entrer une description (label)");
        if (!uploadCategory) return toast.error("Veuillez entrer une catégorie");

        setIsUploading(true);
        try {
            // 1. Upload vers le bucket Supabase
            const publicUrl = await cmsApi.uploadAsset(uploadFile, 'gallery');

            // 2. Sauvegarde en DB
            await cmsApi.addGalleryImage({
                src: publicUrl,
                label: uploadLabel,
                cat: String(uploadCategory),
            });

            toast.success("Image ajoutée avec succès !");

            // Reset form
            setUploadFile(null);
            setUploadLabel('');
            setUploadCategory('');

            // Refresh
            loadGallery();
        } catch (error) {
            console.error('Erreur upload:', error);
            toast.error("Erreur lors de l'upload de l'image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string, url: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cette image ?")) return;

        try {
            await cmsApi.deleteGalleryImage(id, url);
            toast.success("Image supprimée");
            loadGallery();
        } catch (error) {
            console.error("Erreur suppression", error);
            toast.error("Erreur lors de la suppression de l'image");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("L'image est trop volumineuse (max 5 Mo)");
                e.target.value = '';
                return;
            }
            setUploadFile(file);
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-xl font-bold text-navy mb-1">Médiathèque / Galerie</h2>
                <p className="text-muted-foreground text-sm">Ajoutez, modifiez ou supprimez les images de la galerie publique.</p>
            </div>

            {/* Formulaire d'ajout (En-tête) */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
                    <Upload className="h-4 w-4" /> Ajouter une nouvelle image
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-medium text-gray-500">Fichier image (Max 5 Mo)</label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="bg-white cursor-pointer"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">Catégorie (ex: Lieu, Événement)</label>
                        <Input
                            value={uploadCategory}
                            onChange={e => setUploadCategory(e.target.value)}
                            placeholder="Catégorie"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">Légende / Description brève</label>
                        <Input
                            value={uploadLabel}
                            onChange={e => setUploadLabel(e.target.value)}
                            placeholder="Description..."
                        />
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button onClick={handleUpload} disabled={isUploading || !uploadFile} className="gap-2">
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Enregistrer l'image
                    </Button>
                </div>
            </div>

            {/* Grille des images existantes */}
            <div>
                <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Images en ligne ({images.length})
                </h3>

                {images.length === 0 ? (
                    <div className="text-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">Aucune image dans la galerie.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((img) => (
                            <div key={img.id} className="group relative rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <div className="aspect-[4/3] bg-gray-100 relative">
                                    <img
                                        src={img.src}
                                        alt={img.label}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Erreur+Image';
                                        }}
                                    />
                                    {/* Actions Hover */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => handleDelete(img.id, img.src)}
                                            title="Supprimer l'image"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-3 bg-white border-t">
                                    <p className="text-xs font-bold text-[#e5a800] uppercase mb-1">{img.cat}</p>
                                    <p className="text-sm font-medium text-navy truncate" title={img.label}>{img.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
