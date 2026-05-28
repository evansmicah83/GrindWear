import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase.com') ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => console.error('[DB] Unexpected error on idle client', err));

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) console.warn(`[DB] Slow query (${duration}ms):`, text);
    return res.rows as T[];
  } catch (err: any) {
    console.error('[DB] Query error:', err.message, '| Query:', text);
    throw err;
  }
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export default pool;
