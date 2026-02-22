-- ============================================================
-- RESTRICTION DES PERMISSIONS SAISONS (ADMIN UNIQUEMENT)
-- À coller dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- On s'assure que tout le monde peut toujours voir les saisons (déjà le cas, mais par sécurité)
DROP POLICY IF EXISTS "seasons_select" ON public.seasons;
CREATE POLICY "seasons_select" ON public.seasons
  FOR SELECT TO authenticated USING (true);

-- On restreint Insert/Update/Delete aux admins uniquement (Trésorier exclu de la modification)
DROP POLICY IF EXISTS "seasons_insert" ON public.seasons;
CREATE POLICY "seasons_insert" ON public.seasons
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role('admin', auth.uid()) OR public.has_role('super_admin', auth.uid()));

DROP POLICY IF EXISTS "seasons_update" ON public.seasons;
CREATE POLICY "seasons_update" ON public.seasons
  FOR UPDATE TO authenticated
  USING (public.has_role('admin', auth.uid()) OR public.has_role('super_admin', auth.uid()));

DROP POLICY IF EXISTS "seasons_delete" ON public.seasons;
CREATE POLICY "seasons_delete" ON public.seasons
  FOR DELETE TO authenticated
  USING (public.has_role('admin', auth.uid()) OR public.has_role('super_admin', auth.uid()));

-- Rappels : Le trésorier fait déjà partie de is_staff(), donc il a déjà accès.
-- On réaffirme juste la politique pour clarté.
DROP POLICY IF EXISTS "reminders_insert" ON public.reminders;
CREATE POLICY "reminders_insert" ON public.reminders
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));
