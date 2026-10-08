-- Script d'activation du Row Level Security (RLS) pour CJEP

-- 1. Activation du RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization ENABLE ROW LEVEL SECURITY;

-- 2. Création des politiques (Policies)
-- Note : Ces politiques autorisent tout utilisateur connecté (authentifié via Supabase Auth)
-- à lire, insérer, modifier et supprimer des données.
-- Si vous souhaitez restreindre certaines actions aux seuls Administrateurs, il faudra adapter les politiques.

-- Users
CREATE POLICY "Les utilisateurs authentifiés peuvent lire les utilisateurs" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Les utilisateurs authentifiés peuvent modifier les utilisateurs" ON users FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Les utilisateurs authentifiés peuvent ajouter des utilisateurs" ON users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Les utilisateurs authentifiés peuvent supprimer des utilisateurs" ON users FOR DELETE TO authenticated USING (true);

-- Contributors
CREATE POLICY "Lecture des contributeurs pour tous les authentifiés" ON contributors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Modification des contributeurs" ON contributors FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Pledges
CREATE POLICY "Accès complet aux engagements pour les authentifiés" ON pledges FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Students
CREATE POLICY "Accès complet aux étudiants pour les authentifiés" ON students FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Incomes
CREATE POLICY "Accès complet aux entrées pour les authentifiés" ON incomes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Expenses
CREATE POLICY "Accès complet aux dépenses pour les authentifiés" ON expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Organization
CREATE POLICY "Accès complet à l'organisation pour les authentifiés" ON organization FOR ALL TO authenticated USING (true) WITH CHECK (true);
