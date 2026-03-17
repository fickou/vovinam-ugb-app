import { useState, useEffect } from 'react';
import { cmsApi } from '@/lib/cms';
import { HeroContent } from '@/types/cms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';

const defaultHero: HeroContent = {
    titleLine1: 'VOVINAM',
    titleLine2: 'VIET VO DAO',
    subtitle: 'Fondé en 1938 par Maître Nguyễn Lộc, le Vovinam est un art martial humaniste qui forge le corps, l\'esprit et le caractère. Rejoignez notre section à l\'Université Gaston Berger de Saint-Louis.',
    ctaPrimaryText: 'Voir les entraînements',
    ctaSecondaryText: 'Découvrir le Vovinam',
};

export default function AdminHeroTab() {
    const [data, setData] = useState<HeroContent>(defaultHero);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const savedData = await cmsApi.getSettings('hero');
            if (savedData) {
                setData(savedData);
            }
        } catch (error) {
            console.error('Erreur chargement Hero:', error);
            toast.error('Erreur lors du chargement des données');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await cmsApi.updateSettings('hero', data);
            toast.success('Section Accueil mise à jour avec succès');
        } catch (error) {
            toast.error('Erreur lors de la sauvegarde');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await cmsApi.uploadAsset(file, 'hero');
            setData({ ...data, backgroundImageUrl: url });
            toast.success('Image uploadée avec succès');
        } catch (error) {
            toast.error('Erreur lors de l\'upload de l\'image');
        } finally {
            setIsUploading(false);
        }
    };

    const removeBgImage = () => {
        setData({ ...data, backgroundImageUrl: undefined });
    };

    if (isLoading) {
        return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-navy mb-1">Section Accueil (Hero)</h2>
                    <p className="text-muted-foreground text-sm">Modifiez l'apparence et les textes du haut de la page d'accueil.</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Enregistrer les modifications
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Textes */}
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                        <h3 className="font-semibold text-navy">Textes Principaux</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Titre (Ligne 1)</label>
                            <Input
                                value={data.titleLine1}
                                onChange={e => setData({ ...data, titleLine1: e.target.value })}
                                placeholder="ex: VOVINAM"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Titre (Ligne 2)</label>
                            <Input
                                value={data.titleLine2}
                                onChange={e => setData({ ...data, titleLine2: e.target.value })}
                                placeholder="ex: VIET VO DAO"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sous-titre / Accroche</label>
                            <Textarea
                                value={data.subtitle}
                                onChange={e => setData({ ...data, subtitle: e.target.value })}
                                className="h-32"
                                placeholder="Texte d'introduction..."
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                        <h3 className="font-semibold text-navy">Boutons (Call to actions)</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Bouton Principal (Rouge)</label>
                            <Input
                                value={data.ctaPrimaryText}
                                onChange={e => setData({ ...data, ctaPrimaryText: e.target.value })}
                                placeholder="ex: Voir les entraînements"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Bouton Secondaire (Transparent)</label>
                            <Input
                                value={data.ctaSecondaryText}
                                onChange={e => setData({ ...data, ctaSecondaryText: e.target.value })}
                                placeholder="ex: Découvrir le club"
                            />
                        </div>
                    </div>
                </div>

                {/* Médias */}
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                        <h3 className="font-semibold text-navy">Image de fond (Optionnelle)</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Ajoute une image en arrière-plan sous le texte. Si vide, le fond restera en dégradé bleu nuit dynamique.
                        </p>

                        {!data.backgroundImageUrl ? (
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 hover:border-primary rounded-xl cursor-pointer bg-white transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {isUploading ? (
                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                    ) : (
                                        <>
                                            <ImageIcon className="w-8 h-8 text-gray-400 mb-3" />
                                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Cliquez pour uploader</span> ou glissez une image</p>
                                            <p className="text-xs text-gray-500">PNG, JPG ou WEBP (Max. 5MB)</p>
                                        </>
                                    )}
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                            </label>
                        ) : (
                            <div className="relative rounded-xl overflow-hidden border group">
                                <img src={data.backgroundImageUrl} alt="Background" className="w-full h-48 object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="destructive" size="sm" onClick={removeBgImage} className="gap-2">
                                        <Trash2 className="w-4 h-4" /> Supprimer
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
