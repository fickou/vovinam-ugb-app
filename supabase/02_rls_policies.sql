-- ============================================================
-- SCRIPT 2/3 — Row Level Security (RLS) (CORRIGÉ)
-- À coller dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- ════════════════════════════════════════════════════════════
-- TABLE : members
-- ════════════════════════════════════════════════════════════
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "members_select" ON public.members;
DROP POLICY IF EXISTS "members_insert" ON public.members;
DROP POLICY IF EXISTS "members_update" ON public.members;
DROP POLICY IF EXISTS "members_delete" ON public.members;

CREATE POLICY "members_select" ON public.members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "members_insert" ON public.members
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "members_update" ON public.members
  FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "members_delete" ON public.members
  FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()));

-- ════════════════════════════════════════════════════════════
-- TABLE : payments
-- ════════════════════════════════════════════════════════════
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payments_select" ON public.payments;
DROP POLICY IF EXISTS "payments_insert" ON public.payments;
DROP POLICY IF EXISTS "payments_update" ON public.payments;
DROP POLICY IF EXISTS "payments_delete" ON public.payments;

CREATE POLICY "payments_select" ON public.payments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "payments_insert" ON public.payments
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "payments_update" ON public.payments
  FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "payments_delete" ON public.payments
  FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()));

-- ════════════════════════════════════════════════════════════
-- TABLE : seasons
-- ════════════════════════════════════════════════════════════
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "seasons_select" ON public.seasons;
DROP POLICY IF EXISTS "seasons_insert" ON public.seasons;
DROP POLICY IF EXISTS "seasons_update" ON public.seasons;
DROP POLICY IF EXISTS "seasons_delete" ON public.seasons;

CREATE POLICY "seasons_select" ON public.seasons
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "seasons_insert" ON public.seasons
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "seasons_update" ON public.seasons
  FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "seasons_delete" ON public.seasons
  FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()));

-- ════════════════════════════════════════════════════════════
-- TABLE : expenses
-- ════════════════════════════════════════════════════════════
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "expenses_select" ON public.expenses;
DROP POLICY IF EXISTS "expenses_insert" ON public.expenses;
DROP POLICY IF EXISTS "expenses_update" ON public.expenses;
DROP POLICY IF EXISTS "expenses_delete" ON public.expenses;

CREATE POLICY "expenses_select" ON public.expenses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "expenses_insert" ON public.expenses
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "expenses_update" ON public.expenses
  FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "expenses_delete" ON public.expenses
  FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()));

-- ════════════════════════════════════════════════════════════
-- TABLE : board_members
-- ════════════════════════════════════════════════════════════
ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "board_members_select" ON public.board_members;
DROP POLICY IF EXISTS "board_members_insert" ON public.board_members;
DROP POLICY IF EXISTS "board_members_update" ON public.board_members;
DROP POLICY IF EXISTS "board_members_delete" ON public.board_members;

CREATE POLICY "board_members_select" ON public.board_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "board_members_insert" ON public.board_members
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role('admin', auth.uid()) OR public.has_role('super_admin', auth.uid()));

CREATE POLICY "board_members_update" ON public.board_members
  FOR UPDATE TO authenticated
  USING (public.has_role('admin', auth.uid()) OR public.has_role('super_admin', auth.uid()));

CREATE POLICY "board_members_delete" ON public.board_members
  FOR DELETE TO authenticated
  USING (public.has_role('admin', auth.uid()) OR public.has_role('super_admin', auth.uid()));

-- ════════════════════════════════════════════════════════════
-- TABLE : reminders
-- ════════════════════════════════════════════════════════════
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reminders_select" ON public.reminders;
DROP POLICY IF EXISTS "reminders_insert" ON public.reminders;
DROP POLICY IF EXISTS "reminders_delete" ON public.reminders;

CREATE POLICY "reminders_select" ON public.reminders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "reminders_insert" ON public.reminders
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "reminders_delete" ON public.reminders
  FOR DELETE TO authenticated
  USING (public.is_staff(auth.uid()));

-- ════════════════════════════════════════════════════════════
-- TABLE : registrations
-- ════════════════════════════════════════════════════════════
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "registrations_select" ON public.registrations;
DROP POLICY IF EXISTS "registrations_insert" ON public.registrations;
DROP POLICY IF EXISTS "registrations_update" ON public.registrations;

CREATE POLICY "registrations_select" ON public.registrations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "registrations_insert" ON public.registrations
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "registrations_update" ON public.registrations
  FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()));

-- ════════════════════════════════════════════════════════════
-- TABLE : profiles
-- ════════════════════════════════════════════════════════════
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()::text OR public.is_staff(auth.uid()));

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()::text OR public.is_staff(auth.uid()));

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()::text OR public.is_staff(auth.uid()));

-- ════════════════════════════════════════════════════════════
-- TABLE : user_roles
-- ════════════════════════════════════════════════════════════
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_roles_select" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete" ON public.user_roles;

CREATE POLICY "user_roles_select" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()::text OR public.is_staff(auth.uid()));

CREATE POLICY "user_roles_insert" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role('super_admin', auth.uid()) OR public.has_role('admin', auth.uid()));

CREATE POLICY "user_roles_update" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role('super_admin', auth.uid()) OR public.has_role('admin', auth.uid()));

CREATE POLICY "user_roles_delete" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role('super_admin', auth.uid()));
