import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';

const DB_PATH = path.join(__dirname, '../../db.json');

async function seed() {
  let db: any = { users: [], products: [], orders: [], messages: [] };
  if (fs.existsSync(DB_PATH)) {
    db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  }

  const adminExists = db.users.find((u: any) => u.email === 'admin@grindbyte.com');
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    db.users.push({
      id: uuid(),
      email: 'admin@grindbyte.com',
      name: 'Admin',
      passwordHash,
      role: 'admin',
      createdAt: new Date().toISOString()
    });
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log('✅ Admin created: admin@grindbyte.com / admin123');
  } else {
    console.log('ℹ️  Admin already exists');
  }
}

seed();
