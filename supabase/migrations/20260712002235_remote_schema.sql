


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."app_role" AS ENUM (
    'super_admin',
    'admin',
    'treasurer',
    'coach',
    'member'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE TYPE "public"."member_status" AS ENUM (
    'active',
    'suspended',
    'former',
    'new'
);


ALTER TYPE "public"."member_status" OWNER TO "postgres";


CREATE TYPE "public"."payments_method" AS ENUM (
    'wave',
    'cash',
    'other',
    'transfer'
);


ALTER TYPE "public"."payments_method" OWNER TO "postgres";


CREATE TYPE "public"."payments_status" AS ENUM (
    'PENDING',
    'VALIDATED',
    'REJECTED'
);


ALTER TYPE "public"."payments_status" OWNER TO "postgres";


CREATE TYPE "public"."payments_type" AS ENUM (
    'registration',
    'monthly',
    'annual',
    'other'
);


ALTER TYPE "public"."payments_type" OWNER TO "postgres";


CREATE TYPE "public"."reminder_status" AS ENUM (
    'pending',
    'sent',
    'failed'
);


ALTER TYPE "public"."reminder_status" OWNER TO "postgres";


CREATE TYPE "public"."reminder_type" AS ENUM (
    'registration',
    'monthly',
    'welcome'
);


ALTER TYPE "public"."reminder_type" OWNER TO "postgres";


CREATE TYPE "public"."user_role_type" AS ENUM (
    'super_admin',
    'admin',
    'treasurer',
    'coach',
    'member'
);


ALTER TYPE "public"."user_role_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."approve_demande"("demande_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_demande record;
  v_new_profile_id uuid := gen_random_uuid();
  v_new_role_id uuid := gen_random_uuid();
  v_new_member_id uuid := gen_random_uuid();
BEGIN
  -- 1. Récupération de la demande avec verrouillage
  SELECT * INTO v_demande FROM public.demandes WHERE id = demande_id FOR UPDATE;
  
  -- Vérification de l'existence
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Demande introuvable.');
  END IF;

  -- Vérification du statut
  IF v_demande.status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Cette demande a déjà été traitée (Statut : ' || v_demande.status || ').');
  END IF;

  -- 2. Création/Mise à jour du Profil
  -- Note : On force le statut à 'active'
  INSERT INTO public.profiles (id, user_id, first_name, last_name, status)
  VALUES (v_new_profile_id::text, v_demande.user_id, v_demande.first_name, v_demande.last_name, 'active')
  ON CONFLICT (user_id) DO UPDATE 
  SET status = 'active', 
      first_name = EXCLUDED.first_name, 
      last_name = EXCLUDED.last_name,
      updated_at = now();

  -- 3. Attribution du rôle 'member'
  INSERT INTO public.user_roles (id, user_id, role)
  VALUES (v_new_role_id::text, v_demande.user_id, 'member'::public.app_role)
  ON CONFLICT (user_id) DO NOTHING;

  -- 4. Création de l'entrée dans la table Members
  INSERT INTO public.members (id, user_id, first_name, last_name, email, status)
  VALUES (v_new_member_id::text, v_demande.user_id, v_demande.first_name, v_demande.last_name, v_demande.email, 'active')
  ON CONFLICT (user_id) DO NOTHING;

  -- 5. Validation finale de la demande
  UPDATE public.demandes 
  SET status = 'validated',
      created_at = now() -- On peut réutiliser created_at ou laisser tel quel
  WHERE id = demande_id;

  -- Log de succès pour le Dashboard Supabase
  RAISE NOTICE 'Demande validée : Profil et Rôle créés pour %', v_demande.email;

  RETURN json_build_object(
    'success', true, 
    'message', 'L''utilisateur a été validé avec succès.',
    'user_id', v_demande.user_id
  );

EXCEPTION WHEN OTHERS THEN
  -- En cas d'erreur de la transaction, on renvoie le message d'erreur SQL
  RAISE WARNING 'Erreur lors de l''approbation : %', SQLERRM;
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;


ALTER FUNCTION "public"."approve_demande"("demande_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_member_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
BEGIN
    IF NEW.member_number IS NULL THEN
        year_part := TO_CHAR(CURRENT_DATE, 'YYYY');

        SELECT COALESCE(
            MAX(CAST(SUBSTRING(member_number FROM 5) AS INTEGER)),
            0
        ) + 1
        INTO sequence_num
        FROM members
        WHERE member_number LIKE year_part || '%';

        NEW.member_number :=
            year_part || LPAD(sequence_num::TEXT, 4, '0');
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_member_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_payments"("_season_id" "text" DEFAULT NULL::"text") RETURNS TABLE("id" "text", "amount" numeric, "payment_type" "text", "payment_method" "text", "payment_date" "date", "month_number" integer, "status" "text", "notes" "text", "created_at" timestamp with time zone)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
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


ALTER FUNCTION "public"."get_my_payments"("_season_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("_role" "text", "_user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id::text
      AND role::text = _role
  );
$$;


ALTER FUNCTION "public"."has_role"("_role" "text", "_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_staff"("_user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id::text
      AND role::text IN ('super_admin', 'admin', 'treasurer', 'coach')
  );
$$;


ALTER FUNCTION "public"."is_staff"("_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_site_settings_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_site_settings_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."board_members" (
    "id" character varying(36) DEFAULT "gen_random_uuid"() NOT NULL,
    "member_id" character varying(36) NOT NULL,
    "season_id" character varying(36) NOT NULL,
    "position" character varying(255) NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."board_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cotisation_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "list_id" "uuid" NOT NULL,
    "member_id" "text",
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "amount" numeric DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "created_by" "uuid"
);


ALTER TABLE "public"."cotisation_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cotisation_lists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "created_by" "uuid"
);


ALTER TABLE "public"."cotisation_lists" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."demandes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" character varying(36),
    "email" character varying(255) NOT NULL,
    "first_name" character varying(255) NOT NULL,
    "last_name" character varying(255) NOT NULL,
    "status" character varying(50) DEFAULT 'pending'::character varying,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "password_temp" "text",
    "telephone" character varying(20)
);


ALTER TABLE "public"."demandes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" character varying(36) DEFAULT "gen_random_uuid"() NOT NULL,
    "season_id" character varying(36) NOT NULL,
    "amount" integer NOT NULL,
    "description" "text" NOT NULL,
    "category" character varying(100) NOT NULL,
    "expense_date" "date" NOT NULL,
    "recorded_by" character varying(36) DEFAULT NULL::character varying,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."expenses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."members" (
    "id" character varying(36) DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" character varying(36) DEFAULT NULL::character varying,
    "first_name" character varying(255) NOT NULL,
    "last_name" character varying(255) NOT NULL,
    "phone" character varying(20) DEFAULT NULL::character varying,
    "email" character varying(255) DEFAULT NULL::character varying,
    "photo_url" "text",
    "status" "public"."member_status" DEFAULT 'active'::"public"."member_status" NOT NULL,
    "member_number" character varying(20) DEFAULT NULL::character varying,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "guardian_name" "text",
    "guardian_phone" "text"
);


