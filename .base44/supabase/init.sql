-- Base44 sandbox bootstrap: initial schema for the local Supabase-compatible database.
-- Mirrors supabase_schema.sql + setup_db.sql from the repository (RLS intentionally left off,
-- as in the project's own setup scripts for this prototype).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- The supabase/postgres image creates these service roles but does not apply
-- POSTGRES_PASSWORD to them, so align them with the connection strings used by
-- GoTrue (supabase_auth_admin) and PostgREST (authenticator) in the compose file.
ALTER ROLE authenticator WITH LOGIN PASSWORD 'postgres';
ALTER ROLE supabase_auth_admin WITH LOGIN PASSWORD 'postgres';

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "firstName" text NOT NULL,
  "lastName" text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'Membre',
  "mustChangePassword" boolean DEFAULT true,
  "createdAt" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contributors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "firstName" text NOT NULL,
  "lastName" text NOT NULL,
  role text NOT NULL,
  status text NOT NULL,
  "joinedAt" text NOT NULL,
  email text,
  phone text,
  avatar text
);

CREATE TABLE IF NOT EXISTS public.pledges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "contributorId" uuid REFERENCES public.contributors(id) ON DELETE CASCADE,
  "monthlyAmount" numeric NOT NULL,
  "startMonth" text NOT NULL,
  "endMonth" text,
  "createdAt" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "firstName" text NOT NULL,
  "lastName" text NOT NULL,
  field text NOT NULL,
  level text NOT NULL,
  status text NOT NULL,
  "scholarshipAmount" numeric NOT NULL DEFAULT 0,
  avatar text
);

CREATE TABLE IF NOT EXISTS public.incomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref text NOT NULL,
  "sourceName" text NOT NULL,
  "contributorId" uuid REFERENCES public.contributors(id) ON DELETE SET NULL,
  type text NOT NULL,
  amount numeric NOT NULL,
  "receivedOn" text NOT NULL,
  status text NOT NULL,
  "createdBy" text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref text NOT NULL,
  category text NOT NULL,
  "studentId" uuid REFERENCES public.students(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  "spentOn" text NOT NULL,
  status text NOT NULL,
  "createdBy" text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.organization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'CJEP',
  email text NOT NULL DEFAULT 'contact@cjep.org',
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  "openingBalance" numeric NOT NULL DEFAULT 0
);

-- PostgREST talks to the database as `anon` (no session) or `authenticated` (signed-in user).
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

INSERT INTO public.organization (name, email, phone, address, "openingBalance")
SELECT 'CJEP', 'contact@cjep.org', '+228 90 00 00 00', 'Lomé, Togo', 500000
WHERE NOT EXISTS (SELECT 1 FROM public.organization);

-- PostgREST caches the schema; ask it to reload once the tables exist.
NOTIFY pgrst, 'reload schema';
