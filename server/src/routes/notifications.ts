import { Router, Response } from 'express';
import { query, queryOne } from '../db';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(auth);

// Get notifications for current user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const rows = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user!.id]
    );
    res.json({ data: rows.map(n => ({ id: n.id, type: n.type, title: n.title, message: n.message, link: n.link, read: n.read, createdAt: n.created_at })) });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Mark one as read
router.patch('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    await query('UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2', [req.params.id, req.user!.id]);
    res.json({ data: { success: true } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Mark all as read
router.patch('/read-all', async (req: AuthRequest, res: Response) => {
  try {
    await query('UPDATE notifications SET read = true WHERE user_id = $1', [req.user!.id]);
    res.json({ data: { success: true } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Delete one
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await query('DELETE FROM notifications WHERE id = $1 AND user_id = $2', [req.params.id, req.user!.id]);
    res.json({ data: { success: true } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Clear all
router.delete('/', async (req: AuthRequest, res: Response) => {
  try {
    await query('DELETE FROM notifications WHERE user_id = $1', [req.user!.id]);
    res.json({ data: { success: true } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
