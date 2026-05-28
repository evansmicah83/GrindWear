import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query, queryOne } from '../db';
import { signToken, auth, AuthRequest } from '../middleware/auth';

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

router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) return res.status(400).json({ error: 'All fields required' });
    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const password_hash = await bcrypt.hash(password, 12);
    const user = await queryOne<any>(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'customer') RETURNING id, name, email, role`,
      [name, email, password_hash]
    );
    const token = signToken({ id: user!.id, role: user!.role });
    res.json({ token, user });
  } catch (err: any) {
    console.error('[Auth] register', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'All fields required' });
    const user = await queryOne<any>('SELECT * FROM users WHERE email = $1', [email]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken({ id: user.id, role: user.role });
    const avatar = normalizeImageValue(user.avatar_url);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role === 'customer' ? 'user' : user.role, avatar } });
  } catch (err: any) {
    console.error('[Auth] login', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await queryOne<any>('SELECT id, name, email, role, phone, avatar_url FROM users WHERE id = $1', [req.user!.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const avatar = normalizeImageValue(user.avatar_url);
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role === 'customer' ? 'user' : user.role, phone: user.phone, avatar });
  } catch (err: any) {
    console.error('[Auth] me', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
