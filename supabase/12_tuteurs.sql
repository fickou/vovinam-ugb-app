-- ============================================================
-- 12_tuteurs.sql
-- Ajout des champs tuteur sur la table members
-- À exécuter dans Supabase Dashboard > SQL Editor
-- ============================================================

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS guardian_name  text,
  ADD COLUMN IF NOT EXISTS guardian_phone text;

-- Index pour retrouver rapidement tous les élèves d'un tuteur
CREATE INDEX IF NOT EXISTS idx_members_guardian_phone
  ON public.members(guardian_phone)
  WHERE guardian_phone IS NOT NULL;
