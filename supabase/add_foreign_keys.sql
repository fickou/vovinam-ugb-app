-- ============================================================
-- SCRIPT DE LIAISON DES TABLES (Foreign Keys)
-- À coller dans : Supabase Dashboard > SQL Editor
-- Ce script permet à Supabase de comprendre les relations entre vos tables
-- et de corriger les erreurs 400 (Bad Request).
-- ============================================================

-- 1. Liaisons pour la table PAYMENTS
ALTER TABLE public.payments
  ADD CONSTRAINT fk_payments_member FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_payments_season FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON DELETE CASCADE;

-- 2. Liaisons pour la table EXPENSES
ALTER TABLE public.expenses
  ADD CONSTRAINT fk_expenses_season FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON DELETE CASCADE;

-- 3. Liaisons pour la table BOARD_MEMBERS
ALTER TABLE public.board_members
  ADD CONSTRAINT fk_board_members_member FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_board_members_season FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON DELETE CASCADE;

-- 4. Liaisons pour la table REMINDERS
ALTER TABLE public.reminders
  ADD CONSTRAINT fk_reminders_member FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_reminders_season FOREIGN KEY (season_id) REFERENCES public.seasons(id) ON DELETE CASCADE;

-- 5. Liaisons pour la table USER_ROLES (vers PROFILES pour l'affichage)
-- Note : On lie par user_id pour que Supabase comprenne le select=...,profiles(...)
ALTER TABLE public.user_roles
  ADD CONSTRAINT fk_user_roles_profile FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- 6. Liaisons pour les profils vers auth.users (si ce n'est pas déjà fait)
-- ALTER TABLE public.profiles
--   ADD CONSTRAINT fk_profiles_auth_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
