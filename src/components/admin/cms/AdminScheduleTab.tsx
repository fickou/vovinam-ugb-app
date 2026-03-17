import { useState, useEffect } from 'react';
import { cmsApi } from '@/lib/cms';
import { ScheduleContent, ScheduleSession } from '@/types/cms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Trash2, Plus, GripVertical } from 'lucide-react';

const defaultSchedule: ScheduleContent = {
    label: 'Rejoindre le club',
    titleLine1: 'Entraînements',
    titleLine2: 'Hebdomadaires',
    description: 'Trois séances par semaine pour une progression régulière et structurée. Chaque séance est encadrée par nos ceintures noires et adaptée à tous les niveaux.\nPremière séance d\'essai gratuite et sans engagement.',
    sessions: [
        {
            day: 'Lundi',
            dayFr: 'LUN',
            time: '18h00 – 20h00',
            location: 'DOJO',
            type: 'Technique & Conditionnement',
            focus: 'Techniques de base (Quyền), conditionnement physique, travail des frappes.',
        },
        {
            day: 'Mercredi',
            dayFr: 'MER',
            time: '18h00 – 20h00',
            location: 'DOJO',
            type: 'Combat & Projections',
            focus: 'Travail en binôme (Đối luyện), projections, techniques de chute, combat libre supervisé.',
        },
        {
            day: 'Vendredi',
            dayFr: 'VEN',
            time: '18h00 – 20h00',
            location: 'DOJO',
            type: 'Formes & Perfectionnement',
            focus: 'Enchaînements codifiés (Quyền tổng hợp), révisions des grades, préparation compétitions.',
        },
    ],
    structureTitle: 'Structure d\'une séance',
    structure: [
        { phase: '18h00 – 18h15', desc: 'Échauffement et étirements dynamiques' },
        { phase: '18h15 – 19h15', desc: 'Travail technique principal de la séance' },
        { phase: '19h15 – 19h45', desc: 'Pratique en partenaire ou formes libres' },
        { phase: '19h45 – 20h00', desc: 'Retour au calme, méditation et bilan' },
    ],
    benefitsTitle: 'Bénéfices de la pratique',
    benefits: [
        'Renforcement musculaire complet',
        'Souplesse et mobilité articulaire',
        'Coordination et équilibre',
        'Self-défense efficace',
        'Discipline et gestion du stress',
        'Esprit d\'équipe et fraternité',
    ],
    ctaTitle: 'Vous souhaitez nous rejoindre ?',
    ctaText: 'Venez à l\'essai !',
    ctaSub: '18h00 · Lun / Mer / Ven'
};

