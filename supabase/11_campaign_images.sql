-- ============================================================
-- 11_campaign_images.sql
-- Bucket public pour les images d'échantillons de campagnes
-- À exécuter dans Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Ajouter la colonne image_url à order_campaigns
ALTER TABLE public.order_campaigns
  ADD COLUMN IF NOT EXISTS image_url text;

-- 2. Créer le bucket public "campaign-images"
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campaign-images',
  'campaign-images',
  true,                            -- Public (URLs directes, pas besoin de signature)
  3145728,                         -- 3 MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public            = EXCLUDED.public,
  file_size_limit   = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Upload réservé au staff authentifié
DROP POLICY IF EXISTS "campaign_images_insert" ON storage.objects;
CREATE POLICY "campaign_images_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'campaign-images'
    AND public.is_staff(auth.uid())
  );

-- 4. Lecture publique (nécessaire pour afficher l'image dans le formulaire public)
DROP POLICY IF EXISTS "campaign_images_select" ON storage.objects;
CREATE POLICY "campaign_images_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'campaign-images');

-- 5. Suppression réservée au staff
DROP POLICY IF EXISTS "campaign_images_delete" ON storage.objects;
CREATE POLICY "campaign_images_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'campaign-images'
    AND public.is_staff(auth.uid())
  );
