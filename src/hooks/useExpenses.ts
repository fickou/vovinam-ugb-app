/**
 * @file src/hooks/useExpenses.ts
 * Hook React Query pour la gestion CRUD des opérations de trésorerie.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '@/lib/supabase/expenses';
import type { Expense, ExpenseFormData } from '@/types';

const QUERY_KEY = ['expenses'] as const;

export function useExpenses() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // ── Lecture ──────────────────────────────────────────────────────────────
  const { data: expenses = [], isLoading: loading } = useQuery<Expense[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchExpenses,
  });

  // ── Invalidation du cache après mutation ──────────────────────────────────
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  // ── Création ──────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (formData: ExpenseFormData) => createExpense(formData, user?.id),
    onSuccess: () => {
      toast({ title: 'Succès', description: 'Opération ajoutée avec succès' });
      invalidate();
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message ?? 'Impossible d\'ajouter l\'opération', variant: 'destructive' });
    },
  });

  // ── Mise à jour ───────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: ExpenseFormData }) =>
      updateExpense(id, formData, user?.id),
    onSuccess: () => {
      toast({ title: 'Succès', description: 'Opération modifiée avec succès' });
      invalidate();
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message ?? 'Impossible de modifier l\'opération', variant: 'destructive' });
    },
  });

  // ── Suppression ───────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      toast({ title: 'Succès', description: 'Opération supprimée' });
      invalidate();
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message ?? 'Impossible de supprimer l\'opération', variant: 'destructive' });
    },
  });

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return {
    expenses,
    loading,
    isMutating,
    create: createMutation.mutate,
    update: (id: string, formData: ExpenseFormData) => updateMutation.mutate({ id, formData }),
    remove: deleteMutation.mutate,
  };
}
