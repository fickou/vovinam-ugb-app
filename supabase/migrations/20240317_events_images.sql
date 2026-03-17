-- Migration pour gérer les événements et les images d'événements

-- 1. Table des événements
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME,
    location VARCHAR,
    type VARCHAR NOT NULL DEFAULT 'training',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- Active RLS sur events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : Tout le monde peut lire les événements
CREATE POLICY "Les événements sont lisibles publiquement"
ON public.events
FOR SELECT
USING (true);

-- Politique d'écriture : Seuls les admins et le bureau peuvent créer/modifier
CREATE POLICY "Les admins gèrent les événements"
ON public.events
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()::varchar
    AND user_roles.role IN ('admin', 'bureau')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()::varchar
    AND user_roles.role IN ('admin', 'bureau')
  )
);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_events_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_events_updated_at ON public.events;
CREATE TRIGGER trg_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION update_events_updated_at_column();


-- 2. Table de liaison entre les événements et les images
CREATE TABLE IF NOT EXISTS public.event_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    label VARCHAR,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- Index pour les requêtes par event_id
CREATE INDEX IF NOT EXISTS idx_event_images_event_id ON public.event_images(event_id);

-- Active RLS sur event_images
ALTER TABLE public.event_images ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : Tout le monde peut lire les images d'événements
CREATE POLICY "Les images d'événements sont lisibles publiquement"
ON public.event_images
FOR SELECT
USING (true);

-- Politique d'écriture : Seuls les admins et le bureau
CREATE POLICY "Les admins gèrent les images d'événements"
ON public.event_images
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()::varchar
    AND user_roles.role IN ('admin', 'bureau')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()::varchar
    AND user_roles.role IN ('admin', 'bureau')
  )
);


-- 3. Correction de la table public_gallery : rendre created_by nullable pour les images publiques existantes
ALTER TABLE public.public_gallery 
ALTER COLUMN created_by DROP NOT NULL;

-- Mise à jour de la politique RLS pour public_gallery pour gérer les cas de created_by NULL
CREATE OR REPLACE POLICY "Admins gèrent la galerie (updated)"
ON public.public_gallery
FOR ALL
USING (
  (created_by IS NULL) OR
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()::varchar
    AND user_roles.role IN ('admin', 'bureau')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()::varchar
    AND user_roles.role IN ('admin', 'bureau')
  )
);
