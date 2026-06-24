-- ============================================================
-- 13_auto_tuteurs.sql
-- Mettre à jour les numéros des tuteurs pour les pratiquants
-- qui partagent le même numéro de téléphone.
-- À exécuter dans Supabase Dashboard > SQL Editor
-- ============================================================

WITH SharedPhones AS (
  -- 1. Trouver les numéros de téléphone utilisés par au moins 2 pratiquants
  SELECT phone
  FROM public.members
  WHERE phone IS NOT NULL AND phone != ''
  GROUP BY phone
  HAVING COUNT(*) > 1
)
-- 2. Mettre à jour ces pratiquants pour définir leur tuteur
UPDATE public.members
SET 
  guardian_phone = phone,
  guardian_name = 'Tuteur (Auto)'
WHERE phone IN (SELECT phone FROM SharedPhones)
  AND (guardian_phone IS NULL OR guardian_phone = '');
