import { Router, Response } from 'express';
import { db } from '../db';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/', auth, (req: AuthRequest, res: Response) => {
  const { items, total, shippingAddress, paymentMethod } = req.body;
  if (!items?.length || !total || !shippingAddress || !paymentMethod) {
    return res.status(400).json({ error: 'Missing order data' });
  }
  const order = db.createOrder({
    userId: req.user!.id,
    items,
    total,
    shippingAddress,
    paymentMethod,
    status: 'pending'
  });
  res.json(order);
});

router.get('/my', auth, (req: AuthRequest, res: Response) => {
  const orders = db.getOrdersByUser(req.user!.id);
  res.json(orders);
});

router.get('/:id', auth, (req: AuthRequest, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.userId !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(order);
});

// Cancel order — user can only cancel their own pending/processing orders
router.patch('/:id/cancel', auth, (req: AuthRequest, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.userId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });
  if (!['pending', 'processing'].includes(order.status)) {
    return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
  }
  const updated = db.updateOrder(req.params.id, { status: 'cancelled' });
  res.json(updated);
});

export default router;
