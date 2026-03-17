import { useState, useEffect } from 'react';
import { cmsApi } from '@/lib/cms';
import { PhilosophyContent, PhilosophyPrinciple } from '@/types/cms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Trash2, Plus, GripVertical } from 'lucide-react';

const defaultPhilosophy: PhilosophyContent = {
    label: 'Philosophie officielle · Sources vérifiées',
    titleLine1: 'Philosophie &',
    titleLine2: '10 Principes',
    description: [
        'Le Vovinam Viet Vo Dao se distingue de tous les sports de combat par sa philosophie profondément humaniste : former des **« hommes vrais »** — des individus justes, clairvoyants et utiles à la société.',
        'Les **10 principes fondamentaux**, rédigés en 1964, régissent la conduite et la vie de chaque pratiquant, du débutant au maître.'
    ],
    symbols: [
        { title: 'Devise officielle', value: '« Être fort pour être utile »', sub: 'Mạnh để phục vụ — Le fondement de toute la philosophie Vovinam.', color: '#e5a800' },
        { title: 'Salut emblématique', value: '« Main d\'acier sur cœur de bonté »', sub: 'Chí cương · Tâm từ bi — La force au service de la compassion.', color: '#c0392b' },
        { title: 'Philosophie centrale', value: 'Cách Mạng Tâm Thân', sub: '« Révolution du corps et de l\'esprit » — développement holistique de l\'individu.', color: '#27ae60' },
        { title: 'Symbole du bambou', value: '« Plier sans se rompre »', sub: 'Le bambou incarne la droiture, la souplesse, la constance et le désintéressement.', color: '#2980b9' },
    ],
    principlesLabel: 'Les 10 principes fondamentaux',
    principles: [
        { num: '01', title: 'Servir l\'humanité', text: 'Atteindre le plus haut niveau de l\'art martial pour servir la nation et l\'humanité.' },
        { num: '02', title: 'Fidélité à l\'idéal', text: 'Être fidèle à l\'idéal du Vovinam Viet Vo Dao, dévoué à sa cause et former une nouvelle génération de jeunes pratiquants engagés.' },
        { num: '03', title: 'Unité & Respect', text: 'Être toujours uni, respecter les maîtres et les aînés, et aimer sincèrement ses condisciples comme des frères et sœurs.' },
        { num: '04', title: 'Discipline & Honneur', text: 'Respecter rigoureusement la discipline du Vovinam et placer l\'honneur personnnel et collectif au-dessus de tout.' },
        { num: '05', title: 'Respect des autres arts', text: 'Respecter les autres disciplines martiales et n\'utiliser le Vovinam Viet Vo Dao qu\'en cas de légitime défense et pour une juste cause.' },
        { num: '06', title: 'Cultiver le savoir', text: 'Cultiver la connaissance, forger l\'esprit et progresser sur la voie de l\'homme vrai — entier, juste et utile.' },
        { num: '07', title: 'Justice & Noblesse', text: 'Vivre avec justice, simplicité, loyauté et noblesse d\'esprit dans chaque acte de la vie quotidienne.' },
        { num: '08', title: 'Volonté d\'acier', text: 'Développer une volonté de fer, persévérer et vaincre toutes les difficultés qui se dressent sur la voie.' },
        { num: '09', title: 'Lucidité & Persévérance', text: 'Être lucide dans ses décisions, persévérant et actif dans ses actes — agir avec discernement et résolution.' },
        { num: '10', title: 'Maîtrise de soi', text: 'Avoir confiance en soi, être maître de soi, modeste, tolérant, respectueux et se remettre constamment en question afin de progresser.' },
    ],
    saluteQuoteLine1: 'Être fort',
    saluteQuoteLine2: 'pour être utile',
    saluteQuoteAuthor: '— Mạnh để phục vụ\nMaître Nguyễn Lộc · Fondateur du Vovinam (1938)',
    saluteExplanationTitle: 'Main d\'acier sur cœur de bonté',
    saluteExplanationSub: 'Chí cương · Tâm từ bi',
    saluteExplanationText: 'Le pratiquant pose sa main droite fermée (force, acier) sur son cœur ouvert (bonté, compassion). Ce salut fondateur exprime l\'alliance indissociable de la puissance martiale et de la bienveillance humaine.',
    sourcesText: 'Sources : Fédération Française de Vovinam Viet Vo Dao (vovinam.fr) · Fédération Mondiale de Vovinam (vovinamworldfederation.eu) · Clubs affiliés français (vovinam-rosny.fr, vietvodao-bordeaux.com, vovinam-bures.com). Les 10 principes ont été rédigés en 1964 sous l\'impulsion de la direction du mouvement.'
};

