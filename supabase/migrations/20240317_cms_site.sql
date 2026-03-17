-- Migration pour le CMS du site public

-- 1. Table site_settings pour les textes et configs structurées JSON
CREATE TABLE IF NOT EXISTS public.site_settings (
    section_key VARCHAR PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES auth.users(id)
);

-- Active RLS sur site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : Tout le monde peut lire le contenu du site
CREATE POLICY "Le contenu du site est accessible publiquement" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- Politique d'écriture : Seuls les admins et le bureau peuvent modifier
CREATE POLICY "Les admins et bureau gèrent le contenu du site"
ON public.site_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()::varchar
    AND user_roles.role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()::varchar
    AND user_roles.role IN ('admin', 'super_admin')
  )
);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_site_settings_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trg_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION update_site_settings_updated_at_column();


-- 2. Table public_gallery pour les images
CREATE TABLE IF NOT EXISTS public.public_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    label VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- Active RLS sur public_gallery
ALTER TABLE public.public_gallery ENABLE ROW LEVEL SECURITY;

-- Politique de lecture galerie : Tout le monde
CREATE POLICY "Galerie lisible publiquement"
ON public.public_gallery
FOR SELECT
USING (true);

-- Politique d'écriture galerie : Admin/Bureau
CREATE POLICY "Admins gèrent la galerie"
ON public.public_gallery
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()::varchar
    AND user_roles.role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()::varchar
    AND user_roles.role IN ('admin', 'super_admin')
  )
);


-- 3. Bucket de stockage pour les assets publics (images, etc)
INSERT INTO storage.buckets (id, name, public) VALUES ('public-assets', 'public-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policies pour le bucket public-assets
DO $$
BEGIN
    -- Lecteure publique
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access to public-assets'
    ) THEN
        CREATE POLICY "Public Access to public-assets" ON storage.objects FOR SELECT USING ( bucket_id = 'public-assets' );
    END IF;

    -- Ajout pour Auth/Admins
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can upload to public-assets'
    ) THEN
        CREATE POLICY "Admins can upload to public-assets" ON storage.objects FOR INSERT WITH CHECK (
            bucket_id = 'public-assets' AND 
            EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_roles.user_id = auth.uid()::varchar 
                AND user_roles.role IN ('admin', 'super_admin')
            )
        );
    END IF;

    -- Update pour Auth/Admins
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can update public-assets'
    ) THEN
        CREATE POLICY "Admins can update public-assets" ON storage.objects FOR UPDATE USING (
            bucket_id = 'public-assets' AND 
            EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_roles.user_id = auth.uid()::varchar 
                AND user_roles.role IN ('admin', 'super_admin')
            )
        );
    END IF;

    -- Delete pour Auth/Admins
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can delete public-assets'
    ) THEN
        CREATE POLICY "Admins can delete public-assets" ON storage.objects FOR DELETE USING (
            bucket_id = 'public-assets' AND 
            EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_roles.user_id = auth.uid()::varchar 
                AND user_roles.role IN ('admin', 'super_admin')
            )
        );
    END IF;
END $$;