ALTER TABLE "public"."members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_campaigns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "product_type" "text" NOT NULL,
    "description" "text",
    "price" numeric(10,2) DEFAULT 0 NOT NULL,
    "available_sizes" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "deadline" "date",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "image_url" "text",
    "margin" numeric DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."order_campaigns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "size" "text" NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "notes" "text",
    "is_paid" boolean DEFAULT false NOT NULL,
    "paid_at" timestamp with time zone,
    "validated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "orders_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" character varying(36) DEFAULT "gen_random_uuid"() NOT NULL,
    "member_id" character varying(36) NOT NULL,
    "season_id" character varying(36) NOT NULL,
    "amount" integer NOT NULL,
    "payment_type" "public"."payments_type" NOT NULL,
    "payment_method" "public"."payments_method" NOT NULL,
    "payment_date" "date" NOT NULL,
    "month_number" integer,
    "proof_url" "text",
    "status" "public"."payments_status" DEFAULT 'VALIDATED'::"public"."payments_status",
    "notes" "text",
    "recorded_by" character varying(36) DEFAULT NULL::character varying,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "payments_amount_max" CHECK (("amount" <= 500000)),
    CONSTRAINT "payments_amount_positive" CHECK (("amount" > 0)),
    CONSTRAINT "payments_month_valid" CHECK ((("month_number" IS NULL) OR (("month_number" >= 1) AND ("month_number" <= 12))))
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" character varying(36) DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" character varying(36) NOT NULL,
    "first_name" character varying(255) NOT NULL,
    "last_name" character varying(255) NOT NULL,
    "phone" character varying(20) DEFAULT NULL::character varying,
    "photo_url" "text",
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "date_of_birth" "date"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."public_gallery" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "image_url" "text" NOT NULL,
    "label" character varying NOT NULL,
    "category" character varying NOT NULL,
    "order_index" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "created_by" "uuid"
);


