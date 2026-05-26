import { Router, Response } from 'express';
import { db } from '../db';
import { auth, adminOnly, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(auth, adminOnly);

router.get('/users', (_req, res) => {
  const users = db.getUsers().map(u => ({
    id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt
  }));
  res.json(users);
});

router.get('/orders', (_req, res) => {
  res.json(db.getOrders());
});

router.patch('/orders/:id/status', (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const valid = ['pending','processing','shipped','delivered','cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const order = db.updateOrder(req.params.id, { status });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

router.get('/products', (_req, res) => res.json(db.getProducts()));

router.post('/products', (req, res) => {
  const product = db.createProduct(req.body);
  res.json(product);
});

router.put('/products/:id', (req, res) => {
  const product = db.updateProduct(req.params.id, req.body);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

router.delete('/products/:id', (req, res) => {
  db.deleteProduct(req.params.id);
  res.json({ success: true });
});

export default router;
