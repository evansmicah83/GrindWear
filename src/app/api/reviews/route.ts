import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { reviewSchema } from '@/lib/validations';

// POST: Create review
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = reviewSchema.parse(body);

    // Check if user has purchased this product
    const purchase = await db.getOne(
      `SELECT oi.id FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status = 'delivered'
       LIMIT 1`,
      [(session.user as any).id, validated.product_id]
    );

    if (!purchase) {
      return NextResponse.json(
        { error: 'You must have purchased this product to review it' },
        { status: 403 }
      );
    }

    const review = await db.getOne(
      `INSERT INTO reviews (product_id, user_id, rating, title, body, is_approved, created_at)
       VALUES ($1, $2, $3, $4, $5, false, NOW())
       RETURNING *`,
      [
        validated.product_id,
        (session.user as any).id,
        validated.rating,
        validated.title,
        validated.body,
      ]
    );

    return NextResponse.json(
      { data: review, message: 'Review submitted for approval' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create review', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
