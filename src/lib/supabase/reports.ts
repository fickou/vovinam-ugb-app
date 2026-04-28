/**
 * @file src/lib/supabase/reports.ts
 * Couche service pour les requêtes d'agrégation financière (rapports, bilan).
 */
import { supabase } from '@/integrations/supabase/client';
import type { Transaction, ReportData } from '@/types';
import { getPaymentTypeLabel } from '@/lib/utils';

// ─── Bilan Financier ─────────────────────────────────────────────────────────

/**
 * Récupère toutes les transactions (paiements validés + opérations de trésorerie)
 * pour le bilan financier. Filtre par saison si seasonId !== 'all'.
 */
export async function fetchTransactions(seasonId: string): Promise<Transaction[]> {
  let paymentsQuery = supabase
    .from('payments')
    .select('id, payment_date, amount, payment_type, members(first_name, last_name)')
    .eq('status', 'VALIDATED');

  let expensesQuery = supabase
    .from('expenses')
    .select('id, expense_date, amount, category, description');

  if (seasonId !== 'all') {
    paymentsQuery = paymentsQuery.eq('season_id', seasonId);
    expensesQuery = expensesQuery.eq('season_id', seasonId);
  }

  const [paymentsRes, expensesRes] = await Promise.all([paymentsQuery, expensesQuery]);

  if (paymentsRes.error) throw paymentsRes.error;
  if (expensesRes.error) throw expensesRes.error;

  const transList: Transaction[] = [];

  (paymentsRes.data ?? []).forEach((p: any) => {
    const typeLabel = getPaymentTypeLabel(p.payment_type);
    transList.push({
      id: `p_${p.id}`,
      date: new Date(p.payment_date),
      type: 'income',
      category: typeLabel,
      description: `Paiement ${typeLabel.toLowerCase()}`,
      amount: p.amount,
      member: p.members ? `${p.members.first_name} ${p.members.last_name}` : null,
    });
  });

  (expensesRes.data ?? []).forEach((e: any) => {
    const isIncome = e.amount < 0;
    transList.push({
      id: `e_${e.id}`,
      date: new Date(e.expense_date),
      type: isIncome ? 'income' : 'expense',
      category: e.category || (isIncome ? 'Recette Diverse' : 'Dépense'),
      description: e.description || (isIncome ? 'Recette' : 'Dépense générale'),
      amount: Math.abs(e.amount),
    });
  });

  return transList.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// ─── Rapport d'activité ───────────────────────────────────────────────────────

/** Récupère les données agrégées pour la page Rapports & Statistiques. */
export async function fetchReportData(seasonId: string): Promise<ReportData> {
  const [membersRes, paymentsRes, expensesRes] = await Promise.all([
    supabase.from('members').select('id, status'),
    seasonId === 'all'
      ? supabase.from('payments').select('amount, payment_type, payment_method').eq('status', 'VALIDATED')
      : supabase.from('payments').select('amount, payment_type, payment_method').eq('status', 'VALIDATED').eq('season_id', seasonId),
    seasonId === 'all'
      ? supabase.from('expenses').select('amount')
      : supabase.from('expenses').select('amount').eq('season_id', seasonId),
  ]);

  if (membersRes.error) throw membersRes.error;
  if (paymentsRes.error) throw paymentsRes.error;
  if (expensesRes.error) throw expensesRes.error;

  const members = membersRes.data ?? [];
  const payments = paymentsRes.data ?? [];
  const expenses = expensesRes.data ?? [];

  const registrationPayments = payments
    .filter((p) => p.payment_type === 'registration')
    .reduce((s, p) => s + p.amount, 0);

  const monthlyPayments = payments
    .filter((p) => p.payment_type === 'monthly')
    .reduce((s, p) => s + p.amount, 0);

  const otherPayments = payments
    .filter((p) => !['registration', 'monthly'].includes(p.payment_type))
    .reduce((s, p) => s + p.amount, 0);

  const realExpenses = expenses.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0);
  const otherIncomes = expenses.filter((e) => e.amount < 0).reduce((s, e) => s + Math.abs(e.amount), 0);

  const totalPayments = payments.reduce((s, p) => s + p.amount, 0) + otherIncomes;

  const paymentsByMethod: Record<string, number> = {};
  payments.forEach((p) => {
    paymentsByMethod[p.payment_method] = (paymentsByMethod[p.payment_method] ?? 0) + p.amount;
  });

  return {
    totalMembers: members.length,
    activeMembers: members.filter((m) => m.status === 'active').length,
    totalPayments,
    registrationPayments,
    monthlyPayments,
    otherPayments,
    otherIncomes,
    totalExpenses: realExpenses,
    netBalance: totalPayments - realExpenses,
    paymentsByMethod,
  };
}
