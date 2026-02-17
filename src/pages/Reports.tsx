import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart3, TrendingUp, Users, CreditCard, Printer, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Season {
  id: string;
  name: string;
}

interface ReportData {
  totalMembers: number;
  activeMembers: number;
  totalPayments: number;
  registrationPayments: number;
  monthlyPayments: number;
  otherPayments: number;
  totalExpenses: number;
  netBalance: number;
  paymentsByMethod: Record<string, number>;
}

export default function Reports() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [reportData, setReportData] = useState<ReportData>({
    totalMembers: 0,
    activeMembers: 0,
    totalPayments: 0,
    registrationPayments: 0,
    monthlyPayments: 0,
    otherPayments: 0,
    totalExpenses: 0,
    netBalance: 0,
    paymentsByMethod: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeasons();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [selectedSeason]);

  const fetchSeasons = async () => {
    try {
      const data = await api.get('/seasons.php');
      setSeasons(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/reports.php?season_id=${selectedSeason}`);
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const methodLabels: Record<string, string> = {
    wave: 'Wave',
    cash: 'Espèces',
    other: 'Autre',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-navy">Rapports & Statistiques</h1>
            <p className="text-muted-foreground">Analyse des données du club</p>
          </div>

          <div className="flex items-center gap-4 no-print">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Saison :</span>
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Toutes les saisons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les saisons</SelectItem>
                  {seasons.map((season) => (
                    <SelectItem key={season.id} value={season.id}>
                      {season.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handlePrint} variant="outline" className="border-navy text-navy hover:bg-navy/5">
              <Printer className="h-4 w-4 mr-2" />
              Imprimer le rapport
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="hidden print:block mb-8 text-center pt-4 border-b pb-6">
              <h1 className="text-2xl font-bold uppercase tracking-widest text-navy">Vovinam UGB Sporting Club</h1>
              <h2 className="text-xl font-bold mt-2">RAPPORT D'ACTIVITÉ FINANCIÈRE</h2>
              <p className="text-sm font-semibold mt-1">
                Saison : {selectedSeason === 'all' ? 'Toutes les saisons' : seasons.find(s => s.id === selectedSeason)?.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Pratiquants
                  </CardTitle>
                  <Users className="h-5 w-5 text-navy" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display">{reportData.totalMembers}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {reportData.activeMembers} actifs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Encaissé
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display">
                    {reportData.totalPayments.toLocaleString()} FCFA
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Inscriptions
                  </CardTitle>
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display">
                    {reportData.registrationPayments.toLocaleString()} FCFA
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Mensualités
                  </CardTitle>
                  <BarChart3 className="h-5 w-5 text-red-martial" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display">
                    {reportData.monthlyPayments.toLocaleString()} FCFA
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Dépenses
                  </CardTitle>
                  <Wallet className="h-5 w-5 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display text-red-600">
                    {reportData.totalExpenses.toLocaleString()} FCFA
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-navy text-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-white/70">
                    Solde Net
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-white" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display">
                    {reportData.netBalance.toLocaleString()} FCFA
                  </div>
                  <p className="text-xs text-white/60 mt-1">Recettes - Dépenses</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition par mode de paiement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(reportData.paymentsByMethod).length > 0 ? (
                      Object.entries(reportData.paymentsByMethod).map(([method, amount]) => (
                        <div key={method} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-3 h-3 rounded-full ${method === 'wave' ? 'bg-orange-500' : method === 'cash' ? 'bg-gray-500' : 'bg-slate-500'
                                }`}
                            ></div>
                            <span>{methodLabels[method] || method}</span>
                          </div>
                          <span className="font-mono font-medium">
                            {amount.toLocaleString()} FCFA
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        Aucune donnée disponible
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Résumé financier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Frais d'inscription</span>
                      <span className="font-mono font-medium">
                        {reportData.registrationPayments.toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Mensualités</span>
                      <span className="font-mono font-medium">
                        {reportData.monthlyPayments.toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Autres paiements</span>
                      <span className="font-mono font-medium">
                        {reportData.otherPayments.toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Total Dépenses</span>
                      <span className="font-mono font-medium text-red-600">
                        -{reportData.totalExpenses.toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 text-lg font-bold">
                      <span>Solde Net</span>
                      <span className={`font-mono ${reportData.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {reportData.netBalance.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      <style>{`
        @media print {
          .print:grid-cols-2 {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .Card {
            break-inside: avoid;
          }
        }
      `}</style>
    </DashboardLayout >
  );
}
