-- ============================================================
-- SCRIPT 14 — Cotisations (Listes et Entrées)
-- À coller dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. TABLE : cotisation_lists (Listes de cotisation)
CREATE TABLE IF NOT EXISTS public.cotisation_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. TABLE : cotisation_entries (Entrées de cotisation)
CREATE TABLE IF NOT EXISTS public.cotisation_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.cotisation_lists(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  amount DECIMAL(10, 2) DEFAULT 0,
  created_by UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. INDEXES pour performance
CREATE INDEX IF NOT EXISTS idx_cotisation_lists_created_by ON public.cotisation_lists(created_by);
CREATE INDEX IF NOT EXISTS idx_cotisation_entries_list_id ON public.cotisation_entries(list_id);
CREATE INDEX IF NOT EXISTS idx_cotisation_entries_member_id ON public.cotisation_entries(member_id);

-- 4. ROW LEVEL SECURITY
ALTER TABLE public.cotisation_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotisation_entries ENABLE ROW LEVEL SECURITY;

-- Politiques pour cotisation_lists
DROP POLICY IF EXISTS "cotisation_lists_select" ON public.cotisation_lists;
CREATE POLICY "cotisation_lists_select" ON public.cotisation_lists
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "cotisation_lists_insert" ON public.cotisation_lists;
CREATE POLICY "cotisation_lists_insert" ON public.cotisation_lists
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) OR created_by = auth.uid()::text);

DROP POLICY IF EXISTS "cotisation_lists_update" ON public.cotisation_lists;
CREATE POLICY "cotisation_lists_update" ON public.cotisation_lists
  FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()) OR created_by = auth.uid()::text);

DROP POLICY IF EXISTS "cotisation_lists_delete" ON public.cotisation_lists;
CREATE POLICY "cotisation_lists_delete" ON public.cotisation_lists
  FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()) OR created_by = auth.uid()::text);

-- Politiques pour cotisation_entries
DROP POLICY IF EXISTS "cotisation_entries_select" ON public.cotisation_entries;
CREATE POLICY "cotisation_entries_select" ON public.cotisation_entries
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "cotisation_entries_insert" ON public.cotisation_entries;
CREATE POLICY "cotisation_entries_insert" ON public.cotisation_entries
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) OR created_by = auth.uid()::text);

DROP POLICY IF EXISTS "cotisation_entries_update" ON public.cotisation_entries;
CREATE POLICY "cotisation_entries_update" ON public.cotisation_entries
  FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()) OR created_by = auth.uid()::text);

DROP POLICY IF EXISTS "cotisation_entries_delete" ON public.cotisation_entries;
CREATE POLICY "cotisation_entries_delete" ON public.cotisation_entries
  FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()) OR created_by = auth.uid()::text);
