import { useState, useEffect } from 'react';
import { cmsApi } from '@/lib/cms';
import { AboutContent, AboutPillar } from '@/types/cms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Image as ImageIcon, Trash2, Plus, GripVertical } from 'lucide-react';

const defaultAbout: AboutContent = {
    label: 'Notre club',
    titleLine1: 'Vovinam UGB',
    titleLine2: ' Club',
    description: 'Fondée au sein de l\'Université Gaston Berger de Saint-Louis du Sénégal, notre section porte la tradition millénaire du combat vietnamien dans un cadre académique d\'excellence. Nous formons des pratiquants complets : athlètes, étudiants et citoyens.',
    imageCaptionTitle: 'Université Gaston Berger',
    imageCaptionSub: 'Saint-Louis · Sénégal',
    stats: [
        { label: 'Art martial', value: 'Vovinam Viet Vo Dao', sub: 'Arts martiaux vietnamiens — fondé 1938' },
        { label: 'Université', value: 'UGB Saint-Louis', sub: 'Université Gaston Berger — 1990' },
        { label: 'Public', value: 'Tous niveaux', sub: 'Étudiants, débutants et confirmés' },
        { label: 'Cotisation', value: 'Accessible', sub: '1ère séance d\'essai offerte' },
    ],
    pillars: [
        { num: '01', title: 'L\'Homme Révolutionnaire', body: 'Le premier principe du Vovinam : former des individus capables non seulement de se défendre mais de transformer positivement la société. La révolution intérieure précède la révolution du monde.' },
        { num: '02', title: 'Corps et Âme Ensemble', body: 'Contrairement à de nombreux arts martiaux, le Vovinam considère que la force physique sans la culture de l\'âme est incomplète. Chaque technique porte une leçon morale.' },
        { num: '03', title: 'Le Métal forjé par le Feu', body: 'L\'entraînement rigoureux est la voie de la transformation. La douleur de l\'effort forge le caractère comme le feu durcit l\'acier — c\'est la promesse faite à chaque pratiquant.' },
    ]
};

export default function AdminAboutTab() {
    const [data, setData] = useState<AboutContent>(defaultAbout);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const savedData = await cmsApi.getSettings('about');
            if (savedData) {
                setData(savedData);
            }
        } catch (error) {
            console.error('Erreur chargement About:', error);
            toast.error('Erreur lors du chargement des données');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await cmsApi.updateSettings('about', data);
            toast.success('Section "À propos" mise à jour avec succès');
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
            const url = await cmsApi.uploadAsset(file, 'about');
            setData({ ...data, imageUrl: url });
            toast.success('Image uploadée avec succès');
        } catch (error) {
            toast.error('Erreur lors de l\'upload de l\'image');
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = () => {
        setData({ ...data, imageUrl: undefined });
    };

    const addPillar = () => {
        const newPillar: AboutPillar = {
            num: String(data.pillars.length + 1).padStart(2, '0'),
            title: 'Nouveau Pilier',
            body: 'Description de ce pilier...'
        };
        setData({ ...data, pillars: [...data.pillars, newPillar] });
    };

    const updatePillar = (index: number, field: keyof AboutPillar, value: string) => {
        const newPillars = [...data.pillars];
        newPillars[index] = { ...newPillars[index], [field]: value };
        setData({ ...data, pillars: newPillars });
    };

    const removePillar = (index: number) => {
        const newPillars = [...data.pillars];
        newPillars.splice(index, 1);
        setData({ ...data, pillars: newPillars });
    };

    if (isLoading) {
        return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-navy mb-1">Section À propos</h2>
                    <p className="text-muted-foreground text-sm">Modifiez l'histoire du club et les valeurs affichées.</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Enregistrer les modifications
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Colonne Gauche: Textes et Image */}
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                        <h3 className="font-semibold text-navy">Textes d'introduction</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Surtitre (Petit label)</label>
                            <Input
                                value={data.label}
                                onChange={e => setData({ ...data, label: e.target.value })}
                                placeholder="ex: Notre club"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Titre (Ligne 1)</label>
                                <Input
                                    value={data.titleLine1}
                                    onChange={e => setData({ ...data, titleLine1: e.target.value })}
                                    placeholder="ex: Vovinam UGB"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Titre (Ligne 2)</label>
                                <Input
                                    value={data.titleLine2}
                                    onChange={e => setData({ ...data, titleLine2: e.target.value })}
                                    placeholder="ex:  Club"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description (Histoire principale)</label>
                            <Textarea
                                value={data.description}
                                onChange={e => setData({ ...data, description: e.target.value })}
                                className="h-32"
                                placeholder="..."
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                        <h3 className="font-semibold text-navy">Image "Campus"</h3>
                        <p className="text-sm text-muted-foreground mb-4">L'image qui accompagne l'histoire.</p>

                        {!data.imageUrl ? (
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 hover:border-primary rounded-xl cursor-pointer bg-white transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {isUploading ? (
                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                    ) : (
                                        <>
                                            <ImageIcon className="w-8 h-8 text-gray-400 mb-3" />
                                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Cliquez pour uploader</span> ou glissez une image</p>
                                        </>
                                    )}
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                            </label>
                        ) : (
                            <div className="relative rounded-xl overflow-hidden border group mb-4">
                                <img src={data.imageUrl} alt="About" className="w-full h-48 object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="destructive" size="sm" onClick={removeImage} className="gap-2">
                                        <Trash2 className="w-4 h-4" /> Supprimer
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Titre sur l'image</label>
                                <Input
                                    value={data.imageCaptionTitle}
                                    onChange={e => setData({ ...data, imageCaptionTitle: e.target.value })}
                                    placeholder="ex: Université Gaston Berger"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Sous-titre sur l'image</label>
                                <Input
                                    value={data.imageCaptionSub}
                                    onChange={e => setData({ ...data, imageCaptionSub: e.target.value })}
                                    placeholder="ex: Saint-Louis · Sénégal"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Colonne Droite: Piliers et Stats */}
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-navy">Les 3 Piliers (Cartes)</h3>
                            <Button variant="outline" size="sm" onClick={addPillar} className="gap-2">
                                <Plus className="w-4 h-4" /> Ajouter
                            </Button>
                        </div>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {data.pillars.map((pillar, index) => (
                                <div key={index} className="pl-8 relative bg-white border rounded-xl p-4 shadow-sm group">
                                    <div className="absolute left-2 top-8 text-gray-300">
                                        <GripVertical className="w-5 h-5" />
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removePillar(index)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex gap-3">
                                            <div className="w-16">
                                                <label className="text-xs font-medium text-gray-500 block mb-1">Numéro</label>
                                                <Input
                                                    value={pillar.num}
                                                    onChange={e => updatePillar(index, 'num', e.target.value)}
                                                    className="h-8"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs font-medium text-gray-500 block mb-1">Titre du Pilier</label>
                                                <Input
                                                    value={pillar.title}
                                                    onChange={e => updatePillar(index, 'title', e.target.value)}
                                                    className="h-8"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 block mb-1">Description</label>
                                            <Textarea
                                                value={pillar.body}
                                                onChange={e => updatePillar(index, 'body', e.target.value)}
                                                className="h-20 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {data.pillars.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">Aucun pilier défini.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
