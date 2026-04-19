import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { BarChart3, TrendingUp, Users, CreditCard, Printer, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Season { id: string; name: string; }

interface ReportData {
  totalMembers: number;
  activeMembers: number;
  totalPayments: number;
  registrationPayments: number;
  monthlyPayments: number;
  otherPayments: number;
  otherIncomes: number;
  totalExpenses: number;
  netBalance: number;
  paymentsByMethod: Record<string, number>;
}

export default function Reports() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [reportData, setReportData] = useState<ReportData>({
    totalMembers: 0, activeMembers: 0, totalPayments: 0,
    registrationPayments: 0, monthlyPayments: 0, otherPayments: 0,
    otherIncomes: 0,
    totalExpenses: 0, netBalance: 0, paymentsByMethod: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('seasons').select('id, name').order('start_date', { ascending: false }).then(({ data }) => {
      setSeasons(data || []);
    });
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [selectedSeason]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [membersRes, paymentsQuery, expensesQuery] = await Promise.all([
        supabase.from('members').select('id, status'),
        selectedSeason === 'all'
          ? supabase.from('payments').select('amount, payment_type, payment_method').eq('status', 'VALIDATED')
          : supabase.from('payments').select('amount, payment_type, payment_method').eq('status', 'VALIDATED').eq('season_id', selectedSeason),
        selectedSeason === 'all'
          ? supabase.from('expenses').select('amount')
          : supabase.from('expenses').select('amount').eq('season_id', selectedSeason),
      ]);

      const members = membersRes.data || [];
      const payments = paymentsQuery.data || [];
      const expenses = expensesQuery.data || [];

      const registrationPayments = payments.filter(p => p.payment_type === 'registration').reduce((s, p) => s + p.amount, 0);
      const monthlyPayments = payments.filter(p => p.payment_type === 'monthly').reduce((s, p) => s + p.amount, 0);
      const otherPayments = payments.filter(p => !['registration', 'monthly'].includes(p.payment_type)).reduce((s, p) => s + p.amount, 0);
      
      const realExpenses = expenses.filter(e => e.amount > 0).reduce((s, e) => s + e.amount, 0);
      const otherIncomes = expenses.filter(e => e.amount < 0).reduce((s, e) => s + Math.abs(e.amount), 0);

      const totalPayments = payments.reduce((s, p) => s + p.amount, 0) + otherIncomes;
      const totalExpenses = realExpenses;

      const paymentsByMethod: Record<string, number> = {};
      payments.forEach(p => {
        paymentsByMethod[p.payment_method] = (paymentsByMethod[p.payment_method] || 0) + p.amount;
      });

      setReportData({
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === 'active').length,
        totalPayments,
        registrationPayments,
        monthlyPayments,
        otherPayments,
        otherIncomes,
        totalExpenses,
        netBalance: totalPayments - totalExpenses,
        paymentsByMethod,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const methodLabels: Record<string, string> = { wave: 'Wave', cash: 'Espèces', transfer: 'Virement', other: 'Autre' };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-navy">Rapports & Statistiques</h1>
            <p className="text-muted-foreground">Analyse des données du club</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 no-print w-full sm:w-auto">
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-lg h-10"><SelectValue placeholder="Toutes les saisons" /></SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Toutes les saisons</SelectItem>
                {seasons.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => window.print()} variant="outline" className="w-full sm:w-auto border-navy text-navy hover:bg-navy/5 rounded-lg h-10">
              <Printer className="h-4 w-4 mr-2" />Imprimer
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse border-none shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="pb-2"><div className="h-4 bg-muted rounded w-1/2"></div></CardHeader>
                <CardContent><div className="h-8 bg-muted rounded w-3/4"></div></CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="hidden print:block mb-8 text-center pt-8 border-b pb-8">
              <h1 className="text-3xl font-display font-black uppercase tracking-tighter text-navy mb-2">Vovinam UGB Sporting Club</h1>
              <div className="inline-block px-4 py-1 bg-navy text-white font-bold text-lg mb-4 rounded-md">RAPPORT D'ACTIVITÉ FINANCIÈRE</div>
              <p className="text-sm font-semibold">Saison : {selectedSeason === 'all' ? 'Toutes les saisons' : seasons.find(s => s.id === selectedSeason)?.name}</p>
              <p className="text-xs text-muted-foreground mt-2 italic">Document généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <Card className="border-none shadow-md rounded-xl overflow-hidden hover:scale-[1.02] transition-transform">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Pratiquants</CardTitle>
                  <div className="p-2 bg-navy/10 rounded-lg"><Users className="h-5 w-5 text-navy" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-display text-navy">{reportData.totalMembers}</div>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{reportData.activeMembers} membres actifs</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md rounded-xl overflow-hidden hover:scale-[1.02] transition-transform">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Encaissé</CardTitle>
                  <div className="p-2 bg-green-50 rounded-lg"><TrendingUp className="h-5 w-5 text-green-600" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-display text-green-600 truncate">{reportData.totalPayments.toLocaleString()} FCFA</div>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Recettes validées</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md rounded-xl overflow-hidden hover:scale-[1.02] transition-transform">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Dépenses</CardTitle>
                  <div className="p-2 bg-red-50 rounded-lg"><Wallet className="h-5 w-5 text-red-500" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-display text-red-600 truncate">{reportData.totalExpenses.toLocaleString()} FCFA</div>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Sorties de caisse</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md rounded-xl overflow-hidden hover:scale-[1.02] transition-transform">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Inscriptions</CardTitle>
                  <div className="p-2 bg-blue-50 rounded-lg"><CreditCard className="h-5 w-5 text-blue-600" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-display text-blue-800 truncate">{reportData.registrationPayments.toLocaleString()} FCFA</div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md rounded-xl overflow-hidden hover:scale-[1.02] transition-transform">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Mensualités</CardTitle>
                  <div className="p-2 bg-red-martial/10 rounded-lg"><BarChart3 className="h-5 w-5 text-red-martial" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-display text-red-martial truncate">{reportData.monthlyPayments.toLocaleString()} FCFA</div>
                </CardContent>
              </Card>
              <Card className="bg-navy text-white border-none shadow-xl rounded-xl overflow-hidden hover:scale-[1.02] transition-transform">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold text-white/70 uppercase tracking-widest">Solde Net</CardTitle>
                  <div className="p-2 bg-white/10 rounded-lg"><TrendingUp className="h-5 w-5 text-white" /></div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-display text-white truncate">{reportData.netBalance.toLocaleString()} FCFA</div>
                  <p className="text-xs text-white/60 mt-1 font-medium tracking-wide">RECETTES - DÉPENSES</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
              <Card className="border-none shadow-md rounded-xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b pb-4">
                  <CardTitle className="text-lg font-display font-semibold text-navy flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Répartition par mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {Object.entries(reportData.paymentsByMethod).length > 0 ? (
                      Object.entries(reportData.paymentsByMethod).map(([method, amount]) => (
                        <div key={method} className="space-y-2">
                          <div className="flex items-center justify-between text-sm font-semibold text-navy">
                            <span className="capitalize">{methodLabels[method] || method}</span>
                            <span className="font-mono">{amount.toLocaleString()} F</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${method === 'wave' ? 'bg-orange-500' :
                                  method === 'cash' ? 'bg-emerald-500' :
                                    method === 'transfer' ? 'bg-blue-500' : 'bg-slate-400'
                                }`}
                              style={{ width: `${(amount / reportData.totalPayments) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-right text-[10px] text-muted-foreground font-bold">
                            {Math.round((amount / reportData.totalPayments) * 100)}% du total
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-12 flex flex-col items-center gap-3">
                        <BarChart3 className="h-12 w-12 opacity-20" />
                        <p>Aucune donnée disponible</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md rounded-xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b pb-4">
                  <CardTitle className="text-lg font-display font-semibold text-navy flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Résumé financier
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  <div className="space-y-1 p-4 sm:p-0">
                    {[
                      { label: "Somme initiale", value: reportData.otherIncomes, color: 'text-green-600' },
                      { label: "Frais d'inscription", value: reportData.registrationPayments, color: 'text-blue-700' },
                      { label: 'Mensualités', value: reportData.monthlyPayments, color: 'text-red-martial' },
                      { label: 'Autres paiements (membres)', value: reportData.otherPayments, color: 'text-slate-700' },
                    ].map(item => (
                      <div key={item.label} className={`flex justify-between items-center py-3 border-b border-dashed ${item.value === 0 && item.label === 'Somme initiale' ? 'hidden' : ''}`}>
                        <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                        <span className={`font-mono font-bold ${item.color}`}>{item.value > 0 && item.label === 'Somme initiale' ? '+' : ''}{item.value.toLocaleString()} F</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center py-3 border-b border-dashed bg-red-50/30 px-2 -mx-2 rounded-lg my-1">
                      <span className="text-sm font-bold text-red-600">Total Dépenses</span>
                      <span className="font-mono font-black text-red-600">-{reportData.totalExpenses.toLocaleString()} F</span>
                    </div>
                    <div className="flex justify-between items-center py-6 px-3 bg-navy text-white rounded-xl mt-6 shadow-lg shadow-navy/20 transition-transform hover:scale-[1.01]">
                      <span className="text-lg font-display font-bold">Solde Final</span>
                      <div className="text-right">
                        <span className="text-2xl font-mono font-black">
                          {reportData.netBalance.toLocaleString()}
                        </span>
                        <span className="text-xs ml-1 font-bold">FCFA</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
