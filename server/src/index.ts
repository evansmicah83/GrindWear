import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import adminRoutes from './routes/admin';
import cartRoutes from './routes/cart';
import userRoutes from './routes/users';
import miscRoutes from './routes/misc';
import chatRoutes from './routes/chat';
import notificationRoutes from './routes/notifications';
import { setupSocket } from './socket';
import { queryOne } from './db';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Maintenance mode — cached in memory, refreshed every 30s to avoid a DB hit on every request
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
  if (await isMaintenanceMode()) return res.status(503).json({ error: 'Store is under maintenance. Please check back later.' });
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

setupSocket(io);

// Global error handler — catches any unhandled errors thrown in route handlers
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Prevent unhandled promise rejections from crashing the process
process.on('unhandledRejection', (reason: any) => {
  console.error('[UNHANDLED REJECTION]', reason?.message || reason);
});

// Prevent uncaught exceptions from crashing the process
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err.message);
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});

export { io };
