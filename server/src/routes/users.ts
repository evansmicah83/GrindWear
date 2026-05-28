import { Router, Response } from 'express';
import { query, queryOne } from '../db';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

function normalizeImageValue(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (typeof parsed === 'string') return normalizeImageValue(parsed);
      if (parsed && typeof parsed === 'object') {
        const possible = ['url', 'image_url', 'src', 'path', 'thumbnail', 'publicUrl', 'public_url']
          .map((key) => (parsed as Record<string, unknown>)[key])
          .find((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
        if (possible) return possible.trim();
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }

  if (value && typeof value === 'object') {
    const possible = ['url', 'image_url', 'src', 'path', 'thumbnail', 'publicUrl', 'public_url']
      .map((key) => (value as Record<string, unknown>)[key])
      .find((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
    if (possible) return possible.trim();
  }

  return null;
}

router.use(auth);

router.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const user = await queryOne('SELECT id, name, email, phone, avatar_url, role, created_at FROM users WHERE id = $1', [req.user!.id]);
    res.json({ data: { ...user, avatar_url: normalizeImageValue(user.avatar_url) ?? user.avatar_url } });
  } catch (err: any) { console.error('[Users] profile', err.message); res.status(500).json({ error: err.message }); }
});

router.put('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, avatar_url } = req.body;
    const user = await queryOne(
      'UPDATE users SET name=COALESCE($1,name), phone=COALESCE($2,phone), avatar_url=COALESCE($3,avatar_url), updated_at=NOW() WHERE id=$4 RETURNING id,name,email,phone,avatar_url,role',
      [name, phone, avatar_url, req.user!.id]
    );
    res.json({ data: user });
  } catch (err: any) { console.error('[Users] update profile', err.message); res.status(500).json({ error: err.message }); }
});

router.get('/addresses', async (req: AuthRequest, res: Response) => {
  try {
    const rows = await query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC', [req.user!.id]);
    res.json({ data: rows });
  } catch (err: any) { console.error('[Users] addresses', err.message); res.status(500).json({ error: err.message }); }
});

router.post('/addresses', async (req: AuthRequest, res: Response) => {
  try {
    const { label, street, city, county, country = 'Kenya', postal_code, is_default = false } = req.body;
    if (is_default) await query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user!.id]);
    const addr = await queryOne(
      'INSERT INTO addresses (user_id, label, street, city, county, country, postal_code, is_default) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [req.user!.id, label, street, city, county, country, postal_code, is_default]
    );
    res.json({ data: addr });
  } catch (err: any) { console.error('[Users] add address', err.message); res.status(500).json({ error: err.message }); }
});

router.put('/addresses/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { label, street, city, county, country, postal_code, is_default } = req.body;
    if (is_default) await query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user!.id]);
    const addr = await queryOne(
      `UPDATE addresses SET label=COALESCE($1,label), street=COALESCE($2,street), city=COALESCE($3,city),
       county=COALESCE($4,county), country=COALESCE($5,country), postal_code=COALESCE($6,postal_code),
       is_default=COALESCE($7,is_default) WHERE id=$8 AND user_id=$9 RETURNING *`,
      [label, street, city, county, country, postal_code, is_default, req.params.id, req.user!.id]
    );
    res.json({ data: addr });
  } catch (err: any) { console.error('[Users] update address', err.message); res.status(500).json({ error: err.message }); }
});

router.delete('/addresses/:id', async (req: AuthRequest, res: Response) => {
  try {
    await query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [req.params.id, req.user!.id]);
    res.json({ data: { success: true } });
  } catch (err: any) { console.error('[Users] delete address', err.message); res.status(500).json({ error: err.message }); }
});

router.get('/orders', async (req: AuthRequest, res: Response) => {
  try {
    const orders = await query<any>(
      `SELECT o.*, json_agg(oi.*) as items FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1 GROUP BY o.id ORDER BY o.created_at DESC`,
      [req.user!.id]
    );
    res.json({ data: orders });
  } catch (err: any) { console.error('[Users] orders', err.message); res.status(500).json({ error: err.message }); }
});

router.get('/orders/:id', async (req: AuthRequest, res: Response) => {
  try {
    const order = await queryOne<any>(
      `SELECT o.*, json_agg(oi.*) as items FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE (o.id::text = $1 OR o.order_number = $1) AND o.user_id = $2
       GROUP BY o.id`,
      [req.params.id, req.user!.id]
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ data: order });
  } catch (err: any) { console.error('[Users] order detail', err.message); res.status(500).json({ error: err.message }); }
});

router.get('/wishlist', async (req: AuthRequest, res: Response) => {
  try {
    const items = await query<any>(
      `SELECT w.*, p.name, p.slug, p.price, p.compare_price,
        pi.url as image
       FROM wishlists w
       JOIN products p ON p.id = w.product_id
       LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
       WHERE w.user_id = $1 ORDER BY w.created_at DESC`,
      [req.user!.id]
    );
    res.json({ data: items });
  } catch (err: any) { console.error('[Users] wishlist', err.message); res.status(500).json({ error: err.message }); }
});

router.post('/wishlist', async (req: AuthRequest, res: Response) => {
  try {
    const { product_id } = req.body;
    const existing = await queryOne('SELECT id FROM wishlists WHERE user_id=$1 AND product_id=$2', [req.user!.id, product_id]);
    if (existing) return res.status(409).json({ error: 'Already in wishlist' });
    const item = await queryOne('INSERT INTO wishlists (user_id, product_id) VALUES ($1,$2) RETURNING *', [req.user!.id, product_id]);
    res.json({ data: item });
  } catch (err: any) { console.error('[Users] add wishlist', err.message); res.status(500).json({ error: err.message }); }
});

router.delete('/wishlist/:productId', async (req: AuthRequest, res: Response) => {
  try {
    await query('DELETE FROM wishlists WHERE user_id=$1 AND product_id=$2', [req.user!.id, req.params.productId]);
    res.json({ data: { success: true } });
  } catch (err: any) { console.error('[Users] remove wishlist', err.message); res.status(500).json({ error: err.message }); }
});

export default router;
