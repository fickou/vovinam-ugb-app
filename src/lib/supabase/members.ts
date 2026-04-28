/**
 * @file src/lib/supabase/members.ts
 * Couche service pour la table `members`.
 */
import { supabase } from '@/integrations/supabase/client';
import type { Member, MemberFormData } from '@/types';

/** Récupère tous les membres, du plus récent au plus ancien. */
export async function fetchMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Member[];
}

/** Crée un nouveau membre. */
export async function createMember(payload: MemberFormData): Promise<void> {
  const { error } = await supabase
    .from('members')
    .insert({ ...payload, id: crypto.randomUUID() });

  if (error) throw error;
}

/** Met à jour un membre existant. */
export async function updateMember(id: string, payload: MemberFormData): Promise<void> {
  const { error } = await supabase
    .from('members')
    .update(payload)
    .eq('id', id);

  if (error) throw error;
}

/** Supprime un membre. */
export async function deleteMember(id: string): Promise<void> {
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
