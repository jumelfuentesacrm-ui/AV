-- ============================================================
-- ARCHIVO VIVO — Extended Schema v2
-- ============================================================

-- Extend profiles role check to include employee
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'admin', 'employee'));

-- Add stripe_payment_intent to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent text;

-- Add order_index to films
ALTER TABLE films ADD COLUMN IF NOT EXISTS order_index int DEFAULT 0;

-- Add sku to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku text;

-- ============================================================
-- EMPLOYEE PERMISSIONS (must exist before page_sections policies)
-- ============================================================
CREATE TABLE IF NOT EXISTS employee_permissions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  can_edit_prices       boolean DEFAULT false,
  can_manage_orders     boolean DEFAULT false,
  can_manage_inventory  boolean DEFAULT false,
  can_view_analytics    boolean DEFAULT false,
  can_edit_site_content boolean DEFAULT false,
  can_process_refunds   boolean DEFAULT false,
  updated_at            timestamptz DEFAULT now()
);

ALTER TABLE employee_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_permissions" ON employee_permissions;
CREATE POLICY "admin_all_permissions" ON employee_permissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "employee_read_own_permissions" ON employee_permissions;
CREATE POLICY "employee_read_own_permissions" ON employee_permissions
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- PAGE SECTIONS (CMS)
-- ============================================================
CREATE TABLE IF NOT EXISTS page_sections (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key  text UNIQUE NOT NULL,
  label        text NOT NULL,
  content      jsonb DEFAULT '{}',
  order_index  int  DEFAULT 0,
  visible      boolean DEFAULT true,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_sections" ON page_sections;
CREATE POLICY "admin_all_sections" ON page_sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "employee_read_sections" ON page_sections;
CREATE POLICY "employee_read_sections" ON page_sections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','employee'))
  );

DROP POLICY IF EXISTS "employee_update_sections" ON page_sections;
CREATE POLICY "employee_update_sections" ON page_sections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN employee_permissions ep ON ep.user_id = p.id
      WHERE p.id = auth.uid() AND p.role = 'employee' AND ep.can_edit_site_content = true
    )
  );

DROP POLICY IF EXISTS "public_read_visible_sections" ON page_sections;
CREATE POLICY "public_read_visible_sections" ON page_sections
  FOR SELECT USING (visible = true);

-- ============================================================
-- CATALOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS catalogs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  slug          text UNIQUE NOT NULL,
  description   text,
  visible       boolean DEFAULT true,
  display_order int DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE catalogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_catalogs" ON catalogs;
CREATE POLICY "admin_all_catalogs" ON catalogs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "public_read_visible_catalogs" ON catalogs;
CREATE POLICY "public_read_visible_catalogs" ON catalogs
  FOR SELECT USING (visible = true);

-- ============================================================
-- CATALOG PRODUCTS (junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS catalog_products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id    uuid REFERENCES catalogs(id) ON DELETE CASCADE,
  product_id    uuid REFERENCES products(id) ON DELETE CASCADE,
  display_order int DEFAULT 0,
  UNIQUE (catalog_id, product_id)
);

ALTER TABLE catalog_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_catalog_products" ON catalog_products;
CREATE POLICY "admin_all_catalog_products" ON catalog_products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "public_read_catalog_products" ON catalog_products;
CREATE POLICY "public_read_catalog_products" ON catalog_products
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM catalogs WHERE id = catalog_id AND visible = true)
  );

-- ============================================================
-- SITE SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text UNIQUE NOT NULL,
  value      jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_settings" ON site_settings;
CREATE POLICY "admin_all_settings" ON site_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "public_read_settings" ON site_settings;
CREATE POLICY "public_read_settings" ON site_settings
  FOR SELECT USING (true);