ALTER TABLE "public"."public_gallery" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."registrations" (
    "id" character varying(36) DEFAULT "gen_random_uuid"() NOT NULL,
    "member_id" character varying(36) NOT NULL,
    "season_id" character varying(36) NOT NULL,
    "registration_date" "date" NOT NULL,
    "registration_fee_paid" boolean DEFAULT false NOT NULL,
    "is_validated" boolean DEFAULT false NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."registrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reminders" (
    "id" character varying(36) DEFAULT "gen_random_uuid"() NOT NULL,
    "member_id" character varying(36) NOT NULL,
    "season_id" character varying(36) NOT NULL,
    "type" "public"."reminder_type" NOT NULL,
    "month_number" integer,
    "status" "public"."reminder_status" DEFAULT 'pending'::"public"."reminder_status" NOT NULL,
    "sent_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."reminders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."seasons" (
    "id" character varying(36) DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "registration_fee" integer DEFAULT 2000 NOT NULL,
    "monthly_fee" integer DEFAULT 1000 NOT NULL,
    "annual_total" integer DEFAULT 10000 NOT NULL,
    "is_active" boolean DEFAULT false NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."seasons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_settings" (
    "section_key" character varying NOT NULL,
    "content" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_by" "uuid"
);


ALTER TABLE "public"."site_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" character varying(36) DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" character varying(36) NOT NULL,
    "role" "public"."user_role_type" DEFAULT 'member'::"public"."user_role_type" NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" character varying(36) NOT NULL,
    "email" character varying(255) NOT NULL,
    "password" character varying(255) NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."board_members"
    ADD CONSTRAINT "board_members_member_season_unique" UNIQUE ("member_id", "season_id");



ALTER TABLE ONLY "public"."board_members"
    ADD CONSTRAINT "board_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cotisation_entries"
    ADD CONSTRAINT "cotisation_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cotisation_lists"
    ADD CONSTRAINT "cotisation_lists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."demandes"
    ADD CONSTRAINT "demandes_email_unique" UNIQUE ("email");



ALTER TABLE ONLY "public"."demandes"
    ADD CONSTRAINT "demandes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_member_number_unique" UNIQUE ("member_number");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_campaigns"
    ADD CONSTRAINT "order_campaigns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_unique" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."public_gallery"
    ADD CONSTRAINT "public_gallery_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."registrations"
    ADD CONSTRAINT "registrations_member_season_unique" UNIQUE ("member_id", "season_id");



ALTER TABLE ONLY "public"."registrations"
    ADD CONSTRAINT "registrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reminders"
    ADD CONSTRAINT "reminders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."seasons"
    ADD CONSTRAINT "seasons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_pkey" PRIMARY KEY ("section_key");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "unique_members_user_id" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "unique_profiles_user_id" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "unique_user_id" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_role_unique" UNIQUE ("user_id", "role");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_unique" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "board_members_season_id_idx" ON "public"."board_members" USING "btree" ("season_id");



CREATE INDEX "expenses_recorded_by_idx" ON "public"."expenses" USING "btree" ("recorded_by");



CREATE INDEX "expenses_season_id_idx" ON "public"."expenses" USING "btree" ("season_id");



CREATE INDEX "idx_demandes_email" ON "public"."demandes" USING "btree" ("email");



CREATE INDEX "idx_demandes_status" ON "public"."demandes" USING "btree" ("status");



CREATE INDEX "idx_demandes_user_id" ON "public"."demandes" USING "btree" ("user_id");



CREATE INDEX "idx_expenses_season" ON "public"."expenses" USING "btree" ("season_id");



CREATE INDEX "idx_members_guardian_phone" ON "public"."members" USING "btree" ("guardian_phone") WHERE ("guardian_phone" IS NOT NULL);



CREATE INDEX "idx_members_name" ON "public"."members" USING "btree" ("last_name", "first_name");



CREATE INDEX "idx_members_status" ON "public"."members" USING "btree" ("status");



CREATE INDEX "idx_order_campaigns_is_active" ON "public"."order_campaigns" USING "btree" ("is_active");



CREATE INDEX "idx_orders_campaign_id" ON "public"."orders" USING "btree" ("campaign_id");



CREATE INDEX "idx_orders_is_paid" ON "public"."orders" USING "btree" ("is_paid");



CREATE INDEX "idx_payments_created_at" ON "public"."payments" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_payments_member_season" ON "public"."payments" USING "btree" ("member_id", "season_id");



CREATE INDEX "idx_payments_month" ON "public"."payments" USING "btree" ("month_number") WHERE ("month_number" IS NOT NULL);



CREATE UNIQUE INDEX "idx_payments_no_duplicate" ON "public"."payments" USING "btree" ("member_id", "season_id", "month_number", "payment_type") WHERE (("month_number" IS NOT NULL) AND ("payment_type" = 'monthly'::"public"."payments_type"));



CREATE INDEX "idx_payments_season" ON "public"."payments" USING "btree" ("season_id");



CREATE INDEX "idx_payments_status" ON "public"."payments" USING "btree" ("status");



CREATE INDEX "idx_profiles_user_id" ON "public"."profiles" USING "btree" ("user_id");



CREATE INDEX "members_user_id_idx" ON "public"."members" USING "btree" ("user_id");



CREATE INDEX "payments_member_id_idx" ON "public"."payments" USING "btree" ("member_id");



CREATE INDEX "payments_recorded_by_idx" ON "public"."payments" USING "btree" ("recorded_by");



CREATE INDEX "payments_season_id_idx" ON "public"."payments" USING "btree" ("season_id");



CREATE INDEX "registrations_season_id_idx" ON "public"."registrations" USING "btree" ("season_id");



CREATE INDEX "reminders_member_id_idx" ON "public"."reminders" USING "btree" ("member_id");



CREATE INDEX "reminders_season_id_idx" ON "public"."reminders" USING "btree" ("season_id");



CREATE OR REPLACE TRIGGER "before_insert_members" BEFORE INSERT ON "public"."members" FOR EACH ROW EXECUTE FUNCTION "public"."generate_member_number"();



CREATE OR REPLACE TRIGGER "trg_members_updated_at" BEFORE UPDATE ON "public"."members" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_seasons_updated_at" BEFORE UPDATE ON "public"."seasons" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_site_settings_updated_at" BEFORE UPDATE ON "public"."site_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_site_settings_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_expenses_updated_at" BEFORE UPDATE ON "public"."expenses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."cotisation_entries"
    ADD CONSTRAINT "cotisation_entries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cotisation_entries"
    ADD CONSTRAINT "cotisation_entries_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "public"."cotisation_lists"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cotisation_entries"
    ADD CONSTRAINT "cotisation_entries_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cotisation_lists"
    ADD CONSTRAINT "cotisation_lists_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."board_members"
    ADD CONSTRAINT "fk_board_members_member" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "public"."board_members"
    ADD CONSTRAINT "fk_board_members_season" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "fk_expenses_season" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "fk_payments_member" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "fk_payments_season" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id");



ALTER TABLE ONLY "public"."reminders"
    ADD CONSTRAINT "fk_reminders_member" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "public"."reminders"
    ADD CONSTRAINT "fk_reminders_season" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "fk_user_roles_profile" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."order_campaigns"
    ADD CONSTRAINT "order_campaigns_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."order_campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."public_gallery"
    ADD CONSTRAINT "public_gallery_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."site_settings"
    ADD CONSTRAINT "site_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



CREATE POLICY "Admins gèrent la galerie" ON "public"."public_gallery" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE ((("user_roles"."user_id")::"text" = (("auth"."uid"())::character varying)::"text") AND ("user_roles"."role" = ANY (ARRAY['admin'::"public"."user_role_type", 'super_admin'::"public"."user_role_type"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE ((("user_roles"."user_id")::"text" = (("auth"."uid"())::character varying)::"text") AND ("user_roles"."role" = ANY (ARRAY['admin'::"public"."user_role_type", 'super_admin'::"public"."user_role_type"]))))));



CREATE POLICY "Enable all access for authenticated users" ON "public"."cotisation_entries" TO "authenticated" USING (true);



CREATE POLICY "Enable all access for authenticated users" ON "public"."cotisation_lists" TO "authenticated" USING (true);



CREATE POLICY "Galerie lisible publiquement" ON "public"."public_gallery" FOR SELECT USING (true);



CREATE POLICY "Le contenu du site est accessible publiquement" ON "public"."site_settings" FOR SELECT USING (true);



CREATE POLICY "Les admins et bureau gèrent le contenu du site" ON "public"."site_settings" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE ((("user_roles"."user_id")::"text" = (("auth"."uid"())::character varying)::"text") AND ("user_roles"."role" = ANY (ARRAY['admin'::"public"."user_role_type", 'super_admin'::"public"."user_role_type"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE ((("user_roles"."user_id")::"text" = (("auth"."uid"())::character varying)::"text") AND ("user_roles"."role" = ANY (ARRAY['admin'::"public"."user_role_type", 'super_admin'::"public"."user_role_type"]))))));



CREATE POLICY "Les admins gèrent les membres" ON "public"."members" USING ("public"."is_staff"("auth"."uid"())) WITH CHECK ("public"."is_staff"("auth"."uid"()));



CREATE POLICY "Les utilisateurs peuvent lire tous les profils" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil" ON "public"."profiles" FOR UPDATE USING ((("auth"."uid"())::"text" = ("user_id")::"text"));



ALTER TABLE "public"."board_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "board_members_delete" ON "public"."board_members" FOR DELETE TO "authenticated" USING (("public"."has_role"('admin'::"text", "auth"."uid"()) OR "public"."has_role"('super_admin'::"text", "auth"."uid"())));



CREATE POLICY "board_members_insert" ON "public"."board_members" FOR INSERT TO "authenticated" WITH CHECK (("public"."has_role"('admin'::"text", "auth"."uid"()) OR "public"."has_role"('super_admin'::"text", "auth"."uid"())));



CREATE POLICY "board_members_select" ON "public"."board_members" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "board_members_update" ON "public"."board_members" FOR UPDATE TO "authenticated" USING (("public"."has_role"('admin'::"text", "auth"."uid"()) OR "public"."has_role"('super_admin'::"text", "auth"."uid"())));



CREATE POLICY "campaigns_public_read" ON "public"."order_campaigns" FOR SELECT USING (("is_active" = true));



CREATE POLICY "campaigns_staff_delete" ON "public"."order_campaigns" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE ((("user_roles"."user_id")::"text" = ("auth"."uid"())::"text") AND ("user_roles"."role" = ANY (ARRAY['super_admin'::"public"."user_role_type", 'admin'::"public"."user_role_type", 'treasurer'::"public"."user_role_type", 'coach'::"public"."user_role_type"]))))));



CREATE POLICY "campaigns_staff_insert" ON "public"."order_campaigns" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE ((("user_roles"."user_id")::"text" = ("auth"."uid"())::"text") AND ("user_roles"."role" = ANY (ARRAY['super_admin'::"public"."user_role_type", 'admin'::"public"."user_role_type", 'treasurer'::"public"."user_role_type", 'coach'::"public"."user_role_type"]))))));



