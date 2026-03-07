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

export default function Cotisations() {
    const [entries, setEntries] = useState<CotisationEntry[]>([]);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem('cotisations_list');
        if (saved) {
            try {
                setEntries(JSON.parse(saved));
            } catch (e) { }
        }
    }, []);

    const saveEntries = (newEntries: CotisationEntry[]) => {
        setEntries(newEntries);
        localStorage.setItem('cotisations_list', JSON.stringify(newEntries));
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName.trim() || !lastName.trim()) return;

        const newEntry: CotisationEntry = {
            id: crypto.randomUUID(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
        };
        saveEntries([...entries, newEntry]);
        setFirstName('');
        setLastName('');
        setIsDialogOpen(false);
    };

    const handleDelete = (id: string) => {
        saveEntries(entries.filter(e => e.id !== id));
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
            link.download = `Liste_Cotisations_${new Date().toISOString().split('T')[0]}.png`;
            link.click();
        } catch (error) {
            console.error('Erreur lors de la génération du PNG', error);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-navy">Cotisations NDOGOU</h1>
                        <p className="text-muted-foreground">La liste ne contient que le prénom et le nom</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-navy hover:bg-navy-light flex-1 sm:flex-none">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Ajouter à la liste</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAdd} className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">Prénom</Label>
                                        <Input
                                            id="firstName"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="Ex: Jean"
                                            autoFocus
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Nom</Label>
                                        <Input
                                            id="lastName"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Ex: Dupont"
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-navy hover:bg-navy-light">
                                        Enregistrer
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <Button onClick={handleDownloadPNG} variant="outline" className="flex-1 sm:flex-none" disabled={entries.length === 0}>
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                        </Button>
                    </div>
                </div>

                {/* Zone capturée pour le téléchargement PNG */}
                <div
                    ref={printRef}
                    className="bg-white p-6 sm:p-10 rounded-xl shadow-sm border"
                >
                    {/* En-tête avec les logos */}
                    <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-navy">
                        <img src={clubLogo} alt="Logo UGB" className="h-16 sm:h-24 w-auto object-contain" />
                        <div className="text-center px-4">
                            <h2 className="text-xl sm:text-3xl font-bold text-navy uppercase tracking-wider">Cotisations NDOGOU</h2>
                            <p className="text-gray-500 font-medium mt-1">{new Date().toLocaleDateString('fr-FR')}</p>
                        </div>
                        <img src={vovinamLogo} alt="Logo Vovinam" className="h-16 sm:h-24 w-auto object-contain" />
                    </div>

                    {/* Tableau */}
                    {entries.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground italic">
                            Aucune personne dans la liste. <br /> Cliquez sur "Ajouter" pour commencer.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-16 font-bold text-center">N°</TableHead>
                                    <TableHead className="font-bold">Prénom</TableHead>
                                    <TableHead className="font-bold">Nom</TableHead>
                                    <TableHead className="text-right font-bold w-16" data-html2canvas-ignore>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entries.map((entry, index) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="font-medium text-center">{index + 1}</TableCell>
                                        <TableCell className="capitalize">{entry.firstName}</TableCell>
                                        <TableCell className="font-bold uppercase">{entry.lastName}</TableCell>
                                        <TableCell className="text-right" data-html2canvas-ignore>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(entry.id)}
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
