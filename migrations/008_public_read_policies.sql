-- Public storefront read access for catalog tables
-- This fixes the "0 products found" issue when the frontend uses the anonymous Supabase key.

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories
  FOR SELECT
  USING (true);

CREATE POLICY "Products are viewable by everyone"
  ON products
  FOR SELECT
  USING (true);

CREATE POLICY "Product images are viewable by everyone"
  ON product_images
  FOR SELECT
  USING (true);

CREATE POLICY "Product variants are viewable by everyone"
  ON product_variants
  FOR SELECT
  USING (true);

CREATE POLICY "Reviews are viewable by everyone"
  ON reviews
  FOR SELECT
  USING (true);

-- Admin-only write/update/delete policies (kept restrictive)
CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role' OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  ));

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role' OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  ));

CREATE POLICY "Admins can manage product images"
  ON product_images
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role' OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  ));

CREATE POLICY "Admins can manage product variants"
  ON product_variants
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role' OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  ));

CREATE POLICY "Admins can manage reviews"
  ON reviews
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role' OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid() AND u.role = 'admin'
  ));