-- ============================================================
-- DEFAULT PAGE SECTIONS
-- ============================================================
INSERT INTO page_sections (section_key, label, content, order_index, visible) VALUES
  ('hero', 'Hero', '{
    "headline": "Archivo Vivo",
    "tagline": "Ideas · Visión · Legado",
    "cta_text": "",
    "cta_href": "",
    "top_label": "Archivo Vivo · Est. MMXXVI · San Juan, PR"
  }'::jsonb, 0, true),
  ('manifiesto', 'Manifiesto', '{
    "chapter_label": "Prólogo · 00 / Manifiesto",
    "headline": "Donde el artista se vuelve memoria.",
    "lede": "Archivo Vivo no es un museo. Es un archivo que respira, hecho de cintas, telas y máquinas.",
    "body_1": "Documentamos en imagen a quienes han moldeado la cultura de la isla, vestimos a quien quiera llevar un retazo de esa memoria en el pecho, y colocamos el archivo en los lugares donde la gente realmente vive — el mall, el lobby, la terminal.",
    "body_2": "Tres capítulos. Una misma idea: lo que se archiva no muere — sigue vivo en el cuerpo de quien lo lleva.",
    "signature": "Archivo Vivo",
    "role": "El equipo · San Juan, PR"
  }'::jsonb, 1, true),
  ('episodios', 'El Archivo (Episodios)', '{
    "chapter_label": "Capítulo 01",
    "title": "El Archivo",
    "meta": "Episodios de 7 a 10 min",
    "description": "Retratos en imagen y voz. Cada estación, un artista grande de la isla cuenta su historia — la versión completa vive aquí, la versión corta vive en redes.",
    "featured_label": "Episodio en curso",
    "featured_title": "Lo que la palma nunca olvidó.",
    "featured_desc": "Un retrato íntimo del narrador que tatuó el español caribeño en la memoria de tres generaciones.",
    "cta_text": "Ver trailer · 38s"
  }'::jsonb, 2, true),
  ('indumentaria', 'Indumentaria', '{
    "chapter_label": "Capítulo 02",
    "title": "Indumentaria",
    "meta": "Vol. 01 · Cinco piezas",
    "description": "Camisas, T-shirts de vestir y piezas pensadas para reuniones, citas y la vida diaria de quien se viste con intención.",
    "feature_sig": "indumentaria",
    "feature_smalltext": "Tela AV · Vol. 01 · Edición limitada",
    "stmt_label": "La tela del archivo",
    "stmt_title": "Ropa que carga memoria.",
    "stmt_lede": "Cada pieza documenta. Cada costura es un argumento.",
    "stmt_body": "Diseñamos para quienes se visten con intención.",
    "cta_text": "Ver colección"
  }'::jsonb, 3, true),
  ('maquinas', 'Máquinas', '{
    "chapter_label": "Capítulo 03",
    "title": "Máquinas",
    "meta": "Red de cinco unidades",
    "description": "Una red de vending culturales en los puntos donde la isla circula — malls, lobbies, terminales.",
    "copy_label": "Mientras esperas el agua",
    "copy_title": "El archivo también vive en el mall.",
    "copy_body": "La pantalla integrada reproduce los episodios del archivo en bucle, junto al inventario habitual de una vending.",
    "cta_text": "Proponer una ubicación"
  }'::jsonb, 4, true),
  ('suscripcion', 'Suscripción', '{
    "label": "Boletín del archivo",
    "title": "Mantente cerca del archivo.",
    "body": "Un correo cada estación: el próximo episodio, drops nuevos de indumentaria, y dónde encontrar la siguiente máquina. Sin ruido — la frecuencia del archivo.",
    "button_text": "Suscribirme →"
  }'::jsonb, 5, true)
ON CONFLICT (section_key) DO NOTHING;

-- ============================================================
-- DEFAULT SITE SETTINGS
-- ============================================================
INSERT INTO site_settings (key, value) VALUES
  ('theme', '{
    "cream": "#f2e7df",
    "ink": "#343133",
    "black": "#1a1815",
    "taupe": "#c8bfb9",
    "gray": "#737373",
    "white": "#ffffff"
  }'::jsonb),
  ('nav_links', '[
    {"label": "El Archivo",    "href": "#episodios"},
    {"label": "Indumentaria",  "href": "#indumentaria"},
    {"label": "Máquinas",      "href": "#maquinas"},
    {"label": "Manifiesto",    "href": "#manifiesto"}
  ]'::jsonb),
  ('footer', '{
    "copyright": "© MMXXVI · Archivo Vivo · All rights reserved",
    "tagline": "Ideas. Visión. Legado.",
    "version": "v01 · San Juan, PR",
    "social": [
      {"platform": "Instagram", "href": "#"},
      {"platform": "TikTok",    "href": "#"},
      {"platform": "YouTube",   "href": "#"}
    ]
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- RLS POLICIES (existing tables — fill gaps)
-- ============================================================

-- Films: public can read released/upcoming
DROP POLICY IF EXISTS "public_read_films" ON films;
CREATE POLICY "public_read_films" ON films
  FOR SELECT USING (status IN ('released','upcoming'));

DROP POLICY IF EXISTS "admin_all_films" ON films;
CREATE POLICY "admin_all_films" ON films
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','employee'))
  );

-- Products: public read active
DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "admin_all_products" ON products;
CREATE POLICY "admin_all_products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','employee'))
  );

-- Product variants: public read
DROP POLICY IF EXISTS "public_read_variants" ON product_variants;
CREATE POLICY "public_read_variants" ON product_variants
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_all_variants" ON product_variants;
CREATE POLICY "admin_all_variants" ON product_variants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','employee'))
  );

-- Profiles: users read own, admins read all
DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "admin_all_profiles" ON profiles;
CREATE POLICY "admin_all_profiles" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Orders: users read own, admins read all
DROP POLICY IF EXISTS "users_read_own_orders" ON orders;
CREATE POLICY "users_read_own_orders" ON orders
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admin_all_orders" ON orders;
CREATE POLICY "admin_all_orders" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','employee'))
  );

-- Machine locations: public read active
DROP POLICY IF EXISTS "public_read_machines" ON machine_locations;
CREATE POLICY "public_read_machines" ON machine_locations
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "admin_all_machines" ON machine_locations;
CREATE POLICY "admin_all_machines" ON machine_locations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