CREATE POLICY "campaigns_staff_read_all" ON "public"."order_campaigns" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE ((("user_roles"."user_id")::"text" = ("auth"."uid"())::"text") AND ("user_roles"."role" = ANY (ARRAY['super_admin'::"public"."user_role_type", 'admin'::"public"."user_role_type", 'treasurer'::"public"."user_role_type", 'coach'::"public"."user_role_type"]))))));



CREATE POLICY "campaigns_staff_update" ON "public"."order_campaigns" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE ((("user_roles"."user_id")::"text" = ("auth"."uid"())::"text") AND ("user_roles"."role" = ANY (ARRAY['super_admin'::"public"."user_role_type", 'admin'::"public"."user_role_type", 'treasurer'::"public"."user_role_type", 'coach'::"public"."user_role_type"]))))));



ALTER TABLE "public"."cotisation_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cotisation_lists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."demandes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "demandes_insert" ON "public"."demandes" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "demandes_insert_public" ON "public"."demandes" FOR INSERT WITH CHECK (true);



CREATE POLICY "demandes_select" ON "public"."demandes" FOR SELECT TO "authenticated" USING ("public"."is_staff"("auth"."uid"()));



CREATE POLICY "demandes_update" ON "public"."demandes" FOR UPDATE TO "authenticated" USING ("public"."is_staff"("auth"."uid"()));



ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "expenses_delete" ON "public"."expenses" FOR DELETE TO "authenticated" USING ("public"."is_staff"("auth"."uid"()));



