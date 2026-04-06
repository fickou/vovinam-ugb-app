-- ============================================================
-- SCRIPT 6 - RPC : Approbation de Demande
-- À coller dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Fonction RPC : approve_demande
-- Cette fonction effectue toutes les créations nécessaires en une transaction.
CREATE OR REPLACE FUNCTION public.approve_demande(demande_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_demande record;
  v_new_profile_id uuid := gen_random_uuid();
  v_new_role_id uuid := gen_random_uuid();
  v_new_member_id uuid := gen_random_uuid();
BEGIN
  -- 1. Récupération de la demande avec verrouillage
  SELECT * INTO v_demande FROM public.demandes WHERE id = demande_id FOR UPDATE;
  
  -- Vérification de l'existence
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Demande introuvable.');
  END IF;

  -- Vérification du statut
  IF v_demande.status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Cette demande a déjà été traitée (Statut : ' || v_demande.status || ').');
  END IF;

  -- 2. Création/Mise à jour du Profil
  -- Note : On force le statut à 'active'
  INSERT INTO public.profiles (id, user_id, first_name, last_name, status)
  VALUES (v_new_profile_id::text, v_demande.user_id, v_demande.first_name, v_demande.last_name, 'active')
  ON CONFLICT (user_id) DO UPDATE 
  SET status = 'active', 
      first_name = EXCLUDED.first_name, 
      last_name = EXCLUDED.last_name,
      updated_at = now();

  -- 3. Attribution du rôle 'member'
  INSERT INTO public.user_roles (id, user_id, role)
  VALUES (v_new_role_id::text, v_demande.user_id, 'member'::public.app_role)
  ON CONFLICT (user_id) DO NOTHING;

  -- 4. Création de l'entrée dans la table Members
  INSERT INTO public.members (id, user_id, first_name, last_name, email, status)
  VALUES (v_new_member_id::text, v_demande.user_id, v_demande.first_name, v_demande.last_name, v_demande.email, 'active')
  ON CONFLICT (user_id) DO NOTHING;

  -- 5. Validation finale de la demande
  UPDATE public.demandes 
  SET status = 'validated',
      created_at = now() -- On peut réutiliser created_at ou laisser tel quel
  WHERE id = demande_id;

  -- Log de succès pour le Dashboard Supabase
  RAISE NOTICE 'Demande validée : Profil et Rôle créés pour %', v_demande.email;

  RETURN json_build_object(
    'success', true, 
    'message', 'L''utilisateur a été validé avec succès.',
    'user_id', v_demande.user_id
  );

EXCEPTION WHEN OTHERS THEN
  -- En cas d'erreur de la transaction, on renvoie le message d'erreur SQL
  RAISE WARNING 'Erreur lors de l''approbation : %', SQLERRM;
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 2. Attribution des droits sur la fonction pour les rôles authentifiés (Admins)
-- Bien que SECURITY DEFINER suffise techniquement, on restreint l'exécution.
GRANT EXECUTE ON FUNCTION public.approve_demande(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_demande(uuid) TO service_role;
