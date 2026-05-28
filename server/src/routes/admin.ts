import { Router, Response } from 'express';
import { query, queryOne } from '../db';
import { auth, adminOnly, AuthRequest } from '../middleware/auth';
import { notify, notifyAdmin } from '../notify';

const router = Router();
router.use(auth, adminOnly);

router.get('/dashboard', async (_req, res) => {
  try {
    const [revenue] = await query(`SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE payment_status = 'paid'`);
    const [orders] = await query(`SELECT COUNT(*) as count FROM orders`);
    const [customers] = await query(`SELECT COUNT(*) as count FROM users WHERE role = 'customer'`);
    const lowStock = await query(`SELECT p.name, pv.size, pv.color, pv.stock_qty FROM product_variants pv JOIN products p ON p.id = pv.product_id WHERE pv.stock_qty < 5`);
    const recentOrders = await query(`SELECT o.*, u.name as customer_name FROM orders o LEFT JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC LIMIT 10`);
    const chartData = await query(
      `SELECT DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders
       FROM orders WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at) ORDER BY date ASC`
    );
    res.json({ data: { revenue: revenue.total, orders: orders.count, customers: customers.count, lowStock, recentOrders, chartData } });
  } catch (err: any) { console.error('[Admin] dashboard', err.message); res.status(500).json({ error: err.message }); }
});

