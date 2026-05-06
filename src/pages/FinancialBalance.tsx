/**
 * @file src/pages/FinancialBalance.tsx
 * Bilan financier — Livre de compte et compte de résultat simplifié.
 * Logique comptable déléguée à src/lib/supabase/reports.ts (fetchTransactions).
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Printer, Scale, ArrowDownRight, ArrowUpRight,
  BookOpen, AlertCircle, TrendingUp, FileText,
} from 'lucide-react';

import { fetchTransactions } from '@/lib/supabase/reports';
import { useSeasons }        from '@/hooks/useSeasons';
import { groupByCategory }   from '@/lib/utils';
import { PageHeader }        from '@/components/shared/PageHeader';
import { SeasonSelector }    from '@/components/shared/SeasonSelector';
import { PrintHeader }       from '@/components/shared/PrintHeader';
import { SkeletonCards }     from '@/components/shared/LoadingSpinner';
import type { Transaction }  from '@/types';

function accountLabel(cat: string, type: 'income' | 'expense'): string {
  if (type === 'expense') {
    if (cat.toLowerCase().includes('loyer'))    return `613 - Locations (${cat})`;
    if (cat.toLowerCase().includes('matériel')) return `604 - Achats (${cat})`;
    if (cat.toLowerCase().includes('transport'))return `624 - Transports (${cat})`;
    return `628 - Frais divers (${cat})`;
  }
  if (cat.toLowerCase().includes('report')) return `110 - Report à nouveau (${cat})`;
  return `758 - Autres produits (${cat})`;
}

export default function FinancialBalance() {
  const { seasons } = useSeasons();
  const [selectedSeason, setSelectedSeason] = useState('all');

  const { data: transactions = [], isLoading: loading } = useQuery<Transaction[]>({
    queryKey: ['transactions', selectedSeason],
    queryFn:  () => fetchTransactions(selectedSeason),
  });

  const incomes  = transactions.filter((t) => t.type === 'income');
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalIncome   = incomes.reduce((s, t)  => s + t.amount, 0);
  const totalExpense  = expenses.reduce((s, t) => s + t.amount, 0);
  const globalBalance = totalIncome - totalExpense;

  const totalInscriptions = incomes.filter((t) => t.category === 'Inscription').reduce((s, t) => s + t.amount, 0);
  const totalMensualites  = incomes.filter((t) => t.category === 'Mensualité').reduce((s, t) => s + t.amount, 0);
  const autresEntrees     = totalIncome - totalInscriptions - totalMensualites;

  const expensesByCat    = groupByCategory(expenses, 'category', 'amount');
  const otherIncomesByCat = groupByCategory(
    incomes.filter((t) => !['Inscription', 'Mensualité'].includes(t.category)),
    'category', 'amount',
  );

  const seasonLabel = selectedSeason === 'all'
    ? 'Toutes les saisons'
    : seasons.find((s) => s.id === selectedSeason)?.name ?? '';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PrintHeader title="Vovinam UGB  Club" subtitle="BILAN FINANCIER DÉTAILLÉ" seasonLabel={`Saison : ${seasonLabel}`} />

        <PageHeader
          title="Bilan Financier"
          subtitle="Livre de compte et résultat d'exploitation"
          actions={
            <>
              <SeasonSelector seasons={seasons} value={selectedSeason} onValueChange={setSelectedSeason} />
              <Button onClick={() => window.print()} className="bg-navy hover:bg-navy-light text-white rounded-lg h-10 shadow-md no-print">
                <Printer className="h-4 w-4 mr-2" />Imprimer le Bilan
              </Button>
            </>
          }
        />

        {loading ? <SkeletonCards count={3} /> : (
          <>
            {/* Synthèse */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-emerald-500/10 border-emerald-500/20 shadow-none rounded-xl overflow-hidden relative">
                <div className="absolute right-0 top-0 opacity-10 p-4"><TrendingUp className="h-20 w-20 text-emerald-600" /></div>
                <CardContent className="p-6 relative z-10">
                  <p className="text-sm font-bold text-emerald-800/80 uppercase tracking-widest mb-1 flex items-center">
                    <ArrowUpRight className="h-4 w-4 mr-1" /> Total Entrées
                  </p>
                  <h3 className="text-4xl font-display font-black text-emerald-600 tracking-tight">
                    {totalIncome.toLocaleString()} <span className="text-xl">F</span>
                  </h3>
                  <div className="mt-3 text-xs font-semibold text-emerald-800/60 bg-emerald-500/10 inline-block px-2 py-1 rounded">
                    Inscriptions: {totalInscriptions.toLocaleString()} F | Mens.: {totalMensualites.toLocaleString()} F | Autres: {autresEntrees.toLocaleString()} F
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-red-500/10 border-red-500/20 shadow-none rounded-xl overflow-hidden relative">
                <div className="absolute right-0 top-0 opacity-10 p-4"><ArrowDownRight className="h-20 w-20 text-red-600" /></div>
                <CardContent className="p-6 relative z-10">
                  <p className="text-sm font-bold text-red-800/80 uppercase tracking-widest mb-1 flex items-center">
                    <ArrowDownRight className="h-4 w-4 mr-1" /> Total Sorties
                  </p>
                  <h3 className="text-4xl font-display font-black text-red-600 tracking-tight">
                    {totalExpense.toLocaleString()} <span className="text-xl">F</span>
                  </h3>
                  <div className="mt-3 text-xs font-semibold text-red-800/60 bg-red-500/10 inline-block px-2 py-1 rounded">
                    Sur {expenses.length} opérations enregistrées
                  </div>
                </CardContent>
              </Card>

              <Card className={`shadow-xl border-none rounded-xl overflow-hidden ${globalBalance >= 0 ? 'bg-navy' : 'bg-red-900'} text-white`}>
                <CardContent className="p-6">
                  <p className="text-sm font-bold text-white/70 uppercase tracking-widest mb-1 flex items-center">
                    <Scale className="h-4 w-4 mr-2" /> Solde Net
                  </p>
                  <h3 className="text-4xl font-display font-black tracking-tight mt-2">
                    {globalBalance > 0 && '+'}{globalBalance.toLocaleString()} <span className="text-xl">FCFA</span>
                  </h3>
                  <div className="mt-4 text-xs font-semibold text-white/60 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Solde {globalBalance >= 0 ? 'positif (Excédent)' : 'négatif (Déficit)'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compte de résultat */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 sm:p-8 print:shadow-none print:border-slate-300">
              <h2 className="text-xl font-display font-black text-navy uppercase tracking-widest border-b pb-4 mb-6 flex items-center">
                <BookOpen className="h-6 w-6 mr-3" /> Compte de Résultat Simplifié
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Charges */}
                <div>
                  <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
                    <h3 className="font-bold text-red-600 uppercase text-sm tracking-widest text-center">Charges d'Exploitation (Débit)</h3>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(expensesByCat).sort(([,a],[,b]) => b-a).map(([cat, amount]) => (
                      <div key={cat} className="flex justify-between text-sm border-b border-dashed border-slate-200 pb-2">
                        <span className="font-medium text-slate-700">{accountLabel(cat, 'expense')}</span>
                        <span className="font-mono font-bold text-red-600">{amount.toLocaleString()} F</span>
                      </div>
                    ))}
                    {expenses.length === 0 && <p className="text-center text-muted-foreground text-sm italic py-4">Aucune charge</p>}
                    <div className="flex justify-between text-sm border-t-2 border-slate-300 pt-3 mt-4 bg-red-50 p-2 rounded">
                      <span className="font-black text-red-800 uppercase tracking-widest text-xs">Total des Charges</span>
                      <span className="font-mono font-black text-red-700">{totalExpense.toLocaleString()} F</span>
                    </div>
                    {globalBalance > 0 && (
                      <div className="flex justify-between text-sm pt-2 p-2 bg-navy/5 rounded mt-2">
                        <span className="font-black text-navy uppercase tracking-widest text-xs">Résultat (Excédent)</span>
                        <span className="font-mono font-black text-navy">{globalBalance.toLocaleString()} F</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Produits */}
                <div>
                  <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
                    <h3 className="font-bold text-emerald-600 uppercase text-sm tracking-widest text-center">Produits d'Exploitation (Crédit)</h3>
                  </div>
                  <div className="space-y-3">
                    {totalInscriptions > 0 && (
                      <div className="flex justify-between text-sm border-b border-dashed border-slate-200 pb-2">
                        <span className="font-medium text-slate-700">701 - Droits d'adhésion</span>
                        <span className="font-mono font-bold text-emerald-600">{totalInscriptions.toLocaleString()} F</span>
                      </div>
                    )}
                    {totalMensualites > 0 && (
                      <div className="flex justify-between text-sm border-b border-dashed border-slate-200 pb-2">
                        <span className="font-medium text-slate-700">706 - Prestations (Mensualités)</span>
                        <span className="font-mono font-bold text-emerald-600">{totalMensualites.toLocaleString()} F</span>
                      </div>
                    )}
                    {Object.entries(otherIncomesByCat).map(([cat, amount]) => (
                      <div key={cat} className="flex justify-between text-sm border-b border-dashed border-slate-200 pb-2">
                        <span className="font-medium text-slate-700">{accountLabel(cat, 'income')}</span>
                        <span className="font-mono font-bold text-emerald-600">{amount.toLocaleString()} F</span>
                      </div>
                    ))}
                    {totalIncome === 0 && <p className="text-center text-muted-foreground text-sm italic py-4">Aucun produit</p>}
                    <div className="flex justify-between text-sm border-t-2 border-slate-300 pt-3 mt-4 bg-emerald-50 p-2 rounded">
                      <span className="font-black text-emerald-800 uppercase tracking-widest text-xs">Total des Produits</span>
                      <span className="font-mono font-black text-emerald-700">{totalIncome.toLocaleString()} F</span>
                    </div>
                    {globalBalance < 0 && (
                      <div className="flex justify-between text-sm pt-2 p-2 bg-red-900/10 rounded mt-2">
                        <span className="font-black text-red-900 uppercase tracking-widest text-xs">Résultat (Déficit)</span>
                        <span className="font-mono font-black text-red-900">{Math.abs(globalBalance).toLocaleString()} F</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t-4 border-navy border-double flex justify-between items-center">
                <span className="font-black text-navy uppercase tracking-widest text-sm">Totaux Équilibrés</span>
                <span className="font-mono font-black text-navy text-xl">{Math.max(totalIncome, totalExpense).toLocaleString()} F</span>
              </div>
            </div>

            {/* Livre Journal */}
            <Card className="overflow-hidden border-none shadow-lg rounded-xl print:shadow-none">
              <CardHeader className="bg-muted/30 border-b pb-4 px-6 pt-6">
                <CardTitle className="text-lg font-display font-bold text-navy">Livre Journal</CardTitle>
                <p className="text-sm text-muted-foreground">Registre chronologique détaillé</p>
              </CardHeader>
              <CardContent className="p-0">
                {transactions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-16">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" /><p>Aucune transaction</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b">
                        <tr>
                          {['Date','Type / Catégorie','Description','Membre associé','Débit (-)','Crédit (+)'].map((h) => (
                            <th key={h} className="px-6 py-4 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {transactions.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-3 whitespace-nowrap font-mono text-xs text-slate-500">{t.date.toLocaleDateString('fr-FR')}</td>
                            <td className="px-6 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${t.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                {t.category}
                              </span>
                            </td>
                            <td className="px-6 py-3 font-medium text-slate-700 min-w-[200px]">{t.description}</td>
                            <td className="px-6 py-3 text-slate-600">{t.member ?? <span className="text-slate-400 italic">Non applicable</span>}</td>
                            <td className="px-6 py-3 text-right">
                              {t.type === 'expense' ? <span className="font-mono font-bold text-red-600">-{t.amount.toLocaleString()} F</span> : '-'}
                            </td>
                            <td className="px-6 py-3 text-right">
                              {t.type === 'income' ? <span className="font-mono font-bold text-emerald-600">+{t.amount.toLocaleString()} F</span> : '-'}
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
