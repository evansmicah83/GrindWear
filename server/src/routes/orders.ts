import { Router, Response } from 'express';
import { query, queryOne } from '../db';
import { auth, AuthRequest } from '../middleware/auth';
import { notifyAdmin, notify } from '../notify';
import jwt from 'jsonwebtoken';

async function getSetting(key: string): Promise<string | null> {
  const row = await queryOne<any>(`SELECT value FROM settings WHERE key = $1`, [key]);
  return row?.value ?? null;
}

// Flexible auth: required unless guest checkout is enabled
async function flexAuth(req: AuthRequest, res: Response, next: Function) {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'grind-byte-secret-2024') as { id: string; role: string };
      req.user = decoded as any;
      return next();
    } catch {}
  }
  const guestAllowed = await getSetting('allow_guest_checkout');
  if (guestAllowed === 'true') return next();
  return res.status(401).json({ error: 'Authentication required' });
}

const router = Router();

async function genOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const result = await queryOne<any>(
    `SELECT COUNT(*) as count FROM orders WHERE EXTRACT(YEAR FROM created_at) = $1`, [year]
  );
  const seq = (parseInt(result?.count || '0') + 1).toString().padStart(5, '0');
  return `GRB-${year}-${seq}`;
}

router.post('/', flexAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { items, subtotal, shipping_cost = 0, discount_amount = 0, total, shippingAddress, paymentMethod } = req.body;
    if (!items?.length || !total || !shippingAddress) return res.status(400).json({ error: 'Missing order data' });

    // Guest order: no user_id
    const userId = req.user?.id || null;
    // Update user's phone if provided and not already set
    if (shippingAddress.phone && userId) {
      await query(
        `UPDATE users SET phone = $1 WHERE id = $2 AND (phone IS NULL OR phone = '')`,
        [shippingAddress.phone, userId]
      );
    }

    const addr = await queryOne<any>(
      `INSERT INTO addresses (user_id, label, street, city, county, country, postal_code)
       VALUES ($1, 'Shipping', $2, $3, $4, $5, $6) RETURNING id`,
      [userId, shippingAddress.street, shippingAddress.city, shippingAddress.county || shippingAddress.state, shippingAddress.country || 'Kenya', shippingAddress.postalCode || '']
    );

    const order = await queryOne<any>(
      `INSERT INTO orders (user_id, order_number, subtotal, shipping_cost, discount_amount, total, shipping_address_id, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, await genOrderNumber(), subtotal || total, shipping_cost, discount_amount, total, addr!.id, paymentMethod]
    );

    for (const item of items) {
      await query(
        `INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price, total_price, product_name, variant_info)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [order!.id, item.productId || item.product?.id, item.variantId || null, item.quantity, item.price, item.price * item.quantity, item.productName || item.product?.name, JSON.stringify({ size: item.size, color: item.color })]
      );
    }

    await notifyAdmin('order', `New Order ${order!.order_number}`, `KES ${total} from ${userId ? 'customer' : 'guest'} — ${items.length} item(s)`, `/admin/orders/${order!.id}`);
    if (userId) await notify(userId, 'order', 'Order Placed!', `Your order ${order!.order_number} has been received and is being processed.`, `/orders`);

    res.json({ data: order });
  } catch (err: any) {
    console.error('[Orders] POST', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', auth, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await query<any>(
      `SELECT o.*, json_agg(oi.*) as items FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = $1 GROUP BY o.id ORDER BY o.created_at DESC`,
      [req.user!.id]
    );
    res.json({ data: orders });
  } catch (err: any) {
    console.error('[Orders] GET /my', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const order = await queryOne<any>(
      `SELECT o.*, json_agg(oi.*) as items FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE (o.id::text = $1 OR o.order_number = $1)
       GROUP BY o.id`,
      [req.params.id]
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.user_id !== req.user!.id && req.user!.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    res.json({ data: order });
  } catch (err: any) {
    console.error('[Orders] GET /:id', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/cancel', auth, async (req: AuthRequest, res: Response) => {
  try {
    const order = await queryOne<any>('SELECT * FROM orders WHERE id::text = $1 OR order_number = $1', [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.user_id !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });
    if (!['pending', 'processing'].includes(order.status)) return res.status(400).json({ error: 'Cannot cancel at this stage' });
    const updated = await queryOne('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', ['cancelled', order.id]);
    // Notify admin
    await notifyAdmin('order', 'Order Cancelled', `Order ${order.order_number} was cancelled by customer.`, `/admin/orders/${order.id}`);
    res.json({ data: updated });
  } catch (err: any) {
    console.error('[Orders] PATCH cancel', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
