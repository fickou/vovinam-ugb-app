/**
 * @file src/hooks/useSeasons.ts
 * Hook React Query pour récupérer la liste des saisons.
 * Partagé par : Reports, FinancialBalance, Expenses, Payments…
 */
import { useQuery } from '@tanstack/react-query';
import { fetchSeasons } from '@/lib/supabase/seasons';
import type { Season } from '@/types';

export function useSeasons() {
  const { data: seasons = [], isLoading: loading } = useQuery<Season[]>({
    queryKey: ['seasons'],
    queryFn: fetchSeasons,
    staleTime: 5 * 60_000, // 5 min — les saisons changent rarement
  });

  return { seasons, loading };
}
