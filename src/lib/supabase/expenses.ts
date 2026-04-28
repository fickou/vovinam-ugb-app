/**
 * @file src/lib/supabase/expenses.ts
 * Couche service pour la table `expenses` (dépenses + recettes diverses).
 */
import { supabase } from '@/integrations/supabase/client';
import type { Expense, ExpenseFormData } from '@/types';

/** Récupère toutes les opérations de trésorerie avec le nom de la saison. */
export async function fetchExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*, seasons(name)')
    .order('expense_date', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Expense[];
}

/** Récupère les opérations d'une saison spécifique. */
export async function fetchExpensesBySeason(seasonId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('id, expense_date, amount, category, description')
    .eq('season_id', seasonId)
    .order('expense_date', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Expense[];
}

/** Récupère toutes les opérations (sans filtre saison). */
export async function fetchAllExpensesSimple(): Promise<Pick<Expense, 'id' | 'amount' | 'category' | 'description' | 'expense_date'>[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('id, expense_date, amount, category, description');

  if (error) throw error;
  return data ?? [];
}

/**
 * Construit le payload Supabase à partir des données du formulaire.
 * Convertit le type d'opération (income/expense) en signe du montant.
 */
export function buildExpensePayload(
  formData: ExpenseFormData,
  userId?: string | null,
): Omit<Expense, 'id' | 'seasons'> {
  const rawAmount = Math.abs(parseInt(formData.amount, 10));
  return {
    season_id: formData.season_id,
    amount: formData.operation_type === 'income' ? -rawAmount : rawAmount,
    description: formData.description,
    category: formData.category,
    expense_date: formData.expense_date,
    recorded_by: userId ?? null,
  };
}

/** Crée une nouvelle opération. */
export async function createExpense(
  formData: ExpenseFormData,
  userId?: string | null,
): Promise<void> {
  const payload = buildExpensePayload(formData, userId);
  const { error } = await supabase
    .from('expenses')
    .insert({ ...payload, id: crypto.randomUUID() });

  if (error) throw error;
}

/** Met à jour une opération existante. */
export async function updateExpense(
  id: string,
  formData: ExpenseFormData,
  userId?: string | null,
): Promise<void> {
  const payload = buildExpensePayload(formData, userId);
  const { error } = await supabase
    .from('expenses')
    .update(payload)
    .eq('id', id);

  if (error) throw error;
}

/** Supprime une opération. */
export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
