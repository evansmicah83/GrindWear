-- Seed categories
INSERT INTO categories (id, name, slug, description, image_url, is_active, sort_order) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Hoodies', 'hoodies', 'Premium streetwear hoodies', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', true, 1),
  ('a1000000-0000-0000-0000-000000000002', 'T-Shirts', 'tshirts', 'Graphic and logo tees', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', true, 2),
  ('a1000000-0000-0000-0000-000000000003', 'Pants', 'pants', 'Cargo pants and joggers', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400', true, 3),
  ('a1000000-0000-0000-0000-000000000004', 'Jackets', 'jackets', 'Denim and bomber jackets', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', true, 4),
  ('a1000000-0000-0000-0000-000000000005', 'Accessories', 'accessories', 'Caps, bags and more', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', true, 5)
ON CONFLICT (slug) DO NOTHING;

-- Seed products
INSERT INTO products (id, name, slug, description, short_description, price, compare_price, sku, category_id, is_active, is_featured, is_new, tags) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Classic Black Hoodie', 'classic-black-hoodie', 'Premium quality cotton hoodie with modern streetwear design. Heavyweight 400gsm fabric with kangaroo pocket.', 'Premium heavyweight hoodie', 8500, 10500, 'GB-HOD-001', 'a1000000-0000-0000-0000-000000000001', true, true, false, ARRAY['streetwear','casual','trending']),
  ('b1000000-0000-0000-0000-000000000002', 'Urban Cargo Pants', 'urban-cargo-pants', 'Comfortable cargo pants with multiple pockets. Perfect for the streets.', 'Multi-pocket cargo pants', 9500, NULL, 'GB-PNT-001', 'a1000000-0000-0000-0000-000000000003', true, true, false, ARRAY['cargo','streetwear']),
  ('b1000000-0000-0000-0000-000000000003', 'Grind Byte Logo Tee', 'grind-byte-logo-tee', 'Signature GRIND BYTE t-shirt with embroidered logo. 100% combed cotton.', 'Signature logo tee', 4200, 5200, 'GB-TEE-001', 'a1000000-0000-0000-0000-000000000002', true, true, true, ARRAY['basics','logo','bestseller']),
  ('b1000000-0000-0000-0000-000000000004', 'Premium Denim Jacket', 'premium-denim-jacket', 'Classic denim jacket with modern fit. Washed and distressed finish.', 'Classic denim jacket', 13500, NULL, 'GB-JKT-001', 'a1000000-0000-0000-0000-000000000004', true, false, true, ARRAY['denim','classic']),
  ('b1000000-0000-0000-0000-000000000005', 'Essential Joggers', 'essential-joggers', 'Comfortable joggers for everyday wear. Tapered fit with elastic waistband.', 'Everyday tapered joggers', 6200, NULL, 'GB-PNT-002', 'a1000000-0000-0000-0000-000000000003', true, false, false, ARRAY['comfort','casual']),
  ('b1000000-0000-0000-0000-000000000006', 'Oversized Sweatshirt', 'oversized-sweatshirt', 'Trendy oversized fit sweatshirt. Dropped shoulders, ribbed cuffs.', 'Oversized drop-shoulder sweatshirt', 7300, NULL, 'GB-HOD-002', 'a1000000-0000-0000-0000-000000000001', true, true, true, ARRAY['oversized','trending'])
ON CONFLICT (slug) DO NOTHING;

-- Seed product images
INSERT INTO product_images (product_id, url, alt_text, sort_order, is_primary) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800', 'Classic Black Hoodie', 0, true),
  ('b1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=800', 'Classic Black Hoodie Back', 1, false),
  ('b1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800', 'Urban Cargo Pants', 0, true),
  ('b1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', 'Grind Byte Logo Tee', 0, true),
  ('b1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800', 'Grind Byte Logo Tee Back', 1, false),
  ('b1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', 'Premium Denim Jacket', 0, true),
  ('b1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1618517351616-38fb9c5210c6?w=800', 'Essential Joggers', 0, true),
  ('b1000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800', 'Oversized Sweatshirt', 0, true);

-- Seed product variants
INSERT INTO product_variants (product_id, size, color, color_hex, stock_qty, sku_variant) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'S', 'Black', '#000000', 20, 'GB-HOD-001-S-BLK'),
  ('b1000000-0000-0000-0000-000000000001', 'M', 'Black', '#000000', 25, 'GB-HOD-001-M-BLK'),
  ('b1000000-0000-0000-0000-000000000001', 'L', 'Black', '#000000', 15, 'GB-HOD-001-L-BLK'),
  ('b1000000-0000-0000-0000-000000000001', 'XL', 'Black', '#000000', 10, 'GB-HOD-001-XL-BLK'),
  ('b1000000-0000-0000-0000-000000000001', 'M', 'White', '#FFFFFF', 20, 'GB-HOD-001-M-WHT'),
  ('b1000000-0000-0000-0000-000000000001', 'L', 'White', '#FFFFFF', 15, 'GB-HOD-001-L-WHT'),
  ('b1000000-0000-0000-0000-000000000002', '30', 'Black', '#000000', 15, 'GB-PNT-001-30-BLK'),
  ('b1000000-0000-0000-0000-000000000002', '32', 'Black', '#000000', 20, 'GB-PNT-001-32-BLK'),
  ('b1000000-0000-0000-0000-000000000002', '34', 'Black', '#000000', 10, 'GB-PNT-001-34-BLK'),
  ('b1000000-0000-0000-0000-000000000002', '32', 'Khaki', '#C3B091', 15, 'GB-PNT-001-32-KHK'),
  ('b1000000-0000-0000-0000-000000000003', 'S', 'Black', '#000000', 30, 'GB-TEE-001-S-BLK'),
  ('b1000000-0000-0000-0000-000000000003', 'M', 'Black', '#000000', 40, 'GB-TEE-001-M-BLK'),
  ('b1000000-0000-0000-0000-000000000003', 'L', 'Black', '#000000', 30, 'GB-TEE-001-L-BLK'),
  ('b1000000-0000-0000-0000-000000000003', 'M', 'White', '#FFFFFF', 35, 'GB-TEE-001-M-WHT'),
  ('b1000000-0000-0000-0000-000000000004', 'S', 'Blue', '#1E3A5F', 8, 'GB-JKT-001-S-BLU'),
  ('b1000000-0000-0000-0000-000000000004', 'M', 'Blue', '#1E3A5F', 10, 'GB-JKT-001-M-BLU'),
  ('b1000000-0000-0000-0000-000000000004', 'L', 'Blue', '#1E3A5F', 7, 'GB-JKT-001-L-BLU'),
  ('b1000000-0000-0000-0000-000000000005', 'S', 'Black', '#000000', 25, 'GB-PNT-002-S-BLK'),
  ('b1000000-0000-0000-0000-000000000005', 'M', 'Black', '#000000', 30, 'GB-PNT-002-M-BLK'),
  ('b1000000-0000-0000-0000-000000000005', 'L', 'Gray', '#808080', 20, 'GB-PNT-002-L-GRY'),
  ('b1000000-0000-0000-0000-000000000006', 'M', 'Beige', '#F5F0E8', 15, 'GB-HOD-002-M-BEI'),
  ('b1000000-0000-0000-0000-000000000006', 'L', 'Beige', '#F5F0E8', 15, 'GB-HOD-002-L-BEI'),
  ('b1000000-0000-0000-0000-000000000006', 'M', 'Black', '#000000', 20, 'GB-HOD-002-M-BLK'),
  ('b1000000-0000-0000-0000-000000000006', 'L', 'Black', '#000000', 20, 'GB-HOD-002-L-BLK');

-- Seed default coupons
INSERT INTO coupons (code, type, value, min_order_amount, usage_limit, is_active) VALUES
  ('WELCOME10', 'percentage', 10, 0, 1000, true),
  ('SAVE500', 'fixed', 500, 5000, 500, true),
  ('GRIND20', 'percentage', 20, 3000, 200, true)
ON CONFLICT (code) DO NOTHING;

-- Seed admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role) VALUES
  ('Admin', 'admin@grindbyte.com', '$2b$12$8MQ0ClBfaXoeTlePG3JhS.5JEz7Mb8.DYUTIIEU9DqNeYq5wF8.Va', 'admin')
ON CONFLICT (email) DO NOTHING;
