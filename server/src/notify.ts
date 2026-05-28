import { query } from './db';
import { io } from './index';

export async function notify(userId: string, type: string, title: string, message: string, link?: string) {
  try {
    const rows = await query(
      `INSERT INTO notifications (user_id, type, title, message, link) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [userId, type, title, message, link || null]
    );
    const n = rows[0];
    // Push to user's socket room
    io.to(userId).emit('notification', {
      id: n.id, type: n.type, title: n.title, message: n.message,
      link: n.link, read: n.read, createdAt: n.created_at,
    });
    return n;
  } catch (err: any) {
    console.error('[Notify]', err.message);
  }
}

export async function notifyAdmin(type: string, title: string, message: string, link?: string) {
  try {
    // Get all admin users
    const admins = await query(`SELECT id FROM users WHERE role = 'admin'`);
    for (const admin of admins) {
      await notify(admin.id, type, title, message, link);
    }
    // Also broadcast to admin-room socket
    io.to('admin-room').emit('notification', { type, title, message, link, read: false, createdAt: new Date().toISOString() });
  } catch (err: any) {
    console.error('[NotifyAdmin]', err.message);
  }
}