CREATE POLICY "expenses_insert" ON "public"."expenses" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_staff"("auth"."uid"()));



CREATE POLICY "expenses_select" ON "public"."expenses" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "expenses_update" ON "public"."expenses" FOR UPDATE TO "authenticated" USING ("public"."is_staff"("auth"."uid"()));



ALTER TABLE "public"."members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "members_delete" ON "public"."members" FOR DELETE TO "authenticated" USING ("public"."is_staff"("auth"."uid"()));



CREATE POLICY "members_insert" ON "public"."members" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_staff"("auth"."uid"()));



CREATE POLICY "members_select" ON "public"."members" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "members_update" ON "public"."members" FOR UPDATE TO "authenticated" USING ("public"."is_staff"("auth"."uid"()));



ALTER TABLE "public"."order_campaigns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "orders_admin_delete" ON "public"."orders" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE ((("user_roles"."user_id")::"text" = ("auth"."uid"())::"text") AND ("user_roles"."role" = ANY (ARRAY['super_admin'::"public"."user_role_type", 'admin'::"public"."user_role_type"]))))));



CREATE POLICY "orders_public_insert" ON "public"."orders" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."order_campaigns"
  WHERE (("order_campaigns"."id" = "orders"."campaign_id") AND ("order_campaigns"."is_active" = true)))));



