-- ============================================================
-- SCRIPT 7 - Modification Table Demandes (Nouveau Flux)
-- ============================================================

-- 1. Ajouter la colonne password_temp si elle n'existe pas
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='demandes' AND column_name='password_temp') THEN
        ALTER TABLE public.demandes ADD COLUMN password_temp text;
    END IF;
END $$;

-- 2. Rendre user_id optionnel (nullable)
ALTER TABLE public.demandes ALTER COLUMN user_id DROP NOT NULL;

-- 3. Retirer la contrainte UNIQUE sur user_id (car plusieurs NULL entreraient en conflit sinon)
ALTER TABLE public.demandes DROP CONSTRAINT IF EXISTS demandes_user_id_key;

-- 4. RLS - Assurer la protection de password_temp
-- Supabase ne permet pas de masquer des colonnes via RLS (seulement par lignes),
-- mais on restreint déjà SELECT aux admins.
-- On s'assure que personne d'autre ne peut lire le mot de passe.
DROP POLICY IF EXISTS "demandes_select" ON public.demandes;
CREATE POLICY "demandes_select" ON public.demandes
  FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid())); -- SEULS les admins peuvent voir le contenu (incluant pass_temp)

-- Note: l'inscription (insert) reste ouverte à tous via "demandes_insert_public"
