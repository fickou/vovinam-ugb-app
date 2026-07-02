import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { CotisationList, CotisationEntry, CotisationEntryWithMember } from '@/types/cotisations';

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

  const { data: entries = [], isLoading } = useQuery<CotisationEntryWithMember[]>({
    queryKey,
    queryFn: async () => {
      if (!listId) return [];
      const { data, error } = await supabase
        .from('cotisation_entries')
        .select('id, list_id, member_id, first_name, last_name, amount, created_at, created_by')
        .eq('list_id', listId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as CotisationEntryWithMember[];
    },
    enabled: !!listId,
  });

  const addEntryMutation = useMutation({
    mutationFn: async (entry: {
      list_id: string;
      member_id: string | null;
      first_name: string;
      last_name: string;
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
    onError: (err: any) => toast({ title: 'Erreur', description: err.message, variant: 'destructive' }),
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
    onError: (err: any) => toast({ title: 'Erreur', description: err.message, variant: 'destructive' }),
  });

  return {
    entries: (entries ?? []) as CotisationEntryWithMember[],
    isLoading,
    addEntry: (data: any) => addEntryMutation.mutateAsync(data),
    deleteEntry: (id: string) => deleteEntryMutation.mutateAsync(id),
    isMutating: addEntryMutation.isPending || deleteEntryMutation.isPending,
  };
}
