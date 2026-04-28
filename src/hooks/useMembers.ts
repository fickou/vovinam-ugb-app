/**
 * @file src/hooks/useMembers.ts
 * Hook React Query pour la gestion CRUD des membres.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  fetchMembers,
  createMember,
  updateMember,
  deleteMember,
} from '@/lib/supabase/members';
import type { Member, MemberFormData } from '@/types';

const QUERY_KEY = ['members'] as const;

export function useMembers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: members = [], isLoading: loading } = useQuery<Member[]>({
    queryKey: QUERY_KEY,
    queryFn: fetchMembers,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (payload: MemberFormData) => createMember(payload),
    onSuccess: () => {
      toast({ title: 'Succès', description: 'Pratiquant ajouté avec succès' });
      invalidate();
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message ?? "Impossible d'ajouter le pratiquant", variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MemberFormData }) => updateMember(id, payload),
    onSuccess: () => {
      toast({ title: 'Succès', description: 'Pratiquant modifié avec succès' });
      invalidate();
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message ?? "Impossible de modifier le pratiquant", variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMember(id),
    onSuccess: () => {
      toast({ title: 'Succès', description: 'Pratiquant supprimé avec succès' });
      invalidate();
    },
    onError: (err: any) => {
      toast({ title: 'Erreur', description: err.message ?? "Impossible de supprimer le pratiquant", variant: 'destructive' });
    },
  });

  return {
    members,
    loading,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    create: createMutation.mutate,
    update: (id: string, payload: MemberFormData) => updateMutation.mutate({ id, payload }),
    remove: deleteMutation.mutate,
  };
}
