-- ============================================================
-- SCRIPT 09 — Index de performance + Contraintes de sécurité
-- ============================================================

-- ════════════════════════════════════════════════════════════
-- A. INDEX DE PERFORMANCE
-- ════════════════════════════════════════════════════════════

-- payments : jointures fréquentes member_id + season_id
CREATE INDEX IF NOT EXISTS idx_payments_member_season
  ON public.payments(member_id, season_id);

-- payments : filtres sur le mois
CREATE INDEX IF NOT EXISTS idx_payments_month
  ON public.payments(month_number)
  WHERE month_number IS NOT NULL;

-- payments : tri par date de création (liste paginée)
CREATE INDEX IF NOT EXISTS idx_payments_created_at
  ON public.payments(created_at DESC);

-- payments : status (VALIDATED / PENDING)
CREATE INDEX IF NOT EXISTS idx_payments_status
  ON public.payments(status);

-- members : recherche par nom
CREATE INDEX IF NOT EXISTS idx_members_name
  ON public.members(last_name, first_name);

-- profiles : lookup par user_id
CREATE INDEX IF NOT EXISTS idx_profiles_user_id
  ON public.profiles(user_id);

-- demandes : email (déjà indexé via UNIQUE, ajout pour sécurité)
CREATE INDEX IF NOT EXISTS idx_demandes_status
  ON public.demandes(status);

-- ════════════════════════════════════════════════════════════
-- B. CONTRAINTES DE VALIDATION SERVEUR (filets de sécurité)
-- ════════════════════════════════════════════════════════════

-- Montant paiement strictement positif
ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_amount_positive;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_amount_positive
  CHECK (amount > 0);

-- Plafond anti-fraude : 500 000 FCFA maximum par paiement
ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_amount_max;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_amount_max
  CHECK (amount <= 500000);

-- Numéro de mois valide (1 à 12)
-- (payment_type et payment_method sont des ENUM PostgreSQL — pas besoin de CHECK)
ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_month_valid;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_month_valid
  CHECK (month_number IS NULL OR (month_number >= 1 AND month_number <= 12));

-- S'assurer que les valeurs 'transfer' et 'other' existent dans l'enum payments_method
-- (idempotent : ignoré si la valeur est déjà présente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'transfer'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payments_method')
  ) THEN
    ALTER TYPE payments_method ADD VALUE 'transfer';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'other'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payments_method')
  ) THEN
    ALTER TYPE payments_method ADD VALUE 'other';
  END IF;
END;
$$;

-- ════════════════════════════════════════════════════════════
-- C. CONTRAINTE ANTI-DOUBLON PAIEMENTS MENSUELS
-- Empêche d'enregistrer 2 fois la même mensualité pour le même membre
-- ════════════════════════════════════════════════════════════

-- 1. Nettoyage des doublons existants (garde le paiement le plus récent)
DELETE FROM public.payments
WHERE id NOT IN (
  SELECT DISTINCT ON (member_id, season_id, month_number) id
  FROM public.payments
  WHERE month_number IS NOT NULL AND payment_type = 'monthly'
  ORDER BY member_id, season_id, month_number, created_at DESC
)
AND month_number IS NOT NULL 
AND payment_type = 'monthly';

-- 2. Création de l'index unique
DROP INDEX IF EXISTS idx_payments_no_duplicate;
CREATE UNIQUE INDEX idx_payments_no_duplicate
  ON public.payments(member_id, season_id, month_number, payment_type)
  WHERE month_number IS NOT NULL
    AND payment_type = 'monthly';

-- ════════════════════════════════════════════════════════════
-- D. FONCTION SÉCURISÉE : paiements d'un membre connecté
-- Permet une RLS fine sans exposer la table entière
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_my_payments(_season_id text DEFAULT NULL)
RETURNS TABLE (
  id text,
  amount numeric,
  payment_type text,
  payment_method text,
  payment_date date,
  month_number int,
  status text,
  notes text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.amount,
    p.payment_type,
    p.payment_method,
    p.payment_date,
    p.month_number,
    p.status,
    p.notes,
    p.created_at
  FROM public.payments p
  INNER JOIN public.members m ON m.id = p.member_id
  INNER JOIN public.profiles pr ON
    pr.user_id = auth.uid()::text
    AND LOWER(pr.first_name) = LOWER(m.first_name)
    AND LOWER(pr.last_name) = LOWER(m.last_name)
  WHERE
    _season_id IS NULL OR p.season_id = _season_id;
$$;

-- Accorder l'accès aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION public.get_my_payments TO authenticated;

-- ════════════════════════════════════════════════════════════
-- E. RLS PAYMENTS AMÉLIORÉE
-- Les membres ne voient que leurs propres paiements
-- Les staff voient tout
-- ════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "payments_select" ON public.payments;
CREATE POLICY "payments_select" ON public.payments
  FOR SELECT TO authenticated
  USING (
    -- Le staff voit tout
    public.is_staff(auth.uid())
    OR
    -- Un membre voit uniquement ses propres paiements (via jointure membres <-> profil)
    EXISTS (
      SELECT 1
      FROM public.members m
      INNER JOIN public.profiles pr ON
        pr.user_id = auth.uid()::text
        AND LOWER(pr.first_name) = LOWER(m.first_name)
        AND LOWER(pr.last_name) = LOWER(m.last_name)
      WHERE m.id = payments.member_id
    )
  );

-- ════════════════════════════════════════════════════════════
-- F. SÉCURISER LES FONCTIONS EXPOSÉES
-- ════════════════════════════════════════════════════════════

-- Révoquer l'accès public aux fonctions sensibles
REVOKE ALL ON FUNCTION public.has_role FROM anon;
REVOKE ALL ON FUNCTION public.is_staff FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff TO authenticated;

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================
