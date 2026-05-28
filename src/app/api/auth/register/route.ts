import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validations';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    // Check if user exists
    const existing = await db.getOne(
      'SELECT id FROM users WHERE email = $1',
      [validated.email]
    );

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered', message: 'User already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12);

    const user = await db.getOne(
      `INSERT INTO users (name, email, password_hash, role, phone, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, name, email, role, phone, avatar_url, created_at`,
      [validated.name, validated.email, hashedPassword, 'customer', validated.phone || null]
    );

    return NextResponse.json(
      {
        data: user,
        message: 'Registration successful',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