CREATE POLICY "orders_staff_read" ON "public"."orders" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE ((("user_roles"."user_id")::"text" = ("auth"."uid"())::"text") AND ("user_roles"."role" = ANY (ARRAY['super_admin'::"public"."user_role_type", 'admin'::"public"."user_role_type", 'treasurer'::"public"."user_role_type", 'coach'::"public"."user_role_type"]))))));



CREATE POLICY "orders_staff_update" ON "public"."orders" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE ((("user_roles"."user_id")::"text" = ("auth"."uid"())::"text") AND ("user_roles"."role" = ANY (ARRAY['super_admin'::"public"."user_role_type", 'admin'::"public"."user_role_type", 'treasurer'::"public"."user_role_type", 'coach'::"public"."user_role_type"]))))));



ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "payments_delete" ON "public"."payments" FOR DELETE TO "authenticated" USING ("public"."is_staff"("auth"."uid"()));



CREATE POLICY "payments_insert" ON "public"."payments" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_staff"("auth"."uid"()));



CREATE POLICY "payments_select" ON "public"."payments" FOR SELECT TO "authenticated" USING (("public"."is_staff"("auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM ("public"."members" "m"
     JOIN "public"."profiles" "pr" ON (((("pr"."user_id")::"text" = ("auth"."uid"())::"text") AND ("lower"(("pr"."first_name")::"text") = "lower"(("m"."first_name")::"text")) AND ("lower"(("pr"."last_name")::"text") = "lower"(("m"."last_name")::"text")))))
  WHERE (("m"."id")::"text" = ("payments"."member_id")::"text")))));



