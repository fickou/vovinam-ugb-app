/**
 * @file src/pages/Reports.tsx
 * Rapports & Statistiques — données agrégées par saison.
 * Logique déléguée à src/lib/supabase/reports.ts (fetchReportData).
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, CreditCard, Printer, Wallet } from 'lucide-react';

import { fetchReportData }   from '@/lib/supabase/reports';
import { useSeasons }        from '@/hooks/useSeasons';
import { PAYMENT_METHOD_LABELS } from '@/lib/utils';
import { PageHeader }        from '@/components/shared/PageHeader';
import { SeasonSelector }    from '@/components/shared/SeasonSelector';
import { PrintHeader }       from '@/components/shared/PrintHeader';
import type { ReportData }   from '@/types';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ReportSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="animate-pulse border-none shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="pb-2"><div className="h-4 bg-muted rounded w-1/2" /></CardHeader>
          <CardContent><div className="h-8 bg-muted rounded w-3/4" /></CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  valueColor: string;
  dark?: boolean;
}

function StatCard({ label, value, subtitle, icon, iconBg, valueColor, dark }: StatCardProps) {
  return (
    <Card className={`border-none shadow-md rounded-xl overflow-hidden hover:scale-[1.02] transition-transform ${dark ? 'bg-navy text-white' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={`text-xs font-bold uppercase tracking-widest ${dark ? 'text-white/70' : 'text-muted-foreground'}`}>{label}</CardTitle>
        <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold font-display truncate ${valueColor}`}>{value}</div>
        {subtitle && <p className={`text-xs mt-1 font-medium ${dark ? 'text-white/60 tracking-wide' : 'text-muted-foreground'}`}>{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Valeur initiale des données ──────────────────────────────────────────────

const EMPTY_REPORT: ReportData = {
  totalMembers: 0, activeMembers: 0, totalPayments: 0,
  registrationPayments: 0, monthlyPayments: 0, otherPayments: 0,
  otherIncomes: 0, totalExpenses: 0, netBalance: 0, paymentsByMethod: {},
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Reports() {
  const { seasons } = useSeasons();
  const [selectedSeason, setSelectedSeason] = useState('all');

  const { data: reportData = EMPTY_REPORT, isLoading: loading } = useQuery<ReportData>({
    queryKey: ['report-data', selectedSeason],
    queryFn:  () => fetchReportData(selectedSeason),
  });

  const seasonLabel = selectedSeason === 'all'
    ? 'Toutes les saisons'
    : seasons.find((s) => s.id === selectedSeason)?.name ?? '';

  const statCards: StatCardProps[] = [
    {
      label: 'Total Pratiquants', icon: <Users className="h-5 w-5 text-navy" />,
      iconBg: 'bg-navy/10', value: String(reportData.totalMembers),
      subtitle: `${reportData.activeMembers} membres actifs`, valueColor: 'text-navy',
    },
    {
      label: 'Total Encaissé', icon: <TrendingUp className="h-5 w-5 text-green-600" />,
      iconBg: 'bg-green-50', value: `${reportData.totalPayments.toLocaleString()} FCFA`,
      subtitle: 'Recettes validées', valueColor: 'text-green-600',
    },
    {
      label: 'Total Dépenses', icon: <Wallet className="h-5 w-5 text-red-500" />,
      iconBg: 'bg-red-50', value: `${reportData.totalExpenses.toLocaleString()} FCFA`,
      subtitle: 'Sorties de caisse', valueColor: 'text-red-600',
    },
    {
      label: 'Inscriptions', icon: <CreditCard className="h-5 w-5 text-blue-600" />,
      iconBg: 'bg-blue-50', value: `${reportData.registrationPayments.toLocaleString()} FCFA`,
      valueColor: 'text-blue-800',
    },
    {
      label: 'Mensualités', icon: <BarChart3 className="h-5 w-5 text-red-martial" />,
      iconBg: 'bg-red-martial/10', value: `${reportData.monthlyPayments.toLocaleString()} FCFA`,
      valueColor: 'text-red-martial',
    },
    {
      label: 'Solde Net', icon: <TrendingUp className="h-5 w-5 text-white" />,
      iconBg: 'bg-white/10', value: `${reportData.netBalance.toLocaleString()} FCFA`,
      subtitle: 'RECETTES - DÉPENSES', valueColor: 'text-white', dark: true,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PrintHeader title="Vovinam UGB  Club" subtitle="RAPPORT D'ACTIVITÉ FINANCIÈRE" seasonLabel={`Saison : ${seasonLabel}`} />

        <PageHeader
          title="Rapports & Statistiques"
          subtitle="Analyse des données du club"
          actions={
            <>
              <SeasonSelector seasons={seasons} value={selectedSeason} onValueChange={setSelectedSeason} />
              <Button onClick={() => window.print()} variant="outline" className="border-navy text-navy hover:bg-navy/5 rounded-lg h-10 no-print">
                <Printer className="h-4 w-4 mr-2" />Imprimer
              </Button>
            </>
          }
        />

        {loading ? <ReportSkeleton /> : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {statCards.map((card) => <StatCard key={card.label} {...card} />)}
            </div>

            {/* Détails */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
              {/* Répartition par mode */}
              <Card className="border-none shadow-md rounded-xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b pb-4">
                  <CardTitle className="text-lg font-display font-semibold text-navy flex items-center gap-2">
                    <CreditCard className="h-5 w-5" /> Répartition par mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {Object.entries(reportData.paymentsByMethod).length > 0 ? (
                      Object.entries(reportData.paymentsByMethod).map(([method, amount]) => {
                        const pct = reportData.totalPayments > 0
                          ? Math.round((amount / reportData.totalPayments) * 100)
                          : 0;
                        const barColor = method === 'wave' ? 'bg-orange-500' : method === 'cash' ? 'bg-emerald-500' : method === 'transfer' ? 'bg-blue-500' : 'bg-slate-400';
                        return (
                          <div key={method} className="space-y-2">
                            <div className="flex items-center justify-between text-sm font-semibold text-navy">
                              <span className="capitalize">{PAYMENT_METHOD_LABELS[method] ?? method}</span>
                              <span className="font-mono">{amount.toLocaleString()} F</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-1000 ${barColor}`} style={{ width: `${pct}%` }} />
                            </div>
                            <div className="text-right text-[10px] text-muted-foreground font-bold">{pct}% du total</div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-muted-foreground py-12 flex flex-col items-center gap-3">
                        <BarChart3 className="h-12 w-12 opacity-20" />
                        <p>Aucune donnée disponible</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Résumé financier */}
              <Card className="border-none shadow-md rounded-xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b pb-4">
                  <CardTitle className="text-lg font-display font-semibold text-navy flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" /> Résumé financier
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  <div className="space-y-1 p-4 sm:p-0">
                    {[
                      { label: 'Somme initiale',              value: reportData.otherIncomes,         color: 'text-green-600',  prefix: '+' },
                      { label: "Frais d'inscription",         value: reportData.registrationPayments, color: 'text-blue-700',   prefix: '' },
                      { label: 'Mensualités',                 value: reportData.monthlyPayments,      color: 'text-red-martial',prefix: '' },
                      { label: 'Autres paiements (membres)',  value: reportData.otherPayments,        color: 'text-slate-700',  prefix: '' },
                    ]
                      .filter((item) => !(item.value === 0 && item.label === 'Somme initiale'))
                      .map((item) => (
                        <div key={item.label} className="flex justify-between items-center py-3 border-b border-dashed">
                          <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                          <span className={`font-mono font-bold ${item.color}`}>
                            {item.prefix}{item.value.toLocaleString()} F
                          </span>
                        </div>
                      ))
                    }
                    <div className="flex justify-between items-center py-3 border-b border-dashed bg-red-50/30 px-2 -mx-2 rounded-lg my-1">
                      <span className="text-sm font-bold text-red-600">Total Dépenses</span>
                      <span className="font-mono font-black text-red-600">-{reportData.totalExpenses.toLocaleString()} F</span>
                    </div>
                    <div className="flex justify-between items-center py-6 px-3 bg-navy text-white rounded-xl mt-6 shadow-lg shadow-navy/20 hover:scale-[1.01] transition-transform">
                      <span className="text-lg font-display font-bold">Solde Final</span>
                      <div className="text-right">
                        <span className="text-2xl font-mono font-black">{reportData.netBalance.toLocaleString()}</span>
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
