import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from '../server/src/routes/auth';
import productRoutes from '../server/src/routes/products';
import orderRoutes from '../server/src/routes/orders';
import adminRoutes from '../server/src/routes/admin';
import cartRoutes from '../server/src/routes/cart';
import userRoutes from '../server/src/routes/users';
import miscRoutes from '../server/src/routes/misc';
import chatRoutes from '../server/src/routes/chat';
import notificationRoutes from '../server/src/routes/notifications';
import { queryOne } from '../server/src/db';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

let maintenanceMode = false;
let maintenanceCacheTime = 0;
async function isMaintenanceMode(): Promise<boolean> {
  if (Date.now() - maintenanceCacheTime < 30_000) return maintenanceMode;
  try {
    const setting = await queryOne<any>(`SELECT value FROM settings WHERE key = 'maintenance_mode'`);
    maintenanceMode = setting?.value === 'true';
    maintenanceCacheTime = Date.now();
  } catch { /* keep last known value */ }
  return maintenanceMode;
}

app.use(async (req, res, next) => {
  if (req.path.startsWith('/api/admin') || req.path.startsWith('/api/auth') || req.path === '/api/settings') return next();
  if (await isMaintenanceMode()) return res.status(503).json({ error: 'Store is under maintenance.' });
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', miscRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

export default app;
