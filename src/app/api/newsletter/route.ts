import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { newsletterSchema } from '@/lib/validations';

// POST: Subscribe to newsletter
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = newsletterSchema.parse(body);

    // Check if already subscribed
    const existing = await db.getOne(
      'SELECT id FROM newsletters WHERE email = $1',
      [validated.email]
    );

    if (existing) {
      return NextResponse.json(
        { error: 'Already subscribed', message: 'This email is already on our newsletter' },
        { status: 400 }
      );
    }

    const subscription = await db.getOne(
      `INSERT INTO newsletters (email, is_active, created_at)
       VALUES ($1, true, NOW())
       RETURNING *`,
      [validated.email]
    );

    return NextResponse.json(
      { data: subscription, message: 'Successfully subscribed to newsletter' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
