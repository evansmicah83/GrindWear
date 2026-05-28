import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { couponSchema } from '@/lib/validations';

// GET: List coupons
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coupons = await db.getAll(
      'SELECT * FROM coupons ORDER BY created_at DESC'
    );

    return NextResponse.json({ data: coupons });
  } catch (error) {
    console.error('Coupons fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

// POST: Create coupon
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = couponSchema.parse(body);

    const coupon = await db.getOne(
      `INSERT INTO coupons (code, type, value, min_order_amount, max_discount, usage_limit, is_active, expires_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [
        validated.code,
        validated.type,
        validated.value,
        validated.min_order_amount,
        validated.max_discount,
        validated.usage_limit,
        true,
        validated.expires_at,
      ]
    );

    return NextResponse.json(
      { data: coupon, message: 'Coupon created' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Coupon creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create coupon', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
