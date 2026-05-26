import { Router, Response } from 'express';
import { db } from '../db';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/messages', auth, (req: AuthRequest, res: Response) => {
  const messages = db.getMessages();
  // Users see only their own + admin messages; admins see all
  if (req.user!.role === 'admin') return res.json(messages);
  const userId = req.user!.id;
  res.json(messages.filter(m => m.senderId === userId || m.senderRole === 'admin'));
});

router.post('/messages', auth, (req: AuthRequest, res: Response) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Content required' });
  const user = db.getUserById(req.user!.id)!;
  const msg = db.createMessage({
    senderId: user.id,
    senderName: user.name,
    senderRole: user.role,
    content: content.trim(),
    read: false
  });
  res.json(msg);
});

router.post('/messages/read', auth, (req: AuthRequest, res: Response) => {
  db.markMessagesRead(req.user!.id);
  res.json({ success: true });
});

export default router;
