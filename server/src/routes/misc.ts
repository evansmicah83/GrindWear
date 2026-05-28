import { Router, Response } from 'express';
import { query, queryOne } from '../db';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

// Check if current user reviewed a product
router.get('/reviews/:productId/mine', auth, async (req: AuthRequest, res: Response) => {
  try {
    const review = await queryOne(
      'SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2',
      [req.params.productId, req.user!.id]
    );
    res.json({ reviewed: !!review });
  } catch (err: any) {
    res.json({ reviewed: false });
  }
});

router.get('/reviews/:productId', async (req, res) => {
  try {
    const reviews = await query(
      `SELECT r.id, r.rating, r.title, r.body, r.anonymous, r.created_at,
        CASE WHEN r.anonymous THEN 'Anonymous' ELSE u.name END as user_name,
        CASE WHEN r.anonymous THEN NULL ELSE u.avatar_url END as avatar_url
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.product_id = $1 AND r.is_approved = true
       ORDER BY r.created_at DESC`,
      [req.params.productId]
    );
    res.json({ data: reviews });
  } catch (err: any) {
    console.error('[Reviews]', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/reviews', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { product_id, order_id, rating, title, body, anonymous } = req.body;
    if (!product_id || !rating) return res.status(400).json({ error: 'product_id and rating required' });
    const eligible = await queryOne<any>(
      `SELECT oi.id FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status = 'delivered'`,
      [req.user!.id, product_id]
    );
    if (!eligible) return res.status(403).json({ error: 'You can only review products from delivered orders' });
    const existing = await queryOne(
      'SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2',
      [req.user!.id, product_id]
    );
    if (existing) return res.status(409).json({ error: 'You have already reviewed this product' });
    const autoApprove = await queryOne<any>(`SELECT value FROM settings WHERE key = 'auto_approve_reviews'`);
    const is_approved = autoApprove?.value === 'true';
    const review = await queryOne(
      'INSERT INTO reviews (product_id, user_id, order_id, rating, title, body, is_approved, anonymous) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [product_id, req.user!.id, order_id || null, rating, title || '', body || '', is_approved, anonymous ? true : false]
    );
    res.json({ data: review });
  } catch (err: any) {
    console.error('[Reviews] post', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Newsletter
router.post('/newsletter', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const existing = await queryOne('SELECT id FROM newsletters WHERE email = $1', [email]);
  if (existing) return res.status(409).json({ error: 'Already subscribed' });
  await query('INSERT INTO newsletters (email) VALUES ($1)', [email]);
  res.json({ data: { success: true } });
});

// Coupons validate
router.post('/coupons/validate', async (req, res) => {
  const { code, cart_total } = req.body;
  if (!code) return res.status(400).json({ error: 'Code required' });
  const coupon = await queryOne<any>(
    `SELECT * FROM coupons WHERE code = $1 AND is_active = true
     AND (expires_at IS NULL OR expires_at > NOW())
     AND (usage_limit IS NULL OR used_count < usage_limit)`,
    [code.toUpperCase()]
  );
  if (!coupon) return res.status(404).json({ error: 'Invalid or expired coupon' });
  if (coupon.min_order_amount && cart_total < coupon.min_order_amount) {
    return res.status(400).json({ error: `Minimum order amount is KES ${coupon.min_order_amount}` });
  }
  let discount = coupon.type === 'percentage' ? (cart_total * coupon.value) / 100 : coupon.value;
  if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
  res.json({ data: { coupon, discount } });
});

// Settings — get all
router.get('/settings', async (_req, res) => {
  try {
    const rows = await query('SELECT key, value FROM settings');
    const map: Record<string, string> = {};
    rows.forEach((r: any) => { map[r.key] = r.value; });
    res.json({ data: map });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Settings — upsert one or many
router.put('/settings', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await queryOne<any>('SELECT role FROM users WHERE id = $1', [req.user!.id]);
    if (user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const updates: Record<string, string> = req.body;
    for (const [key, value] of Object.entries(updates)) {
      const existing = await queryOne('SELECT id FROM settings WHERE key = $1', [key]);
      if (existing) {
        await query('UPDATE settings SET value = $1, updated_at = NOW() WHERE key = $2', [value, key]);
      } else {
        await query('INSERT INTO settings (key, value) VALUES ($1, $2)', [key, value]);
      }
    }
    res.json({ data: { success: true } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// WhatsApp Number
router.get('/whatsapp-number', async (_req, res) => {
  try {
    const setting = await queryOne<any>(`SELECT value FROM settings WHERE key = 'whatsapp_number'`);
    res.json({ number: setting?.value || '254700000000' });
  } catch {
    res.json({ number: '254700000000' });
  }
});

router.put('/whatsapp-number', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await queryOne<any>('SELECT role FROM users WHERE id = $1', [req.user!.id]);
    if (user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { number } = req.body;
    if (!number) return res.status(400).json({ error: 'Number required' });
    const existing = await queryOne('SELECT id FROM settings WHERE key = $1', ['whatsapp_number']);
    const result = existing
      ? await queryOne('UPDATE settings SET value = $1, updated_at = NOW() WHERE key = $2 RETURNING *', [number, 'whatsapp_number'])
      : await queryOne('INSERT INTO settings (key, value) VALUES ($1, $2) RETURNING *', ['whatsapp_number', number]);
    res.json({ data: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
