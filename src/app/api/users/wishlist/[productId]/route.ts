import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// POST: Add to wishlist
export async function POST(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if product exists
    const product = await db.getOne(
      'SELECT id FROM products WHERE id = $1 AND is_active = true',
      [params.productId]
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if already in wishlist
    const existing = await db.getOne(
      `SELECT id FROM wishlists WHERE user_id = $1 AND product_id = $2`,
      [(session.user as any).id, params.productId]
    );

    if (existing) {
      return NextResponse.json(
        { error: 'Already in wishlist' },
        { status: 400 }
      );
    }

    const item = await db.getOne(
      `INSERT INTO wishlists (user_id, product_id, created_at)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [(session.user as any).id, params.productId]
    );

    return NextResponse.json(
      { data: item, message: 'Added to wishlist' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Wishlist add error:', error);
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}

// DELETE: Remove from wishlist
export async function DELETE(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.execute(
      `DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2`,
      [(session.user as any).id, params.productId]
    );

    return NextResponse.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Wishlist remove error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
}
