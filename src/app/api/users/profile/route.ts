import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET: Current user profile
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getOne(
      `SELECT id, name, email, role, phone, avatar_url, created_at FROM users WHERE id = $1`,
      [(session.user as any).id]
    );

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT: Update user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, avatar_url } = body;

    const user = await db.getOne(
      `UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone),
       avatar_url = COALESCE($3, avatar_url), updated_at = NOW()
       WHERE id = $4
       RETURNING id, name, email, role, phone, avatar_url`,
      [name, phone, avatar_url, (session.user as any).id]
    );

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
