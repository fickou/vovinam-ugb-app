-- ============================================================
-- FIX: Ajouter gen_random_uuid() comme valeur par defaut
-- pour toutes les colonnes "id" qui n'en ont pas.
-- À coller dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- Table: members
ALTER TABLE public.members ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Table: payments
ALTER TABLE public.payments ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Table: expenses
ALTER TABLE public.expenses ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Table: seasons
ALTER TABLE public.seasons ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Table: board_members
ALTER TABLE public.board_members ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Table: reminders
ALTER TABLE public.reminders ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Table: registrations
ALTER TABLE public.registrations ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Table: profiles
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Table: user_roles
ALTER TABLE public.user_roles ALTER COLUMN id SET DEFAULT gen_random_uuid();
