import { useState, useEffect } from 'react';
import { cmsApi } from '@/lib/cms';
import { ContactContent, ContactInfo } from '@/types/cms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Trash2, Plus, GripVertical } from 'lucide-react';

const defaultContact: ContactContent = {
    label: 'Contact & Infos',
    titleLine1: 'Venez nous',
    titleLine2: 'Rejoindre',
    description: 'La meilleure façon de découvrir le Vovinam est de venir essayer. Présentez-vous directement au DOJO lors d\'une séance ou contactez-nous via WhatsApp.',
    infoCards: [
        { iconName: 'MapPin', label: 'Adresse', value: 'Université Gaston Berger', sub: 'Route de Ngallèle, Saint-Louis, Sénégal', color: '#c0392b' },
        { iconName: 'Clock', label: 'Entraînements', value: 'Lun · Mer · Ven', sub: '18h00 – 20h00 · DOJO Universitaire', color: '#e5a800' }
    ],
    whatsappNumber: '+221 78 282 96 73',
    whatsappMessage: 'Bonjour, je souhaite rejoindre le club Vovinam UGB. Pouvez-vous me donner plus d\'informations ?',
    faqLabel: 'Questions fréquentes',
    faqs: [
        { q: 'Faut-il une expérience préalable ?', a: 'Non. Le Vovinam accueille les débutants à n\'importe quel âge. La première séance est gratuite et sans obligation.' },
        { q: 'Quel équipement faut-il apporter ?', a: 'Pour commencer, une tenue de sport suffit. L\'uniforme Vovinam (Võ phục) peut être acquis après votre inscription.' },
        { q: 'Y a-t-il des compétitions ?', a: 'Oui. Des tournois inter-universitaires sont organisés régionalement. La participation est encouragée mais non obligatoire.' },
        { q: 'Quelle est la cotisation ?', a: 'La cotisation est adaptée au contexte universitaire. Renseignez-vous directement auprès de nos encadrants lors d\'une séance.' },
    ],
    finalCtaLabel: 'Prêt à commencer ?',
    finalCtaTitle: 'Première séance gratuite',
    finalCtaDesc: 'Pas besoin d\'expérience préalable. Venez simplement en tenue de sport au DOJO lors d\'une de nos séances — Lundi, Mercredi ou Vendredi à 18h00.',
    finalCtaButton: 'Nous écrire'
};

