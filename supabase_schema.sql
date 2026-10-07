-- Créez ces tables dans l'éditeur SQL de votre tableau de bord Supabase

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  "mustChangePassword" BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL,
  "joinedAt" TEXT NOT NULL,
  avatar TEXT
);

CREATE TABLE IF NOT EXISTS pledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "contributorId" UUID REFERENCES contributors(id) ON DELETE CASCADE,
  "monthlyAmount" INTEGER NOT NULL,
  "startMonth" TEXT NOT NULL,
  "endMonth" TEXT
);

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  field TEXT NOT NULL,
  level TEXT NOT NULL,
  status TEXT NOT NULL,
  "scholarshipAmount" INTEGER NOT NULL,
  avatar TEXT
);

CREATE TABLE IF NOT EXISTS incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref TEXT NOT NULL,
  "sourceName" TEXT NOT NULL,
  "contributorId" UUID REFERENCES contributors(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  "receivedOn" TEXT NOT NULL,
  status TEXT NOT NULL,
  "createdBy" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref TEXT NOT NULL,
  category TEXT NOT NULL,
  "studentId" UUID REFERENCES students(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  "spentOn" TEXT NOT NULL,
  status TEXT NOT NULL,
  "createdBy" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS organization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  "openingBalance" INTEGER NOT NULL
);

-- Insérer une organisation par défaut pour éviter les erreurs
INSERT INTO organization (name, email, phone, address, "openingBalance")
VALUES ('CJEP', 'contact@cjep.org', '+228 90 00 00 00', 'Lomé, Togo', 500000)
ON CONFLICT DO NOTHING;
