-- ============================================================
-- SCRIPT DE FIX STORAGE : Bucket PUBLIC
-- À coller dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Passer le bucket en PUBLIC pour que getPublicUrl() fonctionne
UPDATE storage.buckets 
SET public = true 
WHERE id = 'proofs';

-- 2. Autoriser la lecture publique des fichiers (nécessaire pour un bucket public)
DROP POLICY IF EXISTS "proofs_public_select" ON storage.objects;
CREATE POLICY "proofs_public_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'proofs');

-- 3. Conserver la restriction d'upload aux utilisateurs connectés
DROP POLICY IF EXISTS "proofs_insert" ON storage.objects;
CREATE POLICY "proofs_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'proofs');