CREATE POLICY "payments_update" ON "public"."payments" FOR UPDATE TO "authenticated" USING ("public"."is_staff"("auth"."uid"()));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_insert" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (((("user_id")::"text" = ("auth"."uid"())::"text") OR "public"."is_staff"("auth"."uid"())));



CREATE POLICY "profiles_select" ON "public"."profiles" FOR SELECT TO "authenticated" USING (((("user_id")::"text" = ("auth"."uid"())::"text") OR "public"."is_staff"("auth"."uid"())));



CREATE POLICY "profiles_update" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (((("user_id")::"text" = ("auth"."uid"())::"text") OR "public"."is_staff"("auth"."uid"())));



ALTER TABLE "public"."public_gallery" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."registrations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "registrations_insert" ON "public"."registrations" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_staff"("auth"."uid"()));



CREATE POLICY "registrations_select" ON "public"."registrations" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "registrations_update" ON "public"."registrations" FOR UPDATE TO "authenticated" USING ("public"."is_staff"("auth"."uid"()));



ALTER TABLE "public"."reminders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "reminders_delete" ON "public"."reminders" FOR DELETE TO "authenticated" USING ("public"."is_staff"("auth"."uid"()));



CREATE POLICY "reminders_insert" ON "public"."reminders" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_staff"("auth"."uid"()));



CREATE POLICY "reminders_select" ON "public"."reminders" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."seasons" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "seasons_delete" ON "public"."seasons" FOR DELETE TO "authenticated" USING (("public"."has_role"('admin'::"text", "auth"."uid"()) OR "public"."has_role"('super_admin'::"text", "auth"."uid"())));



CREATE POLICY "seasons_insert" ON "public"."seasons" FOR INSERT TO "authenticated" WITH CHECK (("public"."has_role"('admin'::"text", "auth"."uid"()) OR "public"."has_role"('super_admin'::"text", "auth"."uid"())));



CREATE POLICY "seasons_select" ON "public"."seasons" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "seasons_update" ON "public"."seasons" FOR UPDATE TO "authenticated" USING (("public"."has_role"('admin'::"text", "auth"."uid"()) OR "public"."has_role"('super_admin'::"text", "auth"."uid"())));



ALTER TABLE "public"."site_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_roles_delete" ON "public"."user_roles" FOR DELETE TO "authenticated" USING ("public"."has_role"('super_admin'::"text", "auth"."uid"()));



CREATE POLICY "user_roles_insert" ON "public"."user_roles" FOR INSERT TO "authenticated" WITH CHECK (("public"."has_role"('super_admin'::"text", "auth"."uid"()) OR "public"."has_role"('admin'::"text", "auth"."uid"())));