export default function AdminScheduleTab() {
    const [data, setData] = useState<ScheduleContent>(defaultSchedule);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const savedData = await cmsApi.getSettings('schedule');
            if (savedData) setData(savedData);
        } catch (error) {
            console.error('Erreur chargement Schedule:', error);
            toast.error('Erreur lors du chargement des données');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await cmsApi.updateSettings('schedule', data);
            toast.success('Section "Horaires" mise à jour avec succès');
        } catch (error) {
            toast.error('Erreur lors de la sauvegarde');
        } finally {
            setIsSaving(false);
        }
    };

    const addSession = () => {
        const newSession: ScheduleSession = {
            day: 'Nouveau jour',
            dayFr: 'XXX',
            time: 'hh:mm - hh:mm',
            location: 'DOJO',
            type: 'Type de séance',
            focus: 'Objectifs...'
        };
        setData({ ...data, sessions: [...data.sessions, newSession] });
    };

    const updateSession = (index: number, field: keyof ScheduleSession, value: string) => {
        const newSessions = [...data.sessions];
        newSessions[index] = { ...newSessions[index], [field]: value };
        setData({ ...data, sessions: newSessions });
    };

    const removeSession = (index: number) => {
        const newSessions = [...data.sessions];
        newSessions.splice(index, 1);
        setData({ ...data, sessions: newSessions });
    };

    const updateBenefit = (index: number, value: string) => {
        const newBenefits = [...data.benefits];
        newBenefits[index] = value;
        setData({ ...data, benefits: newBenefits });
    };

    const addBenefit = () => {
        setData({ ...data, benefits: [...data.benefits, 'Nouvel avantage'] });
    };

    const removeBenefit = (index: number) => {
        const newBenefits = [...data.benefits];
        newBenefits.splice(index, 1);
        setData({ ...data, benefits: newBenefits });
    };

    const updateStructureItem = (index: number, field: 'phase' | 'desc', value: string) => {
        const newStructure = [...data.structure];
        newStructure[index] = { ...newStructure[index], [field]: value };
        setData({ ...data, structure: newStructure });
    };

    const addStructureItem = () => {
        setData({ ...data, structure: [...data.structure, { phase: 'hh:mm', desc: 'Description' }] });
    };

    const removeStructureItem = (index: number) => {
        const newStructure = [...data.structure];
        newStructure.splice(index, 1);
        setData({ ...data, structure: newStructure });
    };

    if (isLoading) {
        return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-navy mb-1">Section Horaires</h2>
                    <p className="text-muted-foreground text-sm">Gérez les horaires d'entrainements et la structure d'une séance.</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Enregistrer les modifications
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Colonne 1: Textes et Structure */}
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                        <h3 className="font-semibold text-navy">Titre et Description</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Surtitre</label>
                            <Input value={data.label} onChange={e => setData({ ...data, label: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Titre Ligne 1</label>
                                <Input value={data.titleLine1} onChange={e => setData({ ...data, titleLine1: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Titre Ligne 2 (Jaune)</label>
                                <Input value={data.titleLine2} onChange={e => setData({ ...data, titleLine2: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                value={data.description}
                                onChange={e => setData({ ...data, description: e.target.value })}
                                className="h-24"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-navy">Structure d'une séance</h3>
                            <Button variant="outline" size="sm" onClick={addStructureItem}><Plus className="w-4 h-4 mr-2" /> Détailler</Button>
                        </div>
                        <Input value={data.structureTitle} onChange={e => setData({ ...data, structureTitle: e.target.value })} className="mb-4" />

                        <div className="space-y-2">
                            {data.structure.map((item, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={item.phase}
                                        onChange={e => updateStructureItem(index, 'phase', e.target.value)}
                                        className="w-1/3"
                                        placeholder="Créneau (ex: 18h-18h15)"
                                    />
                                    <Input
                                        value={item.desc}
                                        onChange={e => updateStructureItem(index, 'desc', e.target.value)}
                                        className="flex-1"
                                        placeholder="Activité"
                                    />
                                    <Button variant="ghost" size="icon" className="text-red-500 flex-shrink-0" onClick={() => removeStructureItem(index)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-navy">Avantages / Bénéfices</h3>
                            <Button variant="outline" size="sm" onClick={addBenefit}><Plus className="w-4 h-4 mr-2" /> Ajouter</Button>
                        </div>
                        <Input value={data.benefitsTitle} onChange={e => setData({ ...data, benefitsTitle: e.target.value })} className="mb-4" />

                        <div className="space-y-2">
                            {data.benefits.map((benefit, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={benefit}
                                        onChange={e => updateBenefit(index, e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button variant="ghost" size="icon" className="text-red-500 flex-shrink-0" onClick={() => removeBenefit(index)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Colonne 2: Les Séances et le CTA */}
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-navy">Séances de la semaine ({data.sessions.length})</h3>
                            <Button variant="outline" size="sm" onClick={addSession} className="gap-2">
                                <Plus className="w-4 h-4" /> Ajouter
                            </Button>
                        </div>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {data.sessions.map((session, index) => (
                                <div key={index} className="relative bg-white border rounded-xl p-4 shadow-sm group">
                                    <div className="absolute top-2 right-2">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeSession(index)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs font-medium text-gray-500">Jour complet (ex: Lundi)</label>
                                                <Input value={session.day} onChange={e => updateSession(index, 'day', e.target.value)} className="h-8" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500">Abrégé (ex: LUN)</label>
                                                <Input value={session.dayFr} onChange={e => updateSession(index, 'dayFr', e.target.value)} className="h-8 uppercase" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs font-medium text-gray-500">Heure (ex: 18h00 - 20h00)</label>
                                                <Input value={session.time} onChange={e => updateSession(index, 'time', e.target.value)} className="h-8" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500">Lieu (ex: DOJO)</label>
                                                <Input value={session.location} onChange={e => updateSession(index, 'location', e.target.value)} className="h-8 uppercase" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500">Type de séance (Titre)</label>
                                            <Input value={session.type} onChange={e => updateSession(index, 'type', e.target.value)} className="h-8" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500">Objectifs / Détails</label>
                                            <Textarea value={session.focus} onChange={e => updateSession(index, 'focus', e.target.value)} className="h-16 text-sm" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                        <h3 className="font-semibold text-navy">Bloc d'Appel à l'Action (CTA)</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Petit texte (au dessus)</label>
                            <Input value={data.ctaTitle} onChange={e => setData({ ...data, ctaTitle: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Texte Principal Exhortatif</label>
                            <Input value={data.ctaText} onChange={e => setData({ ...data, ctaText: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sous-texte (Jaune avec icône horloge)</label>
                            <Input value={data.ctaSub} onChange={e => setData({ ...data, ctaSub: e.target.value })} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
