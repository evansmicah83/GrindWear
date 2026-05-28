import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Approved reviews for a product
export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const reviews = await db.getAll(
      `SELECT r.*, u.name as user_name, u.avatar_url as user_avatar
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1 AND r.is_approved = true
       ORDER BY r.created_at DESC`,
      [params.productId]
    );

    return NextResponse.json({ data: reviews });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
