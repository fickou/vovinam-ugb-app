import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
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
    recorded_by: string | null;
    season_name?: string;
}

interface Season {
    id: string;
    name: string;
    is_active?: boolean;
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
    const { user, isAdmin, isStaff } = useAuth();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [expensesRes, seasonsRes] = await Promise.all([
                api.get('/expenses.php'),
                api.get('/seasons.php')
            ]);

            setExpenses(expensesRes || []);
            setSeasons(seasonsRes || []);

            const activeSeason = seasonsRes?.find((s: Season) => s.is_active);
            if (activeSeason) {
                setFormData(prev => ({ ...prev, season_id: activeSeason.id }));
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de charger les données',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        const activeSeason = seasons.find(s => s.is_active);
        setFormData({
            season_id: activeSeason?.id || '',
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
            amount: expense.amount.toString(),
            description: expense.description,
            category: expense.category,
            expense_date: expense.expense_date,
        });
        setIsDialogOpen(true);
    };

    const openDeleteDialog = (expense: Expense) => {
        setSelectedExpense(expense);
        setIsDeleteDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                amount: parseInt(formData.amount),
                recorded_by: user?.id
            };

            if (selectedExpense) {
                await api.put('/expenses.php', { ...payload, id: selectedExpense.id });
                toast({ title: 'Succès', description: 'Dépense modifiée avec succès' });
            } else {
                await api.post('/expenses.php', payload);
                toast({ title: 'Succès', description: 'Dépense ajoutée avec succès' });
            }
            setIsDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            toast({
                title: 'Erreur',
                description: "Impossible d'enregistrer la dépense",
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async () => {
        if (!selectedExpense) return;
        try {
            await api.delete(`/expenses.php?id=${selectedExpense.id}`);
            toast({ title: 'Succès', description: 'Dépense supprimée' });
            setIsDeleteDialogOpen(false);
            fetchData();
        } catch (error) {
            toast({
                title: 'Erreur',
                description: 'Impossible de supprimer la dépense',
                variant: 'destructive',
            });
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
                        <Plus className="h-4 w-4 mr-2" />
                        Nouvelle dépense
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-white border-red-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Label className="text-sm font-medium">Total Dépenses</Label>
                            <Wallet className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{totalAmount.toLocaleString()} FCFA</div>
                            <p className="text-xs text-muted-foreground">Sur la base des filtres actuels</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher une dépense..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Chargement...</div>
                        ) : filteredExpenses.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Aucune dépense trouvée
                            </div>
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
                                            <TableCell>{expense.season_name}</TableCell>
                                            <TableCell className="text-right font-bold text-red-600">
                                                -{expense.amount.toLocaleString()} F
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(expense)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(expense)} className="text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {selectedExpense ? 'Modifier la dépense' : 'Ajouter une dépense'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="season_id">Saison</Label>
                                <Select
                                    value={formData.season_id}
                                    onValueChange={(value) => setFormData({ ...formData, season_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir une saison" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {seasons.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Ex: Achat de matériel, Loyer salle..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Montant (FCFA)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        required
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="expense_date">Date</Label>
                                    <Input
                                        id="expense_date"
                                        type="date"
                                        required
                                        value={formData.expense_date}
                                        onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Catégorie</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir une catégorie" />
                                    </SelectTrigger>
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
                            <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-white">
                                Supprimer
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </DashboardLayout>
    );
}