export default function AdminContactTab() {
    const [data, setData] = useState<ContactContent>(defaultContact);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const savedData = await cmsApi.getSettings('contact');
            if (savedData) {
                // S'assurer que infoCards existe pour éviter les crashs si anciennes données
                if (!savedData.infoCards) savedData.infoCards = defaultContact.infoCards;
                setData(savedData);
            }
        } catch (error) {
            console.error('Erreur chargement Contact:', error);
            toast.error('Erreur lors du chargement des données');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await cmsApi.updateSettings('contact', data);
            toast.success('Section "Contact" mise à jour avec succès');
        } catch (error) {
            toast.error('Erreur lors de la sauvegarde');
        } finally {
            setIsSaving(false);
        }
    };

    const updateInfoCard = (index: number, field: keyof ContactInfo, value: string) => {
        const newCards = [...data.infoCards];
        if (!newCards[index]) {
            newCards[index] = { iconName: 'MapPin', label: '', value: '', sub: '', color: '#ffffff' };
        }
        newCards[index] = { ...newCards[index], [field]: value };
        setData({ ...data, infoCards: newCards });
    };

    const addFaq = () => {
        setData({ ...data, faqs: [...data.faqs, { q: 'Nouvelle question', a: 'Réponse...' }] });
    };

    const updateFaq = (index: number, field: 'q' | 'a', value: string) => {
        const newFaqs = [...data.faqs];
        newFaqs[index] = { ...newFaqs[index], [field]: value };
        setData({ ...data, faqs: newFaqs });
    };

    const removeFaq = (index: number) => {
        const newFaqs = [...data.faqs];
        newFaqs.splice(index, 1);
        setData({ ...data, faqs: newFaqs });
    };

    if (isLoading) {
        return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-navy mb-1">Section Contact & FAQ</h2>
                    <p className="text-muted-foreground text-sm">Gérez les coordonnées, le lien WhatsApp et les questions fréquentes.</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Enregistrer les modifications
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Colonne 1: Textes et Coordonnées */}
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                        <h3 className="font-semibold text-navy">En-tête de section</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Surtitre</label>
                            <Input value={data.label} onChange={e => setData({ ...data, label: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Titre 1</label>
                                <Input value={data.titleLine1} onChange={e => setData({ ...data, titleLine1: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Titre 2 (Jaune)</label>
                                <Input value={data.titleLine2} onChange={e => setData({ ...data, titleLine2: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                value={data.description}
                                onChange={e => setData({ ...data, description: e.target.value })}
                                className="h-20"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                        <h3 className="font-semibold text-navy">Coordonnées</h3>

                        <div className="space-y-4 pb-4 border-b">
                            <h4 className="text-sm font-semibold text-gray-500">Cartouche Adresse (Rouge)</h4>
                            <div className="space-y-2">
                                <Input value={data.infoCards?.[0]?.label || ''} onChange={e => updateInfoCard(0, 'label', e.target.value)} placeholder="Titre (ex: Adresse)" />
                            </div>
                            <div className="space-y-2">
                                <Input value={data.infoCards?.[0]?.value || ''} onChange={e => updateInfoCard(0, 'value', e.target.value)} placeholder="Value (ex: Université Gaston Berger)" className="font-medium" />
                            </div>
                            <div className="space-y-2">
                                <Input value={data.infoCards?.[0]?.sub || ''} onChange={e => updateInfoCard(0, 'sub', e.target.value)} placeholder="Sous-titre" />
                            </div>
                        </div>

                        <div className="space-y-4 pb-4 border-b">
                            <h4 className="text-sm font-semibold text-gray-500">Cartouche Horaires Résumés (Jaune)</h4>
                            <div className="space-y-2">
                                <Input value={data.infoCards?.[1]?.label || ''} onChange={e => updateInfoCard(1, 'label', e.target.value)} placeholder="Titre (ex: Entraînements)" />
                            </div>
                            <div className="space-y-2">
                                <Input value={data.infoCards?.[1]?.value || ''} onChange={e => updateInfoCard(1, 'value', e.target.value)} placeholder="Valeur courte" className="font-medium" />
                            </div>
                            <div className="space-y-2">
                                <Input value={data.infoCards?.[1]?.sub || ''} onChange={e => updateInfoCard(1, 'sub', e.target.value)} placeholder="Sous-titre" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-[#25D366]">Bouton WhatsApp</h4>
                            <div className="space-y-2">
                                <label className="text-xs">Numéro de téléphone (avec indicatif)</label>
                                <Input value={data.whatsappNumber} onChange={e => setData({ ...data, whatsappNumber: e.target.value })} placeholder="+221 70 000 00 00" />
                                <p className="text-xs text-muted-foreground">Format avec le + et nettoyage des espaces auto</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs">Message pré-rempli sur WhatsApp</label>
                                <Textarea
                                    value={data.whatsappMessage}
                                    onChange={e => setData({ ...data, whatsappMessage: e.target.value })}
                                    className="h-16 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Colonne 2: FAQ et CTA de fin */}
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-navy">Foire Aux Questions ({data.faqs.length})</h3>
                            <Button variant="outline" size="sm" onClick={addFaq} className="gap-2">
                                <Plus className="w-4 h-4" /> Ajouter
                            </Button>
                        </div>

                        <div className="space-y-2 mb-4">
                            <label className="text-sm font-medium">Titre de la section FAQ</label>
                            <Input value={data.faqLabel} onChange={e => setData({ ...data, faqLabel: e.target.value })} />
                        </div>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {data.faqs.map((faq, index) => (
                                <div key={index} className="relative bg-white border rounded-xl p-4 shadow-sm group pl-8">
                                    <div className="absolute left-2 top-10 text-gray-300">
                                        <GripVertical className="w-5 h-5" />
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeFaq(index)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-medium text-[#c0392b]">Question</label>
                                            <Input
                                                value={faq.q}
                                                onChange={e => updateFaq(index, 'q', e.target.value)}
                                                className="font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500">Réponse</label>
                                            <Textarea
                                                value={faq.a}
                                                onChange={e => updateFaq(index, 'a', e.target.value)}
                                                className="h-20 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border space-y-4">
                        <h3 className="font-semibold text-navy">Bannière Finale (Gros Appel à l'Action)</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Surtitre (Jaune, petit)</label>
                            <Input value={data.finalCtaLabel} onChange={e => setData({ ...data, finalCtaLabel: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Gros Titre principal</label>
                            <Input value={data.finalCtaTitle} onChange={e => setData({ ...data, finalCtaTitle: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                value={data.finalCtaDesc}
                                onChange={e => setData({ ...data, finalCtaDesc: e.target.value })}
                                className="h-24"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Texte du bouton</label>
                            <Input value={data.finalCtaButton} onChange={e => setData({ ...data, finalCtaButton: e.target.value })} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
