import { Pool, QueryResult } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export type QueryParams = (string | number | boolean | null | string[] | object)[];

export async function query<T = any>(
  text: string,
  params?: QueryParams
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    if (duration > 1000) {
      console.warn(
        `[SLOW QUERY] ${duration}ms - ${text.substring(0, 100)}...`
      );
    }

    return result;
  } catch (error) {
    console.error('Database error:', text, params, error);
    throw error;
  }
}

export async function getOne<T = any>(
  text: string,
  params?: QueryParams
): Promise<T | null> {
  const result = await query<T>(text, params);
  return result.rows[0] || null;
}

export async function getAll<T = any>(
  text: string,
  params?: QueryParams
): Promise<T[]> {
  const result = await query<T>(text, params);
  return result.rows;
}

export async function execute(text: string, params?: QueryParams): Promise<void> {
  await query(text, params);
}

export const db = {
  query,
  getOne,
  getAll,
  execute,
  pool,
};