CREATE POLICY "user_roles_select" ON "public"."user_roles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "user_roles_update" ON "public"."user_roles" FOR UPDATE TO "authenticated" USING (("public"."has_role"('super_admin'::"text", "auth"."uid"()) OR "public"."has_role"('admin'::"text", "auth"."uid"())));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."approve_demande"("demande_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."approve_demande"("demande_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_demande"("demande_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_member_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_member_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_member_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_payments"("_season_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_payments"("_season_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_payments"("_season_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("_role" "text", "_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("_role" "text", "_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_staff"("_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_staff"("_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_site_settings_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_site_settings_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_site_settings_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."board_members" TO "anon";
GRANT ALL ON TABLE "public"."board_members" TO "authenticated";
GRANT ALL ON TABLE "public"."board_members" TO "service_role";



GRANT ALL ON TABLE "public"."cotisation_entries" TO "anon";
GRANT ALL ON TABLE "public"."cotisation_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."cotisation_entries" TO "service_role";



GRANT ALL ON TABLE "public"."cotisation_lists" TO "anon";
GRANT ALL ON TABLE "public"."cotisation_lists" TO "authenticated";
GRANT ALL ON TABLE "public"."cotisation_lists" TO "service_role";



GRANT ALL ON TABLE "public"."demandes" TO "anon";
GRANT ALL ON TABLE "public"."demandes" TO "authenticated";
GRANT ALL ON TABLE "public"."demandes" TO "service_role";



GRANT ALL ON TABLE "public"."expenses" TO "anon";
GRANT ALL ON TABLE "public"."expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."expenses" TO "service_role";



GRANT ALL ON TABLE "public"."members" TO "anon";
GRANT ALL ON TABLE "public"."members" TO "authenticated";
GRANT ALL ON TABLE "public"."members" TO "service_role";



GRANT ALL ON TABLE "public"."order_campaigns" TO "anon";
GRANT ALL ON TABLE "public"."order_campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."order_campaigns" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."public_gallery" TO "anon";
GRANT ALL ON TABLE "public"."public_gallery" TO "authenticated";
GRANT ALL ON TABLE "public"."public_gallery" TO "service_role";



GRANT ALL ON TABLE "public"."registrations" TO "anon";
GRANT ALL ON TABLE "public"."registrations" TO "authenticated";
GRANT ALL ON TABLE "public"."registrations" TO "service_role";



GRANT ALL ON TABLE "public"."reminders" TO "anon";
GRANT ALL ON TABLE "public"."reminders" TO "authenticated";
GRANT ALL ON TABLE "public"."reminders" TO "service_role";



GRANT ALL ON TABLE "public"."seasons" TO "anon";
GRANT ALL ON TABLE "public"."seasons" TO "authenticated";
GRANT ALL ON TABLE "public"."seasons" TO "service_role";



GRANT ALL ON TABLE "public"."site_settings" TO "anon";
GRANT ALL ON TABLE "public"."site_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."site_settings" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


  create policy "Admins can delete public-assets"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'public-assets'::text) AND (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE (((user_roles.user_id)::text = ((auth.uid())::character varying)::text) AND (user_roles.role = ANY (ARRAY['admin'::public.user_role_type, 'super_admin'::public.user_role_type])))))));



  create policy "Admins can update public-assets"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'public-assets'::text) AND (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE (((user_roles.user_id)::text = ((auth.uid())::character varying)::text) AND (user_roles.role = ANY (ARRAY['admin'::public.user_role_type, 'super_admin'::public.user_role_type])))))));



  create policy "Admins can upload to public-assets"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'public-assets'::text) AND (EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE (((user_roles.user_id)::text = ((auth.uid())::character varying)::text) AND (user_roles.role = ANY (ARRAY['admin'::public.user_role_type, 'super_admin'::public.user_role_type])))))));



  create policy "Images accessibles a tous"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));



  create policy "Public Access to public-assets"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'public-assets'::text));



  create policy "avatars_delete"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "avatars_insert"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "avatars_public_select"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));



  create policy "avatars_update"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "campaign_images_delete"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'campaign-images'::text) AND public.is_staff(auth.uid())));



  create policy "campaign_images_insert"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'campaign-images'::text) AND public.is_staff(auth.uid())));



  create policy "campaign_images_select"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'campaign-images'::text));



  create policy "proofs_delete"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'proofs'::text) AND (public.has_role('admin'::text, auth.uid()) OR public.has_role('super_admin'::text, auth.uid()))));



  create policy "proofs_insert"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'proofs'::text));



  create policy "proofs_public_select"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'proofs'::text));



  create policy "proofs_select"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'proofs'::text) AND public.is_staff(auth.uid())));



