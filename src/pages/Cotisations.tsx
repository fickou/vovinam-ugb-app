import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Download, Trash2 } from 'lucide-react';
import vovinamLogo from '@/assets/logo-vovinam.png';
import clubLogo from '@/assets/logo.png';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface CotisationEntry {
    id: string;
    firstName: string;
    lastName: string;
}

interface CotisationList {
    id: string;
    title: string;
    entries: CotisationEntry[];
}

export default function Cotisations() {
    const [lists, setLists] = useState<CotisationList[]>([]);
    const [activeListId, setActiveListId] = useState<string | null>(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isNewListDialogOpen, setIsNewListDialogOpen] = useState(false);
    const [newListTitle, setNewListTitle] = useState('');
    const printRef = useRef<HTMLDivElement>(null);

    const activeList = lists.find(l => l.id === activeListId) || null;

    useEffect(() => {
        const saved = localStorage.getItem('vovinam_all_cotisations');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setLists(parsed);
                if (parsed.length > 0) {
                    setActiveListId(parsed[0].id);
                }
            } catch (e) { }
        }
    }, []);

    const saveAll = (newLists: CotisationList[]) => {
        setLists(newLists);
        localStorage.setItem('vovinam_all_cotisations', JSON.stringify(newLists));
    };

    const handleCreateList = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListTitle.trim()) return;

        const newList: CotisationList = {
            id: crypto.randomUUID(),
            title: newListTitle.trim(),
            entries: []
        };

        const updated = [...lists, newList];
        saveAll(updated);
        setActiveListId(newList.id);
        setNewListTitle('');
        setIsNewListDialogOpen(false);
    };

    const handleTitleSave = (newTitle: string) => {
        if (!activeList) return;
        const updated = lists.map(l =>
            l.id === activeListId ? { ...l, title: newTitle } : l
        );
        saveAll(updated);
        setIsEditingTitle(false);
    };

    const handleAddEntry = (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName.trim() || !lastName.trim() || !activeListId) return;

        const newEntry: CotisationEntry = {
            id: crypto.randomUUID(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
        };

        const updated = lists.map(l =>
            l.id === activeListId ? { ...l, entries: [...l.entries, newEntry] } : l
        );
        saveAll(updated);
        setFirstName('');
        setLastName('');
        setIsDialogOpen(false);
    };

    const handleDeleteEntry = (entryId: string) => {
        const updated = lists.map(l =>
            l.id === activeListId ? { ...l, entries: l.entries.filter(e => e.id !== entryId) } : l
        );
        saveAll(updated);
    };

    const handleDeleteList = (id: string) => {
        const updated = lists.filter(l => l.id !== id);
        saveAll(updated);
        if (activeListId === id) {
            setActiveListId(updated.length > 0 ? updated[0].id : null);
        }
    };

    const handleDownloadPNG = async () => {
        if (!printRef.current) return;

        try {
            const canvas = await html2canvas(printRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `Liste_${activeList?.title || 'Cotisations'}_${new Date().toISOString().split('T')[0]}.png`;
            link.click();
        } catch (error) {
            console.error('Erreur lors de la génération du PNG', error);
        }
    };

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
                                        <Input
                                            value={newListTitle}
                                            onChange={(e) => setNewListTitle(e.target.value)}
                                            placeholder="Ex: Ndogou 2024, Sortie Club..."
                                            autoFocus
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-navy hover:bg-navy-light">Créer la liste</Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="space-y-1">
                        {lists.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic p-2">Aucune liste créée</p>
                        ) : (
                            lists.map(list => (
                                <div key={list.id} className="group flex items-center gap-1">
                                    <Button
                                        variant={activeListId === list.id ? "secondary" : "ghost"}
                                        className={`flex-1 justify-start text-left font-medium ${activeListId === list.id ? 'bg-navy/10 text-navy' : ''}`}
                                        onClick={() => setActiveListId(list.id)}
                                    >
                                        <span className="truncate">{list.title}</span>
                                        <span className="ml-auto text-[10px] opacity-60">({list.entries.length})</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10"
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
                            <p className="text-muted-foreground max-w-xs mx-auto mb-6">Créez votre première liste de cotisation pour commencer à ajouter des membres.</p>
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
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Ajouter à "{activeList.title}"</DialogTitle>
                                            </DialogHeader>
                                            <form onSubmit={handleAddEntry} className="space-y-4 pt-4">
                                                <div className="space-y-2">
                                                    <Label>Prénom</Label>
                                                    <Input
                                                        value={firstName}
                                                        onChange={(e) => setFirstName(e.target.value)}
                                                        placeholder="Ex: Jean"
                                                        autoFocus
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Nom</Label>
                                                    <Input
                                                        value={lastName}
                                                        onChange={(e) => setLastName(e.target.value)}
                                                        placeholder="Ex: Dupont"
                                                        required
                                                    />
                                                </div>
                                                <Button type="submit" className="w-full bg-navy hover:bg-navy-light">Enregistrer</Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                    <Button onClick={handleDownloadPNG} variant="outline" className="flex-1 sm:flex-none" disabled={activeList.entries.length === 0}>
                                        <Download className="h-4 w-4 mr-2" /> Télécharger
                                    </Button>
                                </div>
                            </div>

                            {/* Zone capturée PNG */}
                            <div ref={printRef} className="bg-white p-6 sm:p-10 rounded-xl shadow-sm border overflow-hidden">
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
                                        <p className="text-gray-500 font-medium mt-1">{new Date().toLocaleDateString('fr-FR')}</p>
                                    </div>
                                    <img src={vovinamLogo} alt="Logo Vovinam" className="h-16 sm:h-24 w-auto object-contain" />
                                </div>

                                {activeList.entries.length === 0 ? (
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
                                                    <TableHead className="text-right font-bold w-16" data-html2canvas-ignore>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {activeList.entries.map((entry, index) => (
                                                    <TableRow key={entry.id} className="transition-none hover:bg-transparent">
                                                        <TableCell className="font-medium text-center">{index + 1}</TableCell>
                                                        <TableCell className="capitalize">{entry.firstName}</TableCell>
                                                        <TableCell className="font-bold uppercase">{entry.lastName}</TableCell>
                                                        <TableCell className="text-right" data-html2canvas-ignore>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteEntry(entry.id)}
                                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
