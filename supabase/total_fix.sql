-- ============================================================
-- SCRIPT DE RÉPARATION TOTALE (RLS + JOINS + PERFORMANCE)
-- À coller dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. CASSER LES BOUCLES RÉCURSIVES (RLS)
-- On simplifie l'accès aux rôles pour éviter que is_staff() ne s'appelle lui-même
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_roles_select" ON public.user_roles;
CREATE POLICY "user_roles_select" ON public.user_roles
  FOR SELECT TO authenticated
  USING (true); -- Tout le monde connecté peut voir les rôles (nécessaire pour is_staff)

-- 2. RÉPARER LES JOINTURES (Foreign Keys)
-- Supabase a besoin de ces liens pour faire les "select=*,seasons(*)"
-- On supprime les anciennes contraintes si elles existent pour éviter les erreurs
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS fk_payments_member;
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS fk_payments_season;
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS fk_expenses_season;
ALTER TABLE public.board_members DROP CONSTRAINT IF EXISTS fk_board_members_member;
ALTER TABLE public.board_members DROP CONSTRAINT IF EXISTS fk_board_members_season;
ALTER TABLE public.reminders DROP CONSTRAINT IF EXISTS fk_reminders_member;
ALTER TABLE public.reminders DROP CONSTRAINT IF EXISTS fk_reminders_season;

-- Ajout des contraintes PROPRES
ALTER TABLE public.payments
  ADD CONSTRAINT fk_payments_member FOREIGN KEY (member_id) REFERENCES public.members(id),
  ADD CONSTRAINT fk_payments_season FOREIGN KEY (season_id) REFERENCES public.seasons(id);

ALTER TABLE public.expenses
  ADD CONSTRAINT fk_expenses_season FOREIGN KEY (season_id) REFERENCES public.seasons(id);

ALTER TABLE public.board_members
  ADD CONSTRAINT fk_board_members_member FOREIGN KEY (member_id) REFERENCES public.members(id),
  ADD CONSTRAINT fk_board_members_season FOREIGN KEY (season_id) REFERENCES public.seasons(id);

ALTER TABLE public.reminders
  ADD CONSTRAINT fk_reminders_member FOREIGN KEY (member_id) REFERENCES public.members(id),
  ADD CONSTRAINT fk_reminders_season FOREIGN KEY (season_id) REFERENCES public.seasons(id);

-- 3. FIX POUR LES PROFILS (Évite les 400 sur la gestion des utilisateurs)
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS fk_user_roles_profile;
ALTER TABLE public.user_roles
  ADD CONSTRAINT fk_user_roles_profile FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);

-- 4. VÉRIFICATION DE LA SAISON ACTIVE
-- S'il n'y a pas de saison active, beaucoup de filtres renvoient 0
UPDATE public.seasons SET is_active = (id = (SELECT id FROM public.seasons ORDER BY start_date DESC LIMIT 1));

-- 5. PERFORMANCE : INDEXES (Pour que ça charge vite)
CREATE INDEX IF NOT EXISTS idx_payments_season ON public.payments(season_id);
CREATE INDEX IF NOT EXISTS idx_expenses_season ON public.expenses(season_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status);
