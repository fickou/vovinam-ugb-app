-- ============================================================
-- SCRIPT 5 - Table Demandes & Nouveau Flux (Quarantaine)
-- À coller dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Création de la table demandes
-- Si elle existe déjà, on s'assure que user_id est de type texte pour correspondre au reste de la DB
CREATE TABLE IF NOT EXISTS public.demandes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id varchar(36) NOT NULL UNIQUE,
  email varchar(255) NOT NULL,
  first_name varchar(255) NOT NULL,
  last_name varchar(255) NOT NULL,
  status varchar(50) DEFAULT 'pending', -- 'pending', 'validated', 'rejected'
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Note technique : Si la table existait déjà avec un autre type, ce script ne le modifiera pas.
-- On s'assure donc que les politiques utilisent des casts explicites.

-- 2. Sécurisation de la table (RLS)
ALTER TABLE public.demandes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "demandes_select" ON public.demandes;
DROP POLICY IF EXISTS "demandes_update" ON public.demandes;
DROP POLICY IF EXISTS "demandes_insert_auth" ON public.demandes;
DROP POLICY IF EXISTS "demandes_insert_public" ON public.demandes;

CREATE POLICY "demandes_select" ON public.demandes
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()::text OR public.is_staff(auth.uid()));

CREATE POLICY "demandes_update" ON public.demandes
  FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()));

-- Autoriser l'insertion (Fallback pour le front-end)
CREATE POLICY "demandes_insert_public" ON public.demandes
  FOR INSERT WITH CHECK (true);


-- 3. Fin du script (Les déclencheurs ont été supprimés pour simplifier le flux)
-- Le code React (useAuth.tsx) gère désormais lui-même l'insertion dans cette table.

