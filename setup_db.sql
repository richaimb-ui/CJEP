-- Exécutez ce script dans l'éditeur SQL de Supabase pour corriger les erreurs d'enregistrement

-- 1. Ajouter les colonnes manquantes (email et téléphone) à la table 'contributors'
ALTER TABLE public.contributors 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone text;

-- 2. Créer la table 'pledges' pour les engagements mensuels
CREATE TABLE IF NOT EXISTS public.pledges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "contributorId" uuid REFERENCES public.contributors(id) ON DELETE CASCADE,
  "monthlyAmount" numeric NOT NULL,
  "startMonth" text NOT NULL,
  "createdAt" timestamp with time zone DEFAULT now()
);

-- Désactiver la Row Level Security (RLS) sur la table pledges (comme pour le reste du prototype)
ALTER TABLE public.pledges DISABLE ROW LEVEL SECURITY;

-- 3. Créer la table 'organization' pour stocker les paramètres globaux
CREATE TABLE IF NOT EXISTS public.organization (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT 'Comité des Jeunes',
  currency text NOT NULL DEFAULT 'FCFA',
  "dueDay" integer NOT NULL DEFAULT 5,
  "openingBalance" numeric NOT NULL DEFAULT 0
);

-- Désactiver RLS sur organization
ALTER TABLE public.organization DISABLE ROW LEVEL SECURITY;

-- Insérer une ligne par défaut si la table est vide
INSERT INTO public.organization (name, currency, "dueDay", "openingBalance")
SELECT 'Comité des Jeunes', 'FCFA', 5, 0
WHERE NOT EXISTS (SELECT 1 FROM public.organization);

-- 4. Créer la table 'users' pour les administrateurs
CREATE TABLE IF NOT EXISTS public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "firstName" text NOT NULL,
  "lastName" text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'Membre',
  "mustChangePassword" boolean DEFAULT true,
  "createdAt" timestamp with time zone DEFAULT now()
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone text;

-- Désactiver RLS sur users
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
