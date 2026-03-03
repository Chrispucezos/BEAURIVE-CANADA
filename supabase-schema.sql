-- ============================================================
-- BEAURIVE SOLUTIONS - Schéma Supabase
-- À exécuter dans Supabase → SQL Editor
-- ============================================================

-- 1. Profils utilisateurs (admin + clients)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  company_name TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Soumissions de contact (formulaire général)
CREATE TABLE IF NOT EXISTS contact_submissions (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service_type TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'nouveau' CHECK (status IN ('nouveau', 'en-cours', 'traite', 'archive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Soumissions de soumission/calculateur
CREATE TABLE IF NOT EXISTS quote_submissions (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service_type TEXT NOT NULL,
  details TEXT,
  estimated_price DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'nouveau' CHECK (status IN ('nouveau', 'en-cours', 'accepte', 'refuse', 'archive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Projets clients
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'entretien',
  status TEXT NOT NULL DEFAULT 'non-commence' CHECK (status IN ('non-commence','en-cours','en-attente','complete','annule','planifie','confirme','en-pause','reporte')),
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tâches de projet
CREATE TABLE IF NOT EXISTS project_tasks (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'en-attente' CHECK (status IN ('en-attente','en-cours','complete')),
  assigned_to TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Contrats
CREATE TABLE IF NOT EXISTS contracts (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'brouillon' CHECK (status IN ('brouillon','envoye','signe-client','signe-admin','complet','annule')),
  client_signature TEXT,
  admin_signature TEXT,
  signed_at TIMESTAMPTZ,
  amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Factures
CREATE TABLE IF NOT EXISTS invoices (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'non-paye' CHECK (status IN ('non-paye','paye','en-retard','annule')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  description TEXT,
  items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Horaires / rendez-vous
CREATE TABLE IF NOT EXISTS schedules (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'planifie' CHECK (status IN ('planifie','confirme','annule','complete')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- user_profiles: chaque utilisateur voit son propre profil, admin voit tout
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can view all profiles" ON user_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- contact_submissions: tout le monde peut insérer, admin peut tout voir
CREATE POLICY "Anyone can submit contact" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can view contact submissions" ON contact_submissions FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- quote_submissions: tout le monde peut insérer, admin peut tout voir
CREATE POLICY "Anyone can submit quote" ON quote_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can view quote submissions" ON quote_submissions FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- projects: client voit ses projets, admin voit tout
CREATE POLICY "Client can view own projects" ON projects FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Admin can manage all projects" ON projects FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- project_tasks: via projet
CREATE POLICY "Client can view own tasks" ON project_tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_tasks.project_id AND client_id = auth.uid())
);
CREATE POLICY "Admin can manage all tasks" ON project_tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- contracts: client voit ses contrats, peut signer
CREATE POLICY "Client can view own contracts" ON contracts FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Client can sign contract" ON contracts FOR UPDATE USING (auth.uid() = client_id);
CREATE POLICY "Admin can manage all contracts" ON contracts FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- invoices: client voit ses factures
CREATE POLICY "Client can view own invoices" ON invoices FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Admin can manage all invoices" ON invoices FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- schedules: client voit ses rendez-vous
CREATE POLICY "Client can view own schedules" ON schedules FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Admin can manage all schedules" ON schedules FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- TRIGGER: créer profil automatiquement à l'inscription
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- COMPTE ADMIN PAR DÉFAUT
-- Note: Créez d'abord le compte via Supabase Auth, puis exécutez:
-- UPDATE user_profiles SET role = 'admin' WHERE email = 'info@beaurive.ca';
-- ============================================================
