import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

async function setupDatabase() {
  const pool = new Pool({
    user: 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'postgres',
  });

  try {
    console.log('🔍 Checking if database exists...');
    const result = await pool.query(
      "SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = 'grind_byte')"
    );

    if (!result.rows[0].exists) {
      console.log('📦 Creating grind_byte database...');
      await pool.query('CREATE DATABASE grind_byte');
      console.log('✓ Database created');
    } else {
      console.log('✓ Database already exists');
    }

    await pool.end();

    // Connect to grind_byte and run migrations
    const grindPool = new Pool({
      user: 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'grind_byte',
    });

    console.log('🗄️  Running migrations...');
    const migrationSql = fs.readFileSync(
      path.join(process.cwd(), 'migrations/001_initial_schema.sql'),
      'utf-8'
    );

    await grindPool.query(migrationSql);
    console.log('✓ Migrations completed');

    await grindPool.end();
    console.log('✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupDatabase();
