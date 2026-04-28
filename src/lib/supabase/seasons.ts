/**
 * @file src/lib/supabase/seasons.ts
 * Couche service pour la table `seasons`.
 * Tous les appels Supabase liés aux saisons passent par ici.
 */
import { supabase } from '@/integrations/supabase/client';
import type { Season } from '@/types';

/** Récupère toutes les saisons, de la plus récente à la plus ancienne. */
export async function fetchSeasons(): Promise<Season[]> {
  const { data, error } = await supabase
    .from('seasons')
    .select('id, name, is_active, start_date')
    .order('start_date', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Season[];
}

/** Retourne uniquement la saison active, ou undefined si aucune. */
export async function fetchActiveSeason(): Promise<Season | undefined> {
  const { data, error } = await supabase
    .from('seasons')
    .select('id, name, is_active, start_date')
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return data ?? undefined;
}
