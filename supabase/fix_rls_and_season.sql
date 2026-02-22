-- ============================================================
-- SCRIPT DE DÉBLOCAGE RLS & SAISON
-- À coller dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Simplification de la politique des rôles (évite la boucle infinie)
DROP POLICY IF EXISTS "user_roles_select" ON public.user_roles;
CREATE POLICY "user_roles_select" ON public.user_roles
  FOR SELECT TO authenticated
  USING (true); -- Permet à tout utilisateur connecté de lire les rôles sans boucle

-- 2. S'assurer qu'il y a au moins une saison active (TRÈS IMPORTANT pour l'affichage)
-- Si vous ne voyez rien, c'est peut-être car aucune saison n'est marquée 'is_active'
UPDATE public.seasons SET is_active = false; -- Reset
UPDATE public.seasons 
SET is_active = true 
WHERE id = (SELECT id FROM public.seasons ORDER BY start_date DESC LIMIT 1); -- Active la plus récente

-- 3. Vérification de votre statut (Admin)
-- Remplacez l'ID par le vôtre si nécessaire
UPDATE public.user_roles 
SET role = 'super_admin' 
WHERE user_id = 'b14a59c8-a212-47a7-b85a-cea29f12fe56';