export default function AdminPhilosophyTab() {
    const [data, setData] = useState<PhilosophyContent>(defaultPhilosophy);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const savedData = await cmsApi.getSettings('philosophy');
            if (savedData) setData(savedData);
        } catch (error) {
            console.error('Erreur chargement Philosophy:', error);
            toast.error('Erreur lors du chargement des données');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await cmsApi.updateSettings('philosophy', data);
            toast.success('Section "Philosophie" mise à jour avec succès');
        } catch (error) {
            toast.error('Erreur lors de la sauvegarde');
        } finally {
            setIsSaving(false);
        }
    };

    const updateDescription = (index: number, text: string) => {
        const newDesc = [...data.description];
        newDesc[index] = text;
        setData({ ...data, description: newDesc });
    };

    const addPrinciple = () => {
        const newPrinciple: PhilosophyPrinciple = {
            num: String(data.principles.length + 1).padStart(2, '0'),
            title: 'Nouveau Principe',
            text: 'Explication...'
        };
        setData({ ...data, principles: [...data.principles, newPrinciple] });
    };

    const updatePrinciple = (index: number, field: keyof PhilosophyPrinciple, value: string) => {
        const newPrinciples = [...data.principles];
        newPrinciples[index] = { ...newPrinciples[index], [field]: value };
        setData({ ...data, principles: newPrinciples });
    };

    const removePrinciple = (index: number) => {
        const newPrinciples = [...data.principles];
        newPrinciples.splice(index, 1);
        setData({ ...data, principles: newPrinciples });
    };

    if (isLoading) {
        return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-navy mb-1">Section Philosophie</h2>
                    <p className="text-muted-foreground text-sm">Modifiez l'histoire, les principes et citations du Vovinam.</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Enregistrer les modifications
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Colonne 1: Textes Généraux et Explications */}
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                        <h3 className="font-semibold text-navy">En-tête de Section</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Label</label>
                            <Input
                                value={data.label}
                                onChange={e => setData({ ...data, label: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Titre 1</label>
                                <Input
                                    value={data.titleLine1}
                                    onChange={e => setData({ ...data, titleLine1: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Titre 2 (Rouge)</label>
                                <Input
                                    value={data.titleLine2}
                                    onChange={e => setData({ ...data, titleLine2: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t">
                            <label className="text-sm font-medium text-navy block">Paragraphe 1</label>
                            <Textarea
                                value={data.description[0]}
                                onChange={e => updateDescription(0, e.target.value)}
                                className="h-24 text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-navy block">Paragraphe 2</label>
                            <Textarea
                                value={data.description[1]}
                                onChange={e => updateDescription(1, e.target.value)}
                                className="h-24 text-sm"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                        <h3 className="font-semibold text-navy">Bloc : Citation Principale & Salut</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-600 block">Citation (Ligne 1)</label>
                            <Input value={data.saluteQuoteLine1} onChange={e => setData({ ...data, saluteQuoteLine1: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-600 block">Citation (Ligne 2)</label>
                            <Input value={data.saluteQuoteLine2} onChange={e => setData({ ...data, saluteQuoteLine2: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Auteur</label>
                            <Textarea
                                value={data.saluteQuoteAuthor}
                                onChange={e => setData({ ...data, saluteQuoteAuthor: e.target.value })}
                                className="h-16"
                            />
                        </div>

                        <div className="space-y-2 pt-4 border-t">
                            <label className="text-sm font-medium text-red-600 block">Titre de l'Explication du Salut</label>
                            <Input value={data.saluteExplanationTitle} onChange={e => setData({ ...data, saluteExplanationTitle: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-red-600 block">Sous-titre (Vietnamien)</label>
                            <Input value={data.saluteExplanationSub} onChange={e => setData({ ...data, saluteExplanationSub: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Explication textuelle</label>
                            <Textarea
                                value={data.saluteExplanationText}
                                onChange={e => setData({ ...data, saluteExplanationText: e.target.value })}
                                className="h-24"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                        <h3 className="font-semibold text-navy">Pied de page</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sources (Footnote)</label>
                            <Textarea
                                value={data.sourcesText}
                                onChange={e => setData({ ...data, sourcesText: e.target.value })}
                                className="h-20 text-xs text-gray-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Colonne 2: Les Principes */}
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-navy">{data.principles.length} Principes</h3>
                            <Button variant="outline" size="sm" onClick={addPrinciple} className="gap-2">
                                <Plus className="w-4 h-4" /> Ajouter
                            </Button>
                        </div>

                        <div className="space-y-2 mb-4">
                            <label className="text-sm font-medium">Titre au-dessus des principes</label>
                            <Input
                                value={data.principlesLabel}
                                onChange={e => setData({ ...data, principlesLabel: e.target.value })}
                            />
                        </div>

                        <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                            {data.principles.map((principle, index) => (
                                <div key={index} className="pl-8 relative bg-white border rounded-xl p-4 shadow-sm group">
                                    <div className="absolute left-2 top-8 text-gray-300">
                                        <GripVertical className="w-5 h-5" />
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removePrinciple(index)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex gap-3">
                                            <div className="w-16">
                                                <label className="text-xs font-medium text-gray-500 block mb-1">N°</label>
                                                <Input
                                                    value={principle.num}
                                                    onChange={e => updatePrinciple(index, 'num', e.target.value)}
                                                    className="h-8 text-center font-bold text-red-600"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs font-medium text-gray-500 block mb-1">Titre du Principe</label>
                                                <Input
                                                    value={principle.title}
                                                    onChange={e => updatePrinciple(index, 'title', e.target.value)}
                                                    className="h-8"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 block mb-1">Définition</label>
                                            <Textarea
                                                value={principle.text}
                                                onChange={e => updatePrinciple(index, 'text', e.target.value)}
                                                className="h-20 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
