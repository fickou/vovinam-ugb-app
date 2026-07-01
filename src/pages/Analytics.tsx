/**
 * @file src/pages/Analytics.tsx
 * Page d'analyse mensuelle des paiements (décembre → juillet).
 * Graphiques Recharts + export CSV pour Power BI.
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, Users, CreditCard, Download, BarChart3,
  CheckCircle2, ArrowUpRight, Loader2,
} from 'lucide-react';

import { fetchAnalyticsData, generateCSV } from '@/lib/supabase/analytics';
import { useSeasons } from '@/hooks/useSeasons';
import { PageHeader } from '@/components/shared/PageHeader';
import { SeasonSelector } from '@/components/shared/SeasonSelector';
import { formatAmount } from '@/lib/utils';

// ─── Couleurs ─────────────────────────────────────────────────────────────────
const COLOR_MONTHLY   = '#1e3a5f';   // navy
const COLOR_REG       = '#f59e0b';   // amber
const COLOR_TOTAL     = '#6366f1';   // indigo
const COLOR_LINE      = '#10b981';   // emerald

// ─── Tooltip personnalisé ─────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs min-w-[180px]">
      <p className="font-bold text-slate-800 mb-2 text-sm">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: entry.color }} />
            <span className="text-slate-600">{entry.name}</span>
          </span>
          <span className="font-semibold text-slate-800">
            {typeof entry.value === 'number' && entry.value > 1000
              ? entry.value.toLocaleString('fr-FR') + ' F'
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
}
function KpiCard({ label, value, subtitle, icon, color, badge }: KpiCardProps) {
  return (
    <Card className="border-none shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl ${color}`}>
            {icon}
          </div>
          {badge && (
            <Badge variant="secondary" className="text-xs font-semibold">
              {badge}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function Analytics() {
  const { seasons, activeSeason } = useSeasons();
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');

  // Résoudre la saison active dès le chargement
  const effectiveSeasonId = selectedSeasonId || activeSeason?.id || 'all';
  const effectiveSeasonName = seasons.find((s) => s.id === effectiveSeasonId)?.name ?? 'Toutes saisons';

  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', effectiveSeasonId],
    queryFn: () => fetchAnalyticsData(effectiveSeasonId, effectiveSeasonName),
    enabled: true,
    staleTime: 60_000,
  });

  // ── Export CSV ───────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (!data) return;
    const csv = generateCSV(data.monthly, data.seasonName);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analyse_paiements_${effectiveSeasonName.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Données pour les graphiques ──────────────────────────────────────────
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.monthly.map((m) => ({
      name: m.label.split(' ')[0].slice(0, 3) + '. ' + m.label.split(' ')[1]?.slice(2),
      fullName: m.label,
      'Mensualités (F)': m.monthlyAmount,
      'Inscriptions (F)': m.registrationAmount,
      'Total (F)': m.totalAmount,
      'Nb paiements': m.totalCount,
      'Nb mensualités': m.monthlyCount,
    }));
  }, [data]);

  // ── Totaux résumés ───────────────────────────────────────────────────────
  const totals = useMemo(() => {
    if (!data) return null;
    const total = data.monthly.reduce((acc, m) => ({
      amount: acc.amount + m.totalAmount,
      count: acc.count + m.totalCount,
      monthly: acc.monthly + m.monthlyAmount,
      registration: acc.registration + m.registrationAmount,
    }), { amount: 0, count: 0, monthly: 0, registration: 0 });
    return total;
  }, [data]);

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-red-500">
          Erreur lors du chargement des données. Veuillez réessayer.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ── En-tête ──────────────────────────────────────────────────────── */}
        <PageHeader
          title="Analyse des Paiements"
          subtitle="Suivi mensuel décembre – juillet · Compatible Power BI"
          actions={
            <div className="flex gap-2 flex-wrap">
              <SeasonSelector
                seasons={seasons}
                value={effectiveSeasonId}
                onChange={setSelectedSeasonId}
              />
              <Button
                onClick={handleExportCSV}
                disabled={!data || isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <Download className="h-4 w-4" />
                Exporter CSV
              </Button>
            </div>
          }
        />

        {isLoading ? (
          <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Chargement des données…</span>
          </div>
        ) : (
          <>
            {/* ── KPI Cards ──────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                label="Encaissements totaux"
                value={formatAmount(totals?.amount ?? 0)}
                subtitle={`${totals?.count ?? 0} paiements validés`}
                icon={<CreditCard className="h-5 w-5 text-navy" />}
                color="bg-navy/10"
                badge={effectiveSeasonName}
              />
              <KpiCard
                label="Total mensualités"
                value={formatAmount(totals?.monthly ?? 0)}
                icon={<TrendingUp className="h-5 w-5 text-indigo-600" />}
                color="bg-indigo-100"
              />
              <KpiCard
                label="Total inscriptions"
                value={formatAmount(totals?.registration ?? 0)}
                icon={<ArrowUpRight className="h-5 w-5 text-amber-600" />}
                color="bg-amber-100"
              />
              <KpiCard
                label="Membres actifs inscrits"
                value={`${data?.kpi.activeWithRegistration ?? 0} / ${data?.kpi.totalActive ?? 0}`}
                subtitle={`Taux de couverture : ${data?.kpi.coverageRate ?? 0}%`}
                icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                color="bg-emerald-100"
                badge={`${data?.kpi.coverageRate ?? 0}%`}
              />
            </div>

            {/* ── Graphique 1 : Barres empilées – montants par mois ───────── */}
            <Card className="border-none shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                  <BarChart3 className="h-5 w-5 text-navy" />
                  Montants encaissés par mois
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Diagramme en barres — ventilation Mensualités / Inscriptions
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis
                      tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Mensualités (F)" stackId="a" fill={COLOR_MONTHLY} radius={[0, 0, 4, 4]} />
                    <Bar dataKey="Inscriptions (F)" stackId="a" fill={COLOR_REG} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* ── Graphique 2 : Combiné – montants + nombre de paiements ───── */}
            <Card className="border-none shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Graphique combiné : Montants & Nombre de paiements
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Barres = montant total · Courbe = nombre de paiements validés
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis
                      yAxisId="left"
                      tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11 }}
                      label={{ value: 'Nb', angle: -90, position: 'insideRight', fontSize: 10 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar yAxisId="left" dataKey="Total (F)" fill={COLOR_TOTAL} radius={[4, 4, 0, 0]} opacity={0.85} />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="Nb paiements"
                      stroke={COLOR_LINE}
                      strokeWidth={2.5}
                      dot={{ fill: COLOR_LINE, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* ── Tableau récapitulatif ────────────────────────────────────── */}
            <Card className="border-none shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                  <Users className="h-5 w-5 text-slate-600" />
                  Tableau récapitulatif mensuel
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Données brutes exportables pour Power BI
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b">
                        <th className="text-left px-4 py-3 font-bold text-slate-700 whitespace-nowrap">Mois</th>
                        <th className="text-center px-3 py-3 font-bold text-navy whitespace-nowrap">Nb mensualités</th>
                        <th className="text-right px-3 py-3 font-bold text-navy whitespace-nowrap">Montant mensualités</th>
                        <th className="text-center px-3 py-3 font-bold text-amber-700 whitespace-nowrap">Nb inscriptions</th>
                        <th className="text-right px-3 py-3 font-bold text-amber-700 whitespace-nowrap">Montant inscriptions</th>
                        <th className="text-right px-3 py-3 font-bold text-indigo-700 whitespace-nowrap">Total paiements</th>
                        <th className="text-center px-3 py-3 font-bold text-slate-700 whitespace-nowrap">Nb total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.monthly.map((row, i) => (
                        <tr
                          key={row.month}
                          className={`border-b transition-colors hover:bg-slate-50 ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}
                        >
                          <td className="px-4 py-2.5 font-medium text-slate-800 whitespace-nowrap">{row.label}</td>
                          <td className="px-3 py-2.5 text-center">
                            {row.monthlyCount > 0 ? (
                              <Badge variant="secondary" className="bg-navy/10 text-navy">{row.monthlyCount}</Badge>
                            ) : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-slate-700">
                            {row.monthlyAmount > 0 ? formatAmount(row.monthlyAmount) : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {row.registrationCount > 0 ? (
                              <Badge variant="secondary" className="bg-amber-100 text-amber-800">{row.registrationCount}</Badge>
                            ) : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-slate-700">
                            {row.registrationAmount > 0 ? formatAmount(row.registrationAmount) : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-semibold text-indigo-700">
                            {row.totalAmount > 0 ? formatAmount(row.totalAmount) : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {row.totalCount > 0 ? (
                              <span className="font-bold text-slate-700">{row.totalCount}</span>
                            ) : <span className="text-muted-foreground">—</span>}
                          </td>
                        </tr>
                      ))}
                      {/* Ligne de total */}
                      <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold">
                        <td className="px-4 py-3 text-slate-800 uppercase text-xs tracking-wide">TOTAL</td>
                        <td className="px-3 py-3 text-center text-navy">
                          {data?.monthly.reduce((s, m) => s + m.monthlyCount, 0)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-navy">
                          {formatAmount(totals?.monthly ?? 0)}
                        </td>
                        <td className="px-3 py-3 text-center text-amber-700">
                          {data?.monthly.reduce((s, m) => s + m.registrationCount, 0)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-amber-700">
                          {formatAmount(totals?.registration ?? 0)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-indigo-700">
                          {formatAmount(totals?.amount ?? 0)}
                        </td>
                        <td className="px-3 py-3 text-center text-slate-700">
                          {totals?.count}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* ── KPI Inscription détaillé ─────────────────────────────────── */}
            <Card className="border-none shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  KPI — Pratiquants actifs ayant réglé leur inscription
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Indicateur de performance clé pour le suivi des adhérents
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-2">
                  {/* Total actifs */}
                  <div className="text-center space-y-1">
                    <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Pratiquants actifs</p>
                    <p className="text-5xl font-black text-slate-800">{data?.kpi.totalActive ?? 0}</p>
                  </div>
                  {/* Barre de progression */}
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Taux de couverture</p>
                    <div className="relative w-full h-6 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${data?.kpi.coverageRate ?? 0}%`,
                          background: `linear-gradient(90deg, #10b981, #059669)`,
                        }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-multiply">
                        {data?.kpi.coverageRate ?? 0}%
                      </span>
                    </div>
                  </div>
                  {/* Inscrits */}
                  <div className="text-center space-y-1">
                    <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Ont payé l'inscription</p>
                    <p className="text-5xl font-black text-emerald-600">{data?.kpi.activeWithRegistration ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Info Power BI ─────────────────────────────────────────────── */}
            <Card className="border border-blue-100 bg-blue-50 rounded-2xl shadow-none">
              <CardContent className="p-5">
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-blue-900 text-sm mb-1">Intégration Power BI</p>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Cliquez sur <strong>Exporter CSV</strong> pour télécharger les données au format CSV (séparateur{' '}
                      <code className="bg-blue-100 px-1 rounded">;</code>). Dans Power BI Desktop, utilisez{' '}
                      <strong>Obtenir des données → Texte/CSV</strong> pour importer le fichier. Les colonnes{' '}
                      <code className="bg-blue-100 px-1 rounded">Montant_Mensualites</code>,{' '}
                      <code className="bg-blue-100 px-1 rounded">Montant_Inscriptions</code> et{' '}
                      <code className="bg-blue-100 px-1 rounded">Montant_Total</code>{' '}
                      permettent de créer des graphiques en barres. La colonne{' '}
                      <code className="bg-blue-100 px-1 rounded">Nb_Mensualites</code> permet de créer la courbe du graphique combiné.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
