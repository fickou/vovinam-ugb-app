-- ============================================================
-- SCRIPT 8 - Fonctionnalités Espace Membre
-- À coller dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Ajout de la colonne telephone à la table demandes (si elle n'existe pas)
ALTER TABLE public.demandes
  ADD COLUMN IF NOT EXISTS telephone varchar(20);

-- 2. Suppression des doublons d'email avant d'ajouter la contrainte unique
--    (On garde la ligne la plus récente pour chaque email en doublon)
DELETE FROM public.demandes
WHERE id NOT IN (
  SELECT DISTINCT ON (email) id
  FROM public.demandes
  ORDER BY email, created_at DESC
);

-- 3. Ajout de la contrainte UNIQUE sur email dans la table demandes
ALTER TABLE public.demandes
  DROP CONSTRAINT IF EXISTS demandes_email_unique;

ALTER TABLE public.demandes
  ADD CONSTRAINT demandes_email_unique UNIQUE (email);

-- 4. (Optionnel) Index pour accélérer les recherches par email
CREATE INDEX IF NOT EXISTS idx_demandes_email ON public.demandes(email);

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================
