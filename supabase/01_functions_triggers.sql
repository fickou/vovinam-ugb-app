-- ============================================================
-- SCRIPT 1/3 — Fonctions & Triggers (ULTRA-ROBUSTE)
-- À coller dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Fonction : has_role
CREATE OR REPLACE FUNCTION public.has_role(_role text, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id::text
      AND role::text = _role
  );
$$;

-- 2. Fonction : is_staff
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id::text
      AND role::text IN ('super_admin', 'admin', 'treasurer', 'coach')
  );
$$;

-- 3. Fonction générique : updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Fonction : handle_new_user
-- Cette fonction est critique car elle s'exécute pendant le Signup (Auth)
-- Si elle échoue, le Signup renvoie une erreur 500.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_role text := 'member';
BEGIN
  -- 1. Insérer dans profiles avec gestion d'erreur
  BEGIN
    INSERT INTO public.profiles (id, user_id, first_name, last_name)
    VALUES (
      gen_random_uuid()::text,
      NEW.id::text,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    )
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- On ignore l'erreur pour ne pas bloquer le Signup
    RAISE WARNING 'Erreur lors de la création du profil pour %: %', NEW.id, SQLERRM;
  END;

  -- 2. Insérer dans user_roles avec gestion d'erreur
  BEGIN
    INSERT INTO public.user_roles (id, user_id, role)
    VALUES (gen_random_uuid()::text, NEW.id::text, default_role::public.app_role)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    BEGIN
      INSERT INTO public.user_roles (id, user_id, role)
      VALUES (gen_random_uuid()::text, NEW.id::text, default_role::text)
      ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Erreur lors de l''attribution du rôle pour %: %', NEW.id, SQLERRM;
    END;
  END;

  RETURN NEW;
END;
$$;

-- Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
