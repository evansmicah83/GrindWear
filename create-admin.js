import pg from 'pg';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// First connect without a database to create it
const rootPool = new Pool({ user: 'postgres', password: '', host: 'localhost', port: 5432, database: 'postgres' });

async function run() {
  // 1. Create database
  try {
    await rootPool.query('CREATE DATABASE grind_byte');
    console.log('[1/3] Database grind_byte created');
  } catch (e) {
    console.log('[1/3] Database already exists, continuing...');
  }
  await rootPool.end();

  // 2. Connect to grind_byte and run migrations
  const pool = new Pool({ user: 'postgres', password: '', host: 'localhost', port: 5432, database: 'grind_byte' });

  const schema = fs.readFileSync(path.join(__dirname, 'migrations/001_initial_schema.sql'), 'utf-8');
  await pool.query(schema);
  console.log('[2/3] Schema migrated');

  const seed = fs.readFileSync(path.join(__dirname, 'migrations/002_seed.sql'), 'utf-8');
  await pool.query(seed);
  console.log('[2/3] Seed data inserted');

  // 3. Insert admin user
  const hash = await bcrypt.hash('Evans2193.', 12);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE SET password_hash = $3, role = 'admin', name = $1`,
    ['Evans Micah', 'micahevans83@gmail.com', hash]
  );
  console.log('[3/3] Admin user ready: micahevans83@gmail.com / Evans2193.');

  await pool.end();
  console.log('\nDone! Run: npm run dev');
}

run().catch(err => { console.error('Error:', err.message); process.exit(1); });
