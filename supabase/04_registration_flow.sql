-- ============================================================
-- SCRIPT 4/4 — Inscription & Profil
-- À coller dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Ajout de la colonne status et date_of_birth à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS date_of_birth date;

-- 2. Pour ne pas bloquer les utilisateurs existants, on les passe en statut 'active'
UPDATE public.profiles SET status = 'active' WHERE status = 'pending';

-- 3. Mise à jour des policies RLS pour la table profiles 
-- (Si un utilisateur peut lire/mettre à jour son propre profil, on s'assure que c'est bien géré)
DROP POLICY IF EXISTS "Les utilisateurs peuvent lire tous les profils" ON public.profiles;
CREATE POLICY "Les utilisateurs peuvent lire tous les profils" ON public.profiles
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leur propre profil" ON public.profiles;
CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil" ON public.profiles
FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 4. Options RLS pour la table Members (les admins peuvent inserer, etc.)
-- Déjà censées exister, on re-confirme:
DROP POLICY IF EXISTS "Les admins gèrent les membres" ON public.members;
CREATE POLICY "Les admins gèrent les membres" ON public.members
FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- 5. Création du Bucket Storage pour les avatars (si non existant)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy pour permettre aux utilisateurs loggués de voir les avatars
DROP POLICY IF EXISTS "Images accessibles a tous" ON storage.objects;
CREATE POLICY "Images accessibles a tous" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Policy pour permettre l'upload uniquement pour l'utilisateur
DROP POLICY IF EXISTS "Les utilisateurs peuvent uploader leur propre avatar" ON storage.objects;
CREATE POLICY "Les utilisateurs peuvent uploader leur propre avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy pour la mise a jour
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leur propre avatar" ON storage.objects;
CREATE POLICY "Les utilisateurs peuvent modifier leur propre avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy pour la suppression
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leur propre avatar" ON storage.objects;
CREATE POLICY "Les utilisateurs peuvent supprimer leur propre avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
