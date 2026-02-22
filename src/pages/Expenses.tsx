import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Wallet, Search, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Expense {
    id: string;
    season_id: string;
    amount: number;
    description: string;
    category: string;
    expense_date: string;
    seasons: { name: string } | null;
}

interface Season {
    id: string;
    name: string;
    is_active: boolean;
}

export default function Expenses() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [formData, setFormData] = useState({
        season_id: '',
        amount: '',
        description: '',
        category: 'Divers',
        expense_date: new Date().toISOString().split('T')[0],
    });
    const { toast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [expensesRes, seasonsRes] = await Promise.all([
            supabase.from('expenses').select('*, seasons(name)').order('expense_date', { ascending: false }),
            supabase.from('seasons').select('*').order('start_date', { ascending: false }),
        ]);

        setExpenses((expensesRes.data as Expense[]) || []);
        const seasonsData = seasonsRes.data || [];
        setSeasons(seasonsData);
        const active = seasonsData.find(s => s.is_active);
        if (active) setFormData(prev => ({ ...prev, season_id: active.id }));
        setLoading(false);
    };

    const resetForm = () => {
        const active = seasons.find(s => s.is_active);
        setFormData({
            season_id: active?.id || '',
            amount: '',
            description: '',
            category: 'Divers',
            expense_date: new Date().toISOString().split('T')[0],
        });
        setSelectedExpense(null);
    };

    const openEditDialog = (expense: Expense) => {
        setSelectedExpense(expense);
        setFormData({
            season_id: expense.season_id,
            amount: String(expense.amount),
            description: expense.description,
            category: expense.category,
            expense_date: expense.expense_date,
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            season_id: formData.season_id,
            amount: parseInt(formData.amount),
            description: formData.description,
            category: formData.category,
            expense_date: formData.expense_date,
            recorded_by: user?.id || null,
        };

        if (selectedExpense) {
            const { error } = await supabase.from('expenses').update(payload).eq('id', selectedExpense.id);
            if (error) { toast({ title: 'Erreur', description: 'Impossible de modifier la dépense', variant: 'destructive' }); return; }
            toast({ title: 'Succès', description: 'Dépense modifiée avec succès' });
        } else {
            const { error } = await supabase.from('expenses').insert(payload);
            if (error) { toast({ title: 'Erreur', description: 'Impossible d\'ajouter la dépense', variant: 'destructive' }); return; }
            toast({ title: 'Succès', description: 'Dépense ajoutée avec succès' });
        }
        setIsDialogOpen(false);
        resetForm();
        fetchData();
    };

    const handleDelete = async () => {
        if (!selectedExpense) return;
        const { error } = await supabase.from('expenses').delete().eq('id', selectedExpense.id);
        if (error) {
            toast({ title: 'Erreur', description: 'Impossible de supprimer la dépense', variant: 'destructive' });
        } else {
            toast({ title: 'Succès', description: 'Dépense supprimée' });
            setIsDeleteDialogOpen(false);
            fetchData();
        }
    };

    const filteredExpenses = expenses.filter(exp =>
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-navy">Gestion des Dépenses</h1>
                        <p className="text-muted-foreground">Suivez toutes les sorties d'argent du club</p>
                    </div>
                    <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-navy hover:bg-navy-light">
                        <Plus className="h-4 w-4 mr-2" />Nouvelle dépense
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-white border-red-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Label className="text-sm font-medium">Total Dépenses</Label>
                            <Wallet className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <div className="px-6 pb-4">
                            {loading ? (
                                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                            ) : (
                                <>
                                    <div className="text-2xl font-bold text-red-600">
                                        {totalAmount.toLocaleString('fr-FR')} FCFA
                                    </div>
                                    <p className="text-xs text-muted-foreground">Sur la base des filtres actuels</p>
                                </>
                            )}
                        </div>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Rechercher une dépense..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Chargement...</div>
                        ) : filteredExpenses.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">Aucune dépense trouvée</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Catégorie</TableHead>
                                        <TableHead>Saison</TableHead>
                                        <TableHead className="text-right">Montant</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredExpenses.map((expense) => (
                                        <TableRow key={expense.id}>
                                            <TableCell>{new Date(expense.expense_date).toLocaleDateString('fr-FR')}</TableCell>
                                            <TableCell className="font-medium">{expense.description}</TableCell>
                                            <TableCell>{expense.category}</TableCell>
                                            <TableCell>{expense.seasons?.name || '-'}</TableCell>
                                            <TableCell className="text-right font-bold text-red-600">-{expense.amount.toLocaleString()} F</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(expense)}><Pencil className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => { setSelectedExpense(expense); setIsDeleteDialogOpen(true); }} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{selectedExpense ? 'Modifier la dépense' : 'Ajouter une dépense'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="season_id">Saison</Label>
                                <Select value={formData.season_id} onValueChange={(v) => setFormData({ ...formData, season_id: v })}>
                                    <SelectTrigger><SelectValue placeholder="Choisir une saison" /></SelectTrigger>
                                    <SelectContent>{seasons.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input id="description" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Ex: Achat de matériel, Loyer salle..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Montant (FCFA)</Label>
                                    <Input id="amount" type="number" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="expense_date">Date</Label>
                                    <Input id="expense_date" type="date" required value={formData.expense_date} onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Catégorie</Label>
                                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Matériel">Matériel</SelectItem>
                                        <SelectItem value="Loyer">Loyer / Salle</SelectItem>
                                        <SelectItem value="Événement">Événement</SelectItem>
                                        <SelectItem value="Transport">Transport</SelectItem>
                                        <SelectItem value="Communication">Communication</SelectItem>
                                        <SelectItem value="Divers">Divers</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full bg-navy hover:bg-navy-light text-white">
                                {selectedExpense ? 'Modifier' : 'Ajouter'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                            <AlertDialogDescription>Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-white">Supprimer</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </DashboardLayout>
    );
}
