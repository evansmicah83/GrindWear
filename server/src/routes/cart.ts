import { Router, Response } from 'express';
import { query, queryOne } from '../db';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

async function getOrCreateCart(userId?: string, sessionId?: string) {
  if (userId) {
    let cart = await queryOne<any>('SELECT * FROM carts WHERE user_id = $1', [userId]);
    if (!cart) cart = await queryOne('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [userId]);
    return cart;
  }
  if (sessionId) {
    let cart = await queryOne<any>('SELECT * FROM carts WHERE session_id = $1', [sessionId]);
    if (!cart) cart = await queryOne('INSERT INTO carts (session_id) VALUES ($1) RETURNING *', [sessionId]);
    return cart;
  }
  return null;
}

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    const cart = await getOrCreateCart(undefined, sessionId);
    if (!cart) return res.json({ data: { items: [] } });
    const items = await query<any>(
      `SELECT ci.*, p.name, p.price, p.slug,
        pi.url as image,
        pv.size, pv.color, pv.color_hex, pv.stock_qty
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
       LEFT JOIN product_variants pv ON pv.id = ci.variant_id
       WHERE ci.cart_id = $1`,
      [cart.id]
    );
    res.json({ data: { cartId: cart.id, items } });
  } catch (err: any) { console.error('[Cart] get', err.message); res.status(500).json({ error: err.message }); }
});

router.post('/items', async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    const userId = req.user?.id;
    const cart = await getOrCreateCart(userId, sessionId);
    if (!cart) return res.status(400).json({ error: 'No cart session' });
    const { product_id, variant_id, quantity = 1, price_at_add } = req.body;
    const existing = await queryOne<any>(
      'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2 AND variant_id IS NOT DISTINCT FROM $3',
      [cart.id, product_id, variant_id || null]
    );
    if (existing) {
      const updated = await queryOne('UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2 RETURNING *', [quantity, existing.id]);
      return res.json({ data: updated });
    }
    const item = await queryOne(
      'INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, price_at_add) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [cart.id, product_id, variant_id || null, quantity, price_at_add]
    );
    res.json({ data: item });
  } catch (err: any) { console.error('[Cart] add item', err.message); res.status(500).json({ error: err.message }); }
});

router.put('/items/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { quantity } = req.body;
    if (quantity <= 0) {
      await query('DELETE FROM cart_items WHERE id = $1', [req.params.id]);
      return res.json({ data: { deleted: true } });
    }
    const item = await queryOne('UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *', [quantity, req.params.id]);
    res.json({ data: item });
  } catch (err: any) { console.error('[Cart] update item', err.message); res.status(500).json({ error: err.message }); }
});

router.delete('/items/:id', async (req, res) => {
  try {
    await query('DELETE FROM cart_items WHERE id = $1', [req.params.id]);
    res.json({ data: { success: true } });
  } catch (err: any) { console.error('[Cart] delete item', err.message); res.status(500).json({ error: err.message }); }
});

router.delete('/', async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    const userId = req.user?.id;
    const cart = await getOrCreateCart(userId, sessionId);
    if (cart) await query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
    res.json({ data: { success: true } });
  } catch (err: any) { console.error('[Cart] clear', err.message); res.status(500).json({ error: err.message }); }
});

export default router;