router.get('/users', async (_req, res) => {
  try {
    const users = await query(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.avatar_url, u.created_at,
        COUNT(o.id) as order_count, COALESCE(SUM(o.total), 0) as total_spent
       FROM users u LEFT JOIN orders o ON o.user_id = u.id
       GROUP BY u.id ORDER BY u.created_at DESC`
    );
    res.json({ data: users });
  } catch (err: any) { console.error('[Admin] users', err.message); res.status(500).json({ error: err.message }); }
});

router.get('/orders', async (req, res) => {
  try {
    const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const conditions: string[] = [];
    const params: any[] = [];
    let i = 1;
    if (status) { conditions.push(`o.status = $${i++}`); params.push(status); }
    if (search) { conditions.push(`(o.order_number ILIKE $${i} OR u.name ILIKE $${i} OR u.email ILIKE $${i})`); params.push(`%${search}%`); i++; }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    params.push(parseInt(limit), offset);
    const orders = await query(
      `SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
        jsonb_build_object(
          'id', a.id,
          'label', a.label,
          'street', a.street,
          'city', a.city,
          'county', a.county,
          'country', a.country,
          'postal_code', a.postal_code
        ) as shipping_address,
        COALESCE(json_agg(
          jsonb_build_object(
            'id', oi.id,
            'product_name', oi.product_name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'total_price', oi.total_price,
            'variant_info', oi.variant_info,
            'product_image', pi.url
          )
        ) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       LEFT JOIN addresses a ON a.id = o.shipping_address_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN product_images pi ON pi.product_id = oi.product_id AND pi.is_primary = true
       ${where} GROUP BY o.id, u.name, u.email, u.phone, a.id ORDER BY o.created_at DESC LIMIT $${i++} OFFSET $${i++}`,
      params
    );
    res.json({ data: orders });
  } catch (err: any) { console.error('[Admin] orders', err.message); res.status(500).json({ error: err.message }); }
});

router.put('/orders/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { status, payment_status } = req.body;
    const valid = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];
    if (status && !valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const order = await queryOne(
      `UPDATE orders SET status = COALESCE($1, status), payment_status = COALESCE($2, payment_status), updated_at = NOW() WHERE id = $3 RETURNING *`,
      [status || null, payment_status || null, req.params.id]
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    // Notify the customer about their order status change
    if (status && order.user_id) {
      const statusMessages: Record<string, string> = {
        confirmed: 'Your order has been confirmed and is being prepared.',
        processing: 'Your order is now being processed.',
        shipped: 'Great news! Your order has been shipped and is on its way.',
        delivered: 'Your order has been delivered. Enjoy!',
        cancelled: 'Your order has been cancelled.',
        refunded: 'Your order has been refunded.',
      };
      const msg = statusMessages[status];
      if (msg) await notify(order.user_id, 'order', `Order ${order.order_number} — ${status.charAt(0).toUpperCase() + status.slice(1)}`, msg, `/orders`);
    }
    res.json({ data: order });
  } catch (err: any) { console.error('[Admin] update order', err.message); res.status(500).json({ error: err.message }); }
});

// Categories
router.get('/categories', async (_req, res) => {
  try {
    const rows = await query(
      `SELECT c.*, COUNT(p.id)::int as product_count
       FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
       GROUP BY c.id ORDER BY c.sort_order ASC, c.name ASC`
    );
    res.json({ data: rows });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/categories', async (req, res) => {
  try {
    const { name, description, image_url } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    let slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const existing = await queryOne('SELECT id FROM categories WHERE slug = $1', [slug]);
    if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`;
    const cat = await queryOne(
      `INSERT INTO categories (name, slug, description, image_url) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name.trim(), slug, description || null, image_url || null]
    );
    res.json({ data: cat });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const { name, description, image_url } = req.body;
    const cat = await queryOne(
      `UPDATE categories SET name=COALESCE($1,name), description=COALESCE($2,description), image_url=COALESCE($3,image_url), slug=COALESCE($4,slug) WHERE id=$5 RETURNING *`,
      [name || null, description || null, image_url || null,
       name ? name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : null,
       req.params.id]
    );
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    res.json({ data: cat });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const inUse = await queryOne('SELECT id FROM products WHERE category_id = $1 AND is_active = true LIMIT 1', [req.params.id]);
    if (inUse) return res.status(400).json({ error: 'Category has active products. Reassign them first.' });
    await query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ data: { success: true } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Inventory
router.get('/inventory', async (_req, res) => {
  try {
    const rows = await query(
      `SELECT pv.id, pv.size, pv.color, pv.color_hex, pv.stock_qty, pv.sku_variant,
        p.id as product_id, p.name as product_name, p.slug, p.sku as product_sku,
        c.name as category_name,
        pi.url as image_url
       FROM product_variants pv
       JOIN products p ON p.id = pv.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
       WHERE p.is_active = true
       ORDER BY pv.stock_qty ASC, p.name ASC`
    );
    res.json({ data: rows });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.patch('/inventory/:variantId', async (req, res) => {
  try {
    const { stock_qty } = req.body;
    if (stock_qty === undefined || stock_qty < 0) return res.status(400).json({ error: 'Invalid stock quantity' });
    const variant = await queryOne(
      'UPDATE product_variants SET stock_qty = $1 WHERE id = $2 RETURNING *',
      [stock_qty, req.params.variantId]
    );
    if (!variant) return res.status(404).json({ error: 'Variant not found' });
    // Notify admin if stock was restocked (was 0, now > 0)
    if (stock_qty > 0) {
      const prod = await queryOne<any>(`SELECT p.name FROM products p JOIN product_variants pv ON pv.product_id = p.id WHERE pv.id = $1`, [req.params.variantId]);
      if (prod) await notifyAdmin('product', 'Stock Restocked', `${prod.name} (${variant.size}/${variant.color}) restocked to ${stock_qty} units.`, `/admin/inventory`);
    }
    res.json({ data: variant });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/products', async (_req, res) => {
  try {
    const products = await query(
      `SELECT p.*, c.name as category_name,
        COALESCE(SUM(pv.stock_qty), 0) as total_stock,
        COALESCE(json_agg(DISTINCT pi.*) FILTER (WHERE pi.id IS NOT NULL), '[]') as images
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN product_variants pv ON pv.product_id = p.id
       LEFT JOIN product_images pi ON pi.product_id = p.id
       GROUP BY p.id, c.name ORDER BY p.created_at DESC`
    );
    res.json({ data: products });
  } catch (err: any) { console.error('[Admin] products', err.message); res.status(500).json({ error: err.message }); }
});

router.post('/products', async (req, res) => {
  try {
    const { name, slug, description, short_description, price, compare_price, sku, category_id, is_featured, is_new, tags, variants = [], images = [] } = req.body;
    // Ensure slug is unique
    let finalSlug = slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = await queryOne('SELECT id FROM products WHERE slug = $1', [finalSlug]);
    if (existing) finalSlug = `${finalSlug}-${Math.random().toString(36).slice(2, 6)}`;
    const product = await queryOne<any>(
      `INSERT INTO products (name, slug, description, short_description, price, compare_price, sku, category_id, is_featured, is_new, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [name, finalSlug, description, short_description, price, compare_price || null, sku?.trim() || null, category_id, is_featured || false, is_new || false, tags || []]
    );
    for (const v of variants) {
      await query(`INSERT INTO product_variants (product_id, size, color, color_hex, stock_qty, sku_variant) VALUES ($1,$2,$3,$4,$5,$6)`,
        [product!.id, v.size, v.color, v.color_hex, v.stock_qty || 0, v.sku_variant]);
    }
    for (let idx = 0; idx < images.length; idx++) {
      await query(`INSERT INTO product_images (product_id, url, alt_text, sort_order, is_primary) VALUES ($1,$2,$3,$4,$5)`,
        [product!.id, images[idx].url, images[idx].alt_text || name, idx, idx === 0]);
    }
    // Notify all customers about new product
    const customers = await query(`SELECT id FROM users WHERE role = 'customer'`);
    for (const c of customers) {
      await notify(c.id, 'product', `New Arrival: ${name}`, `Check out our latest product — ${short_description || name}!`, `/products/${finalSlug}`);
    }
    res.json({ data: product });
  } catch (err: any) { console.error('[Admin] create product', err.message); res.status(500).json({ error: err.message }); }
});

router.put('/products/:id', async (req, res) => {
  try {
    const { name, slug, description, short_description, price, compare_price, sku, category_id, is_featured, is_new, is_active, tags, images } = req.body;
    const product = await queryOne(
      `UPDATE products SET name=COALESCE($1,name), slug=COALESCE($2,slug), description=COALESCE($3,description),
       short_description=COALESCE($4,short_description), price=COALESCE($5,price), compare_price=COALESCE($6,compare_price),
       sku=COALESCE(NULLIF($7,''),sku), category_id=COALESCE($8,category_id), is_featured=COALESCE($9,is_featured),
       is_new=COALESCE($10,is_new), is_active=COALESCE($11,is_active), tags=COALESCE($12,tags), updated_at=NOW()
       WHERE id = $13 RETURNING *`,
      [name, slug, description, short_description, price, compare_price || null, sku?.trim() || null, category_id, is_featured, is_new, is_active, tags, req.params.id]
    );
    if (!product) return res.status(404).json({ error: 'Not found' });
    // Replace images if provided
    if (Array.isArray(images)) {
      await query('DELETE FROM product_images WHERE product_id = $1', [req.params.id]);
      for (let idx = 0; idx < images.length; idx++) {
        const img = images[idx];
        const url = typeof img === 'string' ? img : img.url;
        const alt = typeof img === 'string' ? name : (img.alt_text || name);
        if (url) {
          await query(
            `INSERT INTO product_images (product_id, url, alt_text, sort_order, is_primary) VALUES ($1,$2,$3,$4,$5)`,
            [req.params.id, url, alt, idx, idx === 0]
          );
        }
      }
    }
    res.json({ data: product });
  } catch (err: any) { console.error('[Admin] update product', err.message); res.status(500).json({ error: err.message }); }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await queryOne('UPDATE products SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ data: { success: true } });
  } catch (err: any) { console.error('[Admin] delete product', err.message); res.status(500).json({ error: err.message }); }
});

router.get('/coupons', async (_req, res) => {
  try {
    const coupons = await query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json({ data: coupons });
  } catch (err: any) { console.error('[Admin] coupons', err.message); res.status(500).json({ error: err.message }); }
});

router.post('/coupons', async (req, res) => {
  try {
    const { code, type, value, min_order_amount, max_discount, usage_limit, expires_at } = req.body;
    const coupon = await queryOne(
      `INSERT INTO coupons (code, type, value, min_order_amount, max_discount, usage_limit, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [code.toUpperCase(), type, value, min_order_amount, max_discount, usage_limit, expires_at]
    );
    res.json({ data: coupon });
  } catch (err: any) { console.error('[Admin] create coupon', err.message); res.status(500).json({ error: err.message }); }
});

// Admin newsletter routes
router.get('/newsletter', async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM newsletters ORDER BY created_at DESC');
    res.json({ data: rows });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.patch('/newsletter/:id', async (req, res) => {
  try {
    const { is_active } = req.body;
    const row = await queryOne('UPDATE newsletters SET is_active = $1 WHERE id = $2 RETURNING *', [is_active, req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({ data: row });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/newsletter/:id', async (req, res) => {
  try {
    await query('DELETE FROM newsletters WHERE id = $1', [req.params.id]);
    res.json({ data: { success: true } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Admin management
router.get('/admins', async (_req, res) => {
  try {
    const admins = await query(`SELECT id, name, email, created_at FROM users WHERE role = 'admin' ORDER BY created_at ASC`);
    res.json({ data: admins });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/admins', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
    if (existing) return res.status(400).json({ error: 'Email already in use' });
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash(password, 10);
    const admin = await queryOne(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,'admin') RETURNING id, name, email, created_at`,
      [name, email, hash]
    );
    res.json({ data: admin });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put('/admins/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name && !email && !password) return res.status(400).json({ error: 'Nothing to update' });
    if (email) {
      const conflict = await queryOne('SELECT id FROM users WHERE email = $1 AND id != $2', [email, req.params.id]);
      if (conflict) return res.status(400).json({ error: 'Email already in use' });
    }
    if (password) {
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash(password, 10);
      const admin = await queryOne(
        `UPDATE users SET name=COALESCE($1,name), email=COALESCE($2,email), password_hash=$3 WHERE id=$4 AND role='admin' RETURNING id, name, email, created_at`,
        [name || null, email || null, hash, req.params.id]
      );
      if (!admin) return res.status(404).json({ error: 'Admin not found' });
      return res.json({ data: admin });
    }
    const admin = await queryOne(
      `UPDATE users SET name=COALESCE($1,name), email=COALESCE($2,email) WHERE id=$3 AND role='admin' RETURNING id, name, email, created_at`,
      [name || null, email || null, req.params.id]
    );
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.json({ data: admin });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Reviews
router.get('/reviews', async (_req, res) => {
  try {
    const reviews = await query(
      `SELECT r.id, r.rating, r.title, r.body, r.anonymous, r.is_approved, r.created_at,
        u.name as user_name, u.email as user_email, u.avatar_url,
        p.name as product_name, p.slug as product_slug,
        pi.url as product_image
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       JOIN products p ON p.id = r.product_id
       LEFT JOIN product_images pi ON pi.product_id = r.product_id AND pi.is_primary = true
       ORDER BY r.created_at DESC`
    );
    res.json({ data: reviews });
  } catch (err: any) { console.error('[Admin] reviews', err.message); res.status(500).json({ error: err.message }); }
});

router.patch('/reviews/:id', async (req, res) => {
  try {
    const { is_approved } = req.body;
    const review = await queryOne(
      'UPDATE reviews SET is_approved = $1 WHERE id = $2 RETURNING *',
      [is_approved, req.params.id]
    );
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json({ data: review });
  } catch (err: any) { console.error('[Admin] update review', err.message); res.status(500).json({ error: err.message }); }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    await query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    res.json({ data: { success: true } });
  } catch (err: any) { console.error('[Admin] delete review', err.message); res.status(500).json({ error: err.message }); }
});

export default router;
