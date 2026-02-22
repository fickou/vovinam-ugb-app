-- ============================================================
-- SCRIPT 3/3 — Supabase Storage : bucket "proofs" (CORRIGÉ)
-- À coller dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Créer le bucket s'il n'existe pas déjà
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'proofs',
  'proofs',
  false,                           -- Privé (URLs signées uniquement)
  5242880,                         -- 5 MB max par fichier
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Politique : UPLOAD — tout utilisateur authentifié peut uploader
DROP POLICY IF EXISTS "proofs_insert" ON storage.objects;
CREATE POLICY "proofs_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'proofs');

-- 3. Politique : SELECT — seul le staff peut voir les preuves
DROP POLICY IF EXISTS "proofs_select" ON storage.objects;
CREATE POLICY "proofs_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'proofs'
    AND public.is_staff(auth.uid())
  );

-- 4. Politique : DELETE — seul l'admin peut supprimer
DROP POLICY IF EXISTS "proofs_delete" ON storage.objects;
CREATE POLICY "proofs_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'proofs'
    AND (
      public.has_role('admin', auth.uid())
      OR public.has_role('super_admin', auth.uid())
    )
  );
