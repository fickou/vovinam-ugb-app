import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, Scale, ArrowDownRight, ArrowUpRight, BookOpen, AlertCircle, TrendingUp, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Season {
    id: string;
    name: string;
}

interface Transaction {
    id: string;
    date: Date;
    type: 'income' | 'expense';
    category: string;
    description: string;
    amount: number;
    member?: string | null;
}

export default function FinancialBalance() {
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [selectedSeason, setSelectedSeason] = useState<string>('all');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.from('seasons').select('id, name').order('start_date', { ascending: false }).then(({ data }) => {
            setSeasons(data || []);
        });
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [selectedSeason]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            let paymentsQuery = supabase.from('payments').select('id, payment_date, amount, payment_type, members(first_name, last_name)').eq('status', 'VALIDATED');
            let expensesQuery = supabase.from('expenses').select('id, expense_date, amount, category, description');

            if (selectedSeason !== 'all') {
                paymentsQuery = paymentsQuery.eq('season_id', selectedSeason);
                expensesQuery = expensesQuery.eq('season_id', selectedSeason);
            }

            const [paymentsRes, expensesRes] = await Promise.all([paymentsQuery, expensesQuery]);
            
            const transList: Transaction[] = [];

            if (paymentsRes.data) {
                paymentsRes.data.forEach((p: any) => {
                    const typeLabel = p.payment_type === 'monthly' ? 'Mensualité' : p.payment_type === 'registration' ? 'Inscription' : 'Autre';
                    transList.push({
                        id: `p_${p.id}`,
                        date: new Date(p.payment_date),
                        type: 'income',
                        category: typeLabel,
                        description: `Paiement ${typeLabel.toLowerCase()}`,
                        amount: p.amount,
                        member: p.members ? `${p.members.first_name} ${p.members.last_name}` : null
                    });
                });
            }

            if (expensesRes.data) {
                expensesRes.data.forEach((e: any) => {
                    const isIncome = e.amount < 0;
                    transList.push({
                        id: `e_${e.id}`,
                        date: new Date(e.expense_date),
                        type: isIncome ? 'income' : 'expense',
                        category: e.category || (isIncome ? 'Recette Diverse' : 'Dépense'),
                        description: e.description || (isIncome ? 'Recette' : 'Dépense générale'),
                        amount: Math.abs(e.amount)
                    });
                });
            }

            transList.sort((a, b) => b.date.getTime() - a.date.getTime());
            setTransactions(transList);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const globalBalance = totalIncome - totalExpense;

    // Sub-categories for Incomes
    const totalInscriptions = transactions.filter(t => t.category === 'Inscription').reduce((s, t) => s + t.amount, 0);
    const totalMensualites = transactions.filter(t => t.category === 'Mensualité').reduce((s, t) => s + t.amount, 0);
    const autresEntrees = totalIncome - totalInscriptions - totalMensualites;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Print Header */}
                <div className="hidden print:block mb-8 text-center pt-8 border-b pb-8">
                    <h1 className="text-3xl font-display font-black uppercase tracking-tighter text-navy mb-2">Vovinam UGB Sporting Club</h1>
                    <div className="inline-block px-4 py-1 bg-navy text-white font-bold text-lg mb-4 rounded-md">BILAN FINANCIER DÉTAILLÉ</div>
                    <p className="text-sm font-semibold">Saison : {selectedSeason === 'all' ? 'Toutes les saisons' : seasons.find(s => s.id === selectedSeason)?.name}</p>
                    <p className="text-xs text-muted-foreground mt-2 italic">Document généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-navy flex items-center gap-3">
                            <Scale className="h-8 w-8 text-navy" />
                            Bilan Financier
                        </h1>
                        <p className="text-muted-foreground mt-1">Livre de compte et résultat d'exploitation</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 no-print w-full sm:w-auto">
                        <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                            <SelectTrigger className="w-full sm:w-[180px] rounded-lg h-10 border-2 border-navy/10"><SelectValue placeholder="Toutes les saisons" /></SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">Toutes les saisons confondues</SelectItem>
                                {seasons.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button onClick={() => window.print()} className="w-full xl:w-auto bg-navy hover:bg-navy-light text-white rounded-lg h-10 shadow-md">
                            <Printer className="h-4 w-4 mr-2" />Imprimer le Bilan
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <Card key={i} className="animate-pulse border-none shadow-sm rounded-xl h-32 bg-white/50" />
                        ))}
                    </div>
                ) : (
                    <>
                        {/* SYNTHESE DE HAUT DE PAGE */}
                        <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-4 print:gap-4">
                            <Card className="bg-emerald-500/10 border-emerald-500/20 shadow-none print:border-none print:shadow-none print:bg-none rounded-xl overflow-hidden relative">
                                <div className="absolute right-0 top-0 opacity-10 p-4"><TrendingUp className="h-20 w-20 text-emerald-600" /></div>
                                <CardContent className="p-6 relative z-10">
                                    <p className="text-sm font-bold text-emerald-800/80 uppercase tracking-widest mb-1 flex items-center">
                                        <ArrowUpRight className="h-4 w-4 mr-1" /> Total Entrées
                                    </p>
                                    <h3 className="text-3xl lg:text-4xl font-display font-black text-emerald-600 tracking-tight">
                                        {totalIncome.toLocaleString()} <span className="text-xl font-bold">F</span>
                                    </h3>
                                    <div className="mt-3 text-xs font-semibold text-emerald-800/60 bg-emerald-500/10 inline-block px-2 py-1 rounded">
                                        Inscriptions: {totalInscriptions.toLocaleString()} F | Mens.: {totalMensualites.toLocaleString()} F | Autres: {autresEntrees.toLocaleString()} F
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-red-500/10 border-red-500/20 shadow-none print:border-none print:shadow-none print:bg-none rounded-xl overflow-hidden relative">
                                <div className="absolute right-0 top-0 opacity-10 p-4"><ArrowDownRight className="h-20 w-20 text-red-600" /></div>
                                <CardContent className="p-6 relative z-10">
                                    <p className="text-sm font-bold text-red-800/80 uppercase tracking-widest mb-1 flex items-center">
                                        <ArrowDownRight className="h-4 w-4 mr-1" /> Total Sorties
                                    </p>
                                    <h3 className="text-3xl lg:text-4xl font-display font-black text-red-600 tracking-tight">
                                        {totalExpense.toLocaleString()} <span className="text-xl font-bold">F</span>
                                    </h3>
                                    <div className="mt-3 text-xs font-semibold text-red-800/60 bg-red-500/10 inline-block px-2 py-1 rounded">
                                        Sur {transactions.filter(t => t.type === 'expense').length} opérations enregistrées
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className={`shadow-xl border-none print:border-none print:shadow-none print:bg-none rounded-xl overflow-hidden relative ${globalBalance >= 0 ? 'bg-navy text-white' : 'bg-red-900 text-white'}`}>
                                <CardContent className="p-6">
                                    <p className="text-sm font-bold text-white/70 uppercase tracking-widest mb-1 flex items-center">
                                        <Scale className="h-4 w-4 mr-2" /> Solde Net d'Exploitation
                                    </p>
                                    <h3 className="text-3xl lg:text-4xl font-display font-black tracking-tight mt-2">
                                        {globalBalance > 0 && '+'}{globalBalance.toLocaleString()} <span className="text-xl font-bold">FCFA</span>
                                    </h3>
                                    <div className="mt-4 text-xs font-semibold text-white/60 flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" /> Solde {globalBalance >= 0 ? 'positif (Excédent)' : 'négatif (Déficit)'}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* COMPTE DE RÉSULTAT */}
                        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 sm:p-8 mt-8 mb-8 print:shadow-none print:border-slate-300">
                            <h2 className="text-xl font-display font-black text-navy uppercase tracking-widest border-b pb-4 mb-6 flex items-center">
                                <BookOpen className="h-6 w-6 mr-3" />
                                Compte de Résultat Simplifié
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 print:gap-x-12">
                                {/* GAUCHE : CHARGES (Emplois) */}
                                <div>
                                    <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
                                        <h3 className="font-bold text-red-600 uppercase text-sm tracking-widest text-center">Charges d'Exploitation (Débit)</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {(() => {
                                            const expenses = transactions.filter(t => t.type === 'expense');
                                            const byCat = expenses.reduce((acc, curr) => {
                                                acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                                                return acc;
                                            }, {} as Record<string, number>);

                                            return Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
                                                <div key={cat} className="flex justify-between items-center text-sm border-b border-dashed border-slate-200 pb-2">
                                                    <span className="font-medium text-slate-700">
                                                        {cat.toLowerCase().includes('loyer') ? `613 - Locations (${cat})` : 
                                                         cat.toLowerCase().includes('matériel') ? `604 - Achats d'études et de prestations (${cat})` :
                                                         cat.toLowerCase().includes('transport') ? `624 - Transports et déplacements (${cat})` :
                                                         `628 - Frais divers (${cat})`}
                                                    </span>
                                                    <span className="font-mono font-bold text-red-600">{amount.toLocaleString()} F</span>
                                                </div>
                                            ));
                                        })()}
                                        
                                        {/* Ligne vide si pas de charges */}
                                        {transactions.filter(t => t.type === 'expense').length === 0 && (
                                            <div className="text-center text-muted-foreground text-sm italic py-4">Aucune charge enregistrée</div>
                                        )}
                                        
                                        {/* Total Charges */}
                                        <div className="flex justify-between items-center text-sm border-t-2 border-slate-300 pt-3 mt-4 bg-red-50 p-2 rounded">
                                            <span className="font-black text-red-800 uppercase tracking-widest text-xs">Total des Charges</span>
                                            <span className="font-mono font-black text-red-700">{totalExpense.toLocaleString()} F</span>
                                        </div>

                                        {/* Resultat de l'exercice (si benefice, il va au debit pour equilibrer) */}
                                        {globalBalance > 0 && (
                                            <div className="flex justify-between items-center text-sm pt-2 p-2 bg-navy/5 rounded mt-2">
                                                <span className="font-black text-navy uppercase tracking-widest text-xs">Résultat (Excédent)</span>
                                                <span className="font-mono font-black text-navy">{globalBalance.toLocaleString()} F</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* DROITE : PRODUITS (Ressources) */}
                                <div>
                                    <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
                                        <h3 className="font-bold text-emerald-600 uppercase text-sm tracking-widest text-center">Produits d'Exploitation (Crédit)</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className={`flex justify-between items-center text-sm border-b border-dashed border-slate-200 pb-2 ${totalInscriptions === 0 ? 'hidden' : ''}`}>
                                            <span className="font-medium text-slate-700">701 - Droits d'adhésion (Inscriptions)</span>
                                            <span className="font-mono font-bold text-emerald-600">{totalInscriptions.toLocaleString()} F</span>
                                        </div>
                                        <div className={`flex justify-between items-center text-sm border-b border-dashed border-slate-200 pb-2 ${totalMensualites === 0 ? 'hidden' : ''}`}>
                                            <span className="font-medium text-slate-700">706 - Prestations de services (Mensualités)</span>
                                            <span className="font-mono font-bold text-emerald-600">{totalMensualites.toLocaleString()} F</span>
                                        </div>
                                        {(() => {
                                            const otherIncomesList = transactions.filter(t => t.type === 'income' && t.category !== 'Inscription' && t.category !== 'Mensualité');
                                            const byCat = otherIncomesList.reduce((acc, curr) => {
                                                acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                                                return acc;
                                            }, {} as Record<string, number>);

                                            return Object.entries(byCat).map(([cat, amount]) => (
                                                <div key={cat} className="flex justify-between items-center text-sm border-b border-dashed border-slate-200 pb-2">
                                                    <span className="font-medium text-slate-700">
                                                        {cat.toLowerCase().includes('report') ? `110 - Report à nouveau (${cat})` : 
                                                         `758 - Autres produits de gestion (${cat})`}
                                                    </span>
                                                    <span className="font-mono font-bold text-emerald-600">{amount.toLocaleString()} F</span>
                                                </div>
                                            ));
                                        })()}

                                        {/* Ligne vide si pas de produits */}
                                        {totalIncome === 0 && (
                                            <div className="text-center text-muted-foreground text-sm italic py-4">Aucun produit enregistré</div>
                                        )}

                                        {/* Total Produits */}
                                        <div className="flex justify-between items-center text-sm border-t-2 border-slate-300 pt-3 mt-4 bg-emerald-50 p-2 rounded">
                                            <span className="font-black text-emerald-800 uppercase tracking-widest text-xs">Total des Produits</span>
                                            <span className="font-mono font-black text-emerald-700">{totalIncome.toLocaleString()} F</span>
                                        </div>

                                        {/* Resultat de l'exercice (si perte, il va au credit pour equilibrer) */}
                                        {globalBalance < 0 && (
                                            <div className="flex justify-between items-center text-sm pt-2 p-2 bg-red-900/10 rounded mt-2">
                                                <span className="font-black text-red-900 uppercase tracking-widest text-xs">Résultat (Déficit)</span>
                                                <span className="font-mono font-black text-red-900">{Math.abs(globalBalance).toLocaleString()} F</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Ligne d'équilibre générale comptable */}
                            <div className="mt-8 pt-4 border-t-4 border-navy border-double flex justify-between items-center">
                                <span className="font-black text-navy uppercase tracking-widest text-sm">Totaux Équilibrés</span>
                                <span className="font-mono font-black text-navy text-xl">
                                    {Math.max(totalIncome, totalExpense).toLocaleString()} F
                                </span>
                            </div>
                        </div>

                        {/* LISTE DÉTAILLÉE DES OPÉRATIONS (LIVRE JOURNAL) */}
                        <Card className="overflow-hidden border-none shadow-lg rounded-xl print:shadow-none print:border-none">
                            <CardHeader className="bg-muted/30 border-b pb-4 px-6 pt-6">
                                <CardTitle className="text-lg font-display font-bold text-navy">Livre Journal</CardTitle>
                                <p className="text-sm text-muted-foreground">Registre chronologique détaillé</p>
                            </CardHeader>
                            <CardContent className="p-0">
                                {transactions.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-16">
                                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                        <p>Aucune transaction enregistrée</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b">
                                                <tr>
                                                    <th className="px-6 py-4 whitespace-nowrap">Date</th>
                                                    <th className="px-6 py-4">Type / Catégorie</th>
                                                    <th className="px-6 py-4">Description</th>
                                                    <th className="px-6 py-4">Membre associé</th>
                                                    <th className="px-6 py-4 text-right">Débit (-)</th>
                                                    <th className="px-6 py-4 text-right">Crédit (+)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {transactions.map((t) => (
                                                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-3 whitespace-nowrap font-mono text-xs text-slate-500">
                                                            {t.date.toLocaleDateString('fr-FR')}
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${t.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                                {t.category}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3 font-medium text-slate-700 min-w-[200px]">
                                                            {t.description}
                                                        </td>
                                                        <td className="px-6 py-3 text-slate-600">
                                                            {t.member ? t.member : <span className="text-slate-400 italic">Non applicable</span>}
                                                        </td>
                                                        <td className="px-6 py-3 text-right">
                                                            {t.type === 'expense' ? (
                                                                <span className="font-mono font-bold text-red-600">-{t.amount.toLocaleString()} F</span>
                                                            ) : '-'}
                                                        </td>
                                                        <td className="px-6 py-3 text-right">
                                                            {t.type === 'income' ? (
                                                                <span className="font-mono font-bold text-emerald-600">+{t.amount.toLocaleString()} F</span>
                                                            ) : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
