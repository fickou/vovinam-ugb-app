import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Download, Trash2, Loader2, Pencil } from 'lucide-react';
import vovinamLogo from '@/assets/logo-vovinam.png';
import clubLogo from '@/assets/logo.png';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useCotisations, useCotisationEntries } from '@/hooks/useCotisations';
import { useAuth } from '@/hooks/useAuth';
import type { CotisationList, CotisationEntryWithMember } from '@/types/cotisations';

export default function Cotisations() {
    const { user } = useAuth();
    const cotisationsHook = useCotisations();
    const lists: CotisationList[] = cotisationsHook.lists as CotisationList[];
    const { isLoadingLists, createList, updateListTitle, deleteList, isMutating } = cotisationsHook;
    
    const [activeListId, setActiveListId] = useState<string | null>(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isNewListDialogOpen, setIsNewListDialogOpen] = useState(false);
    const [newListTitle, setNewListTitle] = useState('');
    const printRef = useRef<HTMLDivElement>(null);

    // Formulaire d'ajout
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [club, setClub] = useState('');
    const [amount, setAmount] = useState<string>('');

    // Formulaire d'édition
    const [editingEntry, setEditingEntry] = useState<CotisationEntryWithMember | null>(null);
    const [editFirstName, setEditFirstName] = useState('');
    const [editLastName, setEditLastName] = useState('');
    const [editClub, setEditClub] = useState('');
    const [editAmount, setEditAmount] = useState<string>('');

    const activeList = lists.find(l => l.id === activeListId) || null;
    const cotisationEntriesHook = useCotisationEntries(activeListId);
    const entries: CotisationEntryWithMember[] = cotisationEntriesHook.entries as CotisationEntryWithMember[];
    const { isLoading: isLoadingEntries, error: errorEntries, addEntry, deleteEntry, updateEntry, isMutating: isMutatingEntries } = cotisationEntriesHook;
    const { members: _unusedMembers } = { members: [] }; // members no longer needed

    useEffect(() => {
        if (!activeListId && lists.length > 0) {
            setActiveListId(lists[0].id);
        }
    }, [lists, activeListId]);

    const handleCreateList = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListTitle.trim() || !user) return;
        const res = await createList(newListTitle.trim(), user.id);
        if (res) setActiveListId(res.id);
        setNewListTitle('');
        setIsNewListDialogOpen(false);
    };

    const handleTitleSave = async (newTitle: string) => {
        if (!activeList || !newTitle.trim()) {
            setIsEditingTitle(false);
            return;
        }
        await updateListTitle(activeList.id, newTitle.trim());
        setIsEditingTitle(false);
    };

    const handleMemberSelect = (mId: string) => {
        if (mId === '') {
            setSelectedMemberId('');
            setFirstName('');
            setLastName('');
        } else {
            const m = members.find(x => x.id === mId);
            if (m) {
                setSelectedMemberId(m.id);
                setFirstName(m.first_name);
                setLastName(m.last_name);
            }
        }
        setMemberSearch('');
    };

    const handleAddEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName.trim() || !lastName.trim() || !activeListId || !user) return;

        await addEntry({
            list_id: activeListId,
            member_id: null,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            club: club.trim(),
            amount: parseFloat(amount) || 0,
            created_by: user.id
        });

        setFirstName('');
        setLastName('');
        setClub('');
        setAmount('');
        setIsDialogOpen(false);
    };

    const handleDeleteEntry = async (entryId: string) => {
        if (window.confirm("Supprimer cette entrée ?")) {
            await deleteEntry(entryId);
        }
    };

    const openEditDialog = (entry: CotisationEntryWithMember) => {
        setEditingEntry(entry);
        setEditFirstName(entry.first_name);
        setEditLastName(entry.last_name);
        setEditClub(entry.club ?? '');
        setEditAmount(entry.amount > 0 ? String(entry.amount) : '');
    };

    const handleEditEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEntry || !editFirstName.trim() || !editLastName.trim()) return;
        await updateEntry(editingEntry.id, {
            member_id: null,
            first_name: editFirstName.trim(),
            last_name: editLastName.trim(),
            club: editClub.trim(),
            amount: parseFloat(editAmount) || 0,
        });
        setEditingEntry(null);
    };

    const handleDeleteList = async (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette liste entière ?")) {
            await deleteList(id);
            if (activeListId === id) setActiveListId(null);
        }
    };

    const handleDownloadPNG = async () => {
        if (!printRef.current) return;
        try {
            const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `Liste_${activeList?.title || 'Cotisations'}_${new Date().toISOString().split('T')[0]}.png`;
            link.click();
        } catch (error) {
            console.error('Erreur PNG', error);
        }
    };

    const totalAmount = entries.reduce((sum, e) => sum + Number(e.amount), 0);
    const formatFCFA = (n: number) => new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(n) + ' FCFA';

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row gap-6 h-full min-h-[70vh]">
                {/* Sidebar des listes */}
                <div className="w-full md:w-64 space-y-4 no-print">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-navy uppercase text-sm tracking-widest">Mes Listes</h3>
                        <Dialog open={isNewListDialogOpen} onOpenChange={setIsNewListDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-navy/10">
                                    <Plus className="h-4 w-4 text-navy" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Nouvelle Liste</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreateList} className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label>Titre de la cotisation</Label>
                                        <Input value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)} placeholder="Ex: Ndogou 2024, Sortie Club..." autoFocus required />
                                    </div>
                                    <Button type="submit" className="w-full bg-navy hover:bg-navy-light" disabled={isMutating}>Créer la liste</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="space-y-1">
                        {isLoadingLists ? (
                             <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-navy" /></div>
                        ) : lists.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic p-2">Aucune liste créée</p>
                        ) : (
                            lists.map(list => (
                                <div key={list.id} className="group flex items-center gap-1">
                                    <Button
                                        variant={activeListId === list.id ? "secondary" : "ghost"}
                                        className={`flex-1 justify-start text-left font-medium truncate ${activeListId === list.id ? 'bg-navy/10 text-navy' : ''}`}
                                        onClick={() => setActiveListId(list.id)}
                                    >
                                        <span className="truncate">{list.title}</span>
                                    </Button>
                                    <Button
                                        variant="ghost" size="icon"
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 shrink-0"
                                        onClick={() => handleDeleteList(list.id)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Contenu principal */}
                <div className="flex-1 space-y-6 min-w-0">
                    {!activeList ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-xl border border-dashed">
                            <Plus className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                            <h3 className="text-lg font-medium text-navy">Prêt à commencer ?</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto mb-6">Créez ou sélectionnez une liste de cotisation.</p>
                            <Button onClick={() => setIsNewListDialogOpen(true)} className="bg-navy">
                                <Plus className="h-4 w-4 mr-2" /> Créer une liste
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
                                <div>
                                    <h1 className="text-3xl font-display font-bold text-navy">Gestion des cotisations</h1>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="bg-navy hover:bg-navy-light flex-1 sm:flex-none">
                                                <Plus className="h-4 w-4 mr-2" /> Ajouter
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md overflow-visible">
                                            <DialogHeader>
                                                <DialogTitle>Ajouter à "{activeList.title}"</DialogTitle>
                                            </DialogHeader>
                                            <form onSubmit={handleAddEntry} className="space-y-4 pt-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Prénom</Label>
                                                        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ex: Jean" required />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Nom</Label>
                                                        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Ex: Dupont" required />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Club</Label>
                                                    <Input value={club} onChange={(e) => setClub(e.target.value)} placeholder="Ex: Vovinam UGB" />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Montant (FCFA)</Label>
                                                    <Input type="number" min="0" step="100" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ex: 5000" />
                                                </div>

                                                <Button type="submit" className="w-full bg-navy hover:bg-navy-light" disabled={isMutating}>
                                                    {isMutating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                                    Enregistrer
                                                </Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                    <Button onClick={handleDownloadPNG} variant="outline" className="flex-1 sm:flex-none" disabled={entries.length === 0}>
                                        <Download className="h-4 w-4 mr-2" /> Télécharger
                                    </Button>
                                </div>
                            </div>

                            {/* Zone capturée PNG */}
                            <div ref={printRef} className="bg-white p-6 sm:p-10 rounded-xl shadow-sm border overflow-hidden relative">
                                <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-navy">
                                    <img src={clubLogo} alt="Logo UGB" className="h-16 sm:h-24 w-auto object-contain" />
                                    <div className="text-center px-4 flex-1">
                                        {isEditingTitle ? (
                                            <div className="max-w-md mx-auto" data-html2canvas-ignore>
                                                <Input
                                                    defaultValue={activeList.title}
                                                    onBlur={(e) => handleTitleSave(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleTitleSave(e.currentTarget.value)}
                                                    className="text-center font-bold text-xl uppercase"
                                                    autoFocus
                                                />
                                            </div>
                                        ) : (
                                            <h2
                                                className="text-xl sm:text-3xl font-bold text-navy uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={() => setIsEditingTitle(true)}
                                            >
                                                {activeList.title}
                                            </h2>
                                        )}
                                        <p className="text-gray-500 font-medium mt-1">Le {new Date(activeList.created_at).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                    <img src={vovinamLogo} alt="Logo Vovinam" className="h-16 sm:h-24 w-auto object-contain" />
                                </div>

                                {isLoadingEntries ? (
                                    <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-navy" /></div>
                                ) : errorEntries ? (
                                    <div className="text-center py-12 text-destructive font-medium">
                                        Une erreur est survenue lors du chargement : {(errorEntries as any).message || 'Erreur inconnue'}
                                    </div>
                                ) : entries.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground italic">
                                        Aucune personne dans cette liste. <br /> Cliquez sur "Ajouter" pour commencer.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50 transition-none">
                                                    <TableHead className="w-16 font-bold text-center">N°</TableHead>
                                                    <TableHead className="font-bold">Prénom</TableHead>
                                                    <TableHead className="font-bold">Nom</TableHead>
                                                    <TableHead className="font-bold">Club</TableHead>
                                                    <TableHead className="font-bold text-right">Montant</TableHead>
                                                    <TableHead className="text-right font-bold w-24" data-html2canvas-ignore>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {entries.map((entry, index) => (
                                                    <TableRow key={entry.id} className="transition-none hover:bg-muted/30">
                                                        <TableCell className="font-medium text-center">{index + 1}</TableCell>
                                                        <TableCell className="capitalize">{entry.first_name}</TableCell>
                                                        <TableCell className="font-bold uppercase">{entry.last_name}</TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">{entry.club || '—'}</TableCell>
                                                        <TableCell className="text-right font-medium text-navy">{entry.amount > 0 ? formatFCFA(entry.amount) : '—'}</TableCell>
                                                        <TableCell className="text-right" data-html2canvas-ignore>
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Button
                                                                    variant="ghost" size="icon"
                                                                    onClick={() => openEditDialog(entry)}
                                                                    className="h-8 w-8 text-navy hover:bg-navy/10"
                                                                    title="Modifier"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost" size="icon"
                                                                    onClick={() => handleDeleteEntry(entry.id)}
                                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                                    title="Supprimer"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {totalAmount > 0 && (
                                                    <TableRow className="bg-emerald-50/50 hover:bg-emerald-50/50">
                                                        <TableCell colSpan={3} className="text-right font-bold text-emerald-800">TOTAL</TableCell>
                                                        <TableCell></TableCell>
                                                        <TableCell className="text-right font-bold text-emerald-700 text-lg">{formatFCFA(totalAmount)}</TableCell>
                                                        <TableCell data-html2canvas-ignore></TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Dialog de modification d'une entrée */}
            {editingEntry && (
                <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Modifier l'entrée</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditEntry} className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Prénom</Label>
                                    <Input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nom</Label>
                                    <Input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Club</Label>
                                <Input value={editClub} onChange={(e) => setEditClub(e.target.value)} placeholder="Ex: Vovinam UGB" />
                            </div>
                            <div className="space-y-2">
                                <Label>Montant (FCFA)</Label>
                                <Input type="number" min="0" step="100" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} placeholder="Ex: 5000" />
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingEntry(null)}>Annuler</Button>
                                <Button type="submit" className="flex-1 bg-navy hover:bg-navy-light" disabled={isMutatingEntries}>
                                    {isMutatingEntries && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Enregistrer
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </DashboardLayout>
    );
}
