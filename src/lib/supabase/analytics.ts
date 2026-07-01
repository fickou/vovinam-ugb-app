/**
 * @file src/lib/supabase/analytics.ts
 * Service d'analyse mensuelle des paiements (décembre à juillet).
 * Données exportables pour Power BI.
 */
import { supabase } from '@/integrations/supabase/client';

export interface MonthlyPaymentData {
  /** Mois sous forme "YYYY-MM" */
  month: string;
  /** Label lisible ex: "Décembre 2025" */
  label: string;
  /** Nombre de paiements de mensualité */
  monthlyCount: number;
  /** Montant total des mensualités */
  monthlyAmount: number;
  /** Nombre de paiements d'inscription */
  registrationCount: number;
  /** Montant total des inscriptions */
  registrationAmount: number;
  /** Montant total tous types confondus */
  totalAmount: number;
  /** Nombre total de paiements validés */
  totalCount: number;
}

export interface ActiveRegistrationKPI {
  /** Total pratiquants actifs */
  totalActive: number;
  /** Pratiquants actifs ayant payé leur inscription cette saison */
  activeWithRegistration: number;
  /** Taux de couverture inscription */
  coverageRate: number;
}

export interface AnalyticsData {
  monthly: MonthlyPaymentData[];
  kpi: ActiveRegistrationKPI;
  seasonName: string;
}

const MONTH_NAMES: Record<number, string> = {
  1: 'Janvier', 2: 'Février', 3: 'Mars', 4: 'Avril',
  5: 'Mai', 6: 'Juin', 7: 'Juillet', 8: 'Août',
  9: 'Septembre', 10: 'Octobre', 11: 'Novembre', 12: 'Décembre',
};

/** Génère les mois Décembre -> Juillet en tenant compte du changement d'année */
function generateMonths(startYear: number): { month: string; label: string }[] {
  const months = [];
  // Décembre de l'année de départ
  for (let m = 12; m <= 12; m++) {
    const y = startYear;
    months.push({
      month: `${y}-${String(m).padStart(2, '0')}`,
      label: `${MONTH_NAMES[m]} ${y}`,
    });
  }
  // Janvier à Juillet de l'année suivante
  for (let m = 1; m <= 7; m++) {
    const y = startYear + 1;
    months.push({
      month: `${y}-${String(m).padStart(2, '0')}`,
      label: `${MONTH_NAMES[m]} ${y}`,
    });
  }
  return months;
}

/**
 * Récupère les données d'analyse mensuelle pour une saison donnée.
 * Si seasonId === 'all', prend tous les paiements validés.
 */
export async function fetchAnalyticsData(
  seasonId: string,
  seasonName: string,
): Promise<AnalyticsData> {
  // ── Paiements validés avec date ────────────────────────────────────────────
  let paymentsQuery = supabase
    .from('payments')
    .select('id, payment_date, amount, payment_type, member_id')
    .eq('status', 'VALIDATED');

  if (seasonId !== 'all') {
    paymentsQuery = paymentsQuery.eq('season_id', seasonId);
  }

  // ── Membres actifs ─────────────────────────────────────────────────────────
  const membersQuery = supabase.from('members').select('id, status');

  const [paymentsRes, membersRes] = await Promise.all([paymentsQuery, membersQuery]);

  if (paymentsRes.error) throw paymentsRes.error;
  if (membersRes.error) throw membersRes.error;

  const payments = paymentsRes.data ?? [];
  const members = membersRes.data ?? [];

  // ── Déterminer l'année de départ ──────────────────────────────────────────
  // On cherche la première date de paiement pour trouver l'année de la saison
  let startYear = new Date().getFullYear();
  if (payments.length > 0) {
    const years = payments
      .map((p) => new Date(p.payment_date).getFullYear())
      .sort();
    // L'année de départ est celle où il y a des paiements en décembre ou la première année trouvée
    const decPayments = payments.filter((p) => new Date(p.payment_date).getMonth() === 11);
    if (decPayments.length > 0) {
      startYear = new Date(decPayments[0].payment_date).getFullYear();
    } else {
      startYear = years[0] - 1; // Si pas de décembre, on prend l'année précédente
    }
  }

  const monthSlots = generateMonths(startYear);

  // ── Agrégation par mois ───────────────────────────────────────────────────
  const monthly: MonthlyPaymentData[] = monthSlots.map(({ month, label }) => {
    const monthPayments = payments.filter((p) => {
      const d = new Date(p.payment_date);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return yearMonth === month;
    });

    const monthlyOnes = monthPayments.filter((p) => p.payment_type === 'monthly');
    const registrationOnes = monthPayments.filter((p) => p.payment_type === 'registration');

    return {
      month,
      label,
      monthlyCount: monthlyOnes.length,
      monthlyAmount: monthlyOnes.reduce((s, p) => s + p.amount, 0),
      registrationCount: registrationOnes.length,
      registrationAmount: registrationOnes.reduce((s, p) => s + p.amount, 0),
      totalAmount: monthPayments.reduce((s, p) => s + p.amount, 0),
      totalCount: monthPayments.length,
    };
  });

  // ── KPI Inscription des pratiquants actifs ─────────────────────────────────
  const activeMembers = members.filter((m) => m.status === 'active');
  const activeMemberIds = new Set(activeMembers.map((m) => m.id));

  const registrationMemberIds = new Set(
    payments
      .filter((p) => p.payment_type === 'registration')
      .map((p) => p.member_id),
  );

  const activeWithRegistration = [...activeMemberIds].filter((id) =>
    registrationMemberIds.has(id),
  ).length;

  const kpi: ActiveRegistrationKPI = {
    totalActive: activeMembers.length,
    activeWithRegistration,
    coverageRate: activeMembers.length > 0
      ? Math.round((activeWithRegistration / activeMembers.length) * 100)
      : 0,
  };

  return { monthly, kpi, seasonName };
}

/** Génère un CSV pour Power BI à partir des données mensuelles. */
export function generateCSV(data: MonthlyPaymentData[], seasonName: string): string {
  const headers = [
    'Saison',
    'Mois',
    'Code_Mois',
    'Nb_Mensualites',
    'Montant_Mensualites',
    'Nb_Inscriptions',
    'Montant_Inscriptions',
    'Montant_Total',
    'Nb_Paiements_Total',
  ];

  const rows = data.map((d) => [
    seasonName,
    d.label,
    d.month,
    d.monthlyCount,
    d.monthlyAmount,
    d.registrationCount,
    d.registrationAmount,
    d.totalAmount,
    d.totalCount,
  ]);

  return [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
}
