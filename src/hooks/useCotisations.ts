import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { CotisationList, CotisationEntry, CotisationEntryWithMember, CotisationExpense } from '@/types/cotisations';

export const COTISATIONS_KEY = 'cotisations_lists';

export function useCotisations() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: lists = [], isLoading: isLoadingLists } = useQuery<CotisationList[]>({
    queryKey: [COTISATIONS_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cotisation_lists')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createListMutation = useMutation({
    mutationFn: async ({ title, userId }: { title: string; userId: string }) => {
      const { data, error } = await supabase
        .from('cotisation_lists')
        .insert({ title, created_by: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [COTISATIONS_KEY] });
      toast({ title: 'Liste de cotisation créée' });
    },
    onError: (err: any) => toast({ title: 'Erreur', description: err.message, variant: 'destructive' }),
  });

  const updateListTitleMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase
        .from('cotisation_lists')
        .update({ title })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [COTISATIONS_KEY] });
      toast({ title: 'Titre de la liste mis à jour' });
    },
    onError: (err: any) => toast({ title: 'Erreur', description: err.message, variant: 'destructive' }),
  });

  const deleteListMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cotisation_lists')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [COTISATIONS_KEY] });
      toast({ title: 'Liste supprimée' });
    },
    onError: (err: any) => toast({ title: 'Erreur', description: err.message, variant: 'destructive' }),
  });

  return {
    lists: (lists ?? []) as CotisationList[],
    isLoadingLists,
    createList: (title: string, userId: string) => createListMutation.mutateAsync({ title, userId }),
    updateListTitle: (id: string, title: string) => updateListTitleMutation.mutateAsync({ id, title }),
    deleteList: (id: string) => deleteListMutation.mutateAsync(id),
    isMutating: createListMutation.isPending || updateListTitleMutation.isPending || deleteListMutation.isPending,
  };
}

export function useCotisationEntries(listId: string | null) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const queryKey = ['cotisation_entries', listId];

  const { data: entries = [], isLoading, error } = useQuery<CotisationEntryWithMember[]>({
    queryKey,
    queryFn: async () => {
      if (!listId) return [];
      const { data, error } = await supabase
        .from('cotisation_entries')
        .select(`
          id, 
          list_id, 
          member_id, 
          first_name, 
          last_name,
          club,
          amount, 
          created_at, 
          created_by,
          member:members (
            first_name,
            last_name,
            phone
          )
        `)
        .eq('list_id', listId)
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Error fetching cotisation entries:', error);
        throw error;
      }
      return (data ?? []) as any[];
    },
    enabled: !!listId,
  });

  const addEntryMutation = useMutation({
    mutationFn: async (entry: {
      list_id: string;
      member_id: string | null;
      first_name: string;
      last_name: string;
      club: string;
      amount: number;
      created_by: string;
    }) => {
      const { error } = await supabase
        .from('cotisation_entries')
        .insert(entry);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast({ title: 'Cotisation ajoutée' });
    },
    onError: (err: any) => {
      console.error('Error adding cotisation entry:', err);
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cotisation_entries')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast({ title: 'Cotisation supprimée' });
    },
    onError: (err: any) => {
      console.error('Error deleting cotisation entry:', err);
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { member_id: string | null; first_name: string; last_name: string; club: string; amount: number } }) => {
      const { error } = await supabase
        .from('cotisation_entries')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast({ title: 'Cotisation mise à jour' });
    },
    onError: (err: any) => {
      console.error('Error updating cotisation entry:', err);
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  return {
    entries: (entries ?? []) as CotisationEntryWithMember[],
    isLoading,
    error,
    addEntry: (data: any) => addEntryMutation.mutateAsync(data),
    deleteEntry: (id: string) => deleteEntryMutation.mutateAsync(id),
    updateEntry: (id: string, data: { member_id: string | null; first_name: string; last_name: string; club: string; amount: number }) =>
      updateEntryMutation.mutateAsync({ id, data }),
    isMutating: addEntryMutation.isPending || deleteEntryMutation.isPending || updateEntryMutation.isPending,
  };
}

export function useCotisationExpenses(listId: string | null) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const queryKey = ['cotisation_expenses', listId];

  const { data: expenses = [], isLoading, error } = useQuery<CotisationExpense[]>({
    queryKey,
    queryFn: async () => {
      if (!listId) return [];
      const { data, error } = await supabase
        .from('cotisation_expenses')
        .select('*')
        .eq('list_id', listId)
        .order('date', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Error fetching cotisation expenses:', error);
        throw error;
      }
      return (data ?? []) as CotisationExpense[];
    },
    enabled: !!listId,
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (expense: {
      list_id: string;
      description: string;
      amount: number;
      date: string;
      created_by: string;
    }) => {
      const { error } = await supabase
        .from('cotisation_expenses')
        .insert(expense);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast({ title: 'Dépense ajoutée' });
    },
    onError: (err: any) => {
      console.error('Error adding cotisation expense:', err);
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { description: string; amount: number; date: string } }) => {
      const { error } = await supabase
        .from('cotisation_expenses')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast({ title: 'Dépense mise à jour' });
    },
    onError: (err: any) => {
      console.error('Error updating cotisation expense:', err);
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cotisation_expenses')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
      toast({ title: 'Dépense supprimée' });
    },
    onError: (err: any) => {
      console.error('Error deleting cotisation expense:', err);
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    },
  });

  return {
    expenses: (expenses ?? []) as CotisationExpense[],
    isLoading,
    error,
    addExpense: (data: any) => addExpenseMutation.mutateAsync(data),
    updateExpense: (id: string, data: { description: string; amount: number; date: string }) =>
      updateExpenseMutation.mutateAsync({ id, data }),
    deleteExpense: (id: string) => deleteExpenseMutation.mutateAsync(id),
    isMutating: addExpenseMutation.isPending || updateExpenseMutation.isPending || deleteExpenseMutation.isPending,
  };
}
