-- ============================================================
-- 10_commandes.sql (final - avec DROP POLICY IF EXISTS)
-- Module Commandes (Lacoste, Blouson, etc.) — Vovinam UGB
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

-- ── 1. Table des campagnes de commande ──────────────────────
CREATE TABLE IF NOT EXISTS public.order_campaigns (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  product_type  text NOT NULL,
  description   text,
  price         numeric(10,2) NOT NULL DEFAULT 0,
  available_sizes text[] NOT NULL DEFAULT '{}',
  deadline      date,
  is_active     boolean NOT NULL DEFAULT true,
  created_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ── 2. Table des commandes des pratiquants ──────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   uuid NOT NULL REFERENCES public.order_campaigns(id) ON DELETE CASCADE,
  first_name    text NOT NULL,
  last_name     text NOT NULL,
  phone         text NOT NULL,
  size          text NOT NULL,
  quantity      integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  notes         text,
  is_paid       boolean NOT NULL DEFAULT false,
  paid_at       timestamptz,
  validated_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ── 3. Index de performance ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_campaign_id ON public.orders(campaign_id);
CREATE INDEX IF NOT EXISTS idx_orders_is_paid ON public.orders(is_paid);
CREATE INDEX IF NOT EXISTS idx_order_campaigns_is_active ON public.order_campaigns(is_active);

-- ── 4. RLS — order_campaigns ─────────────────────────────────
ALTER TABLE public.order_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campaigns_public_read" ON public.order_campaigns;
CREATE POLICY "campaigns_public_read" ON public.order_campaigns
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "campaigns_staff_read_all" ON public.order_campaigns;
CREATE POLICY "campaigns_staff_read_all" ON public.order_campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id::text = auth.uid()::text
        AND role IN ('super_admin', 'admin', 'treasurer', 'coach')
    )
  );

DROP POLICY IF EXISTS "campaigns_staff_insert" ON public.order_campaigns;
CREATE POLICY "campaigns_staff_insert" ON public.order_campaigns
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id::text = auth.uid()::text
        AND role IN ('super_admin', 'admin', 'treasurer', 'coach')
    )
  );

DROP POLICY IF EXISTS "campaigns_staff_update" ON public.order_campaigns;
CREATE POLICY "campaigns_staff_update" ON public.order_campaigns
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id::text = auth.uid()::text
        AND role IN ('super_admin', 'admin', 'treasurer', 'coach')
    )
  );

DROP POLICY IF EXISTS "campaigns_staff_delete" ON public.order_campaigns;
CREATE POLICY "campaigns_staff_delete" ON public.order_campaigns
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id::text = auth.uid()::text
        AND role IN ('super_admin', 'admin', 'treasurer', 'coach')
    )
  );

-- ── 5. RLS — orders ──────────────────────────────────────────
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_public_insert" ON public.orders;
CREATE POLICY "orders_public_insert" ON public.orders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.order_campaigns
      WHERE id = campaign_id AND is_active = true
    )
  );

DROP POLICY IF EXISTS "orders_staff_read" ON public.orders;
CREATE POLICY "orders_staff_read" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id::text = auth.uid()::text
        AND role IN ('super_admin', 'admin', 'treasurer', 'coach')
    )
  );

DROP POLICY IF EXISTS "orders_staff_update" ON public.orders;
CREATE POLICY "orders_staff_update" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id::text = auth.uid()::text
        AND role IN ('super_admin', 'admin', 'treasurer', 'coach')
    )
  );

DROP POLICY IF EXISTS "orders_admin_delete" ON public.orders;
CREATE POLICY "orders_admin_delete" ON public.orders
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id::text = auth.uid()::text
        AND role IN ('super_admin', 'admin')
    )
  );

-- ── 6. Accès anonyme (anon role) pour l'insertion publique ───
GRANT SELECT ON public.order_campaigns TO anon;
GRANT INSERT ON public.orders TO anon;
GRANT SELECT ON public.order_campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_campaigns TO authenticated;