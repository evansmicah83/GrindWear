import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { v4 as uuid } from 'uuid';

async function getOrCreateCart(userId?: string, sessionId?: string) {
  if (userId) {
    let cart = await db.getOne(
      'SELECT * FROM carts WHERE user_id = $1',
      [userId]
    );

    if (!cart) {
      cart = await db.getOne(
        `INSERT INTO carts (user_id, created_at, updated_at)
         VALUES ($1, NOW(), NOW())
         RETURNING *`,
        [userId]
      );
    }
    return cart;
  }

  if (!sessionId) {
    sessionId = uuid();
    (await cookies()).set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
    });
  }

  let cart = await db.getOne(
    'SELECT * FROM carts WHERE session_id = $1',
    [sessionId]
  );

  if (!cart) {
    cart = await db.getOne(
      `INSERT INTO carts (session_id, created_at, updated_at)
       VALUES ($1, NOW(), NOW())
       RETURNING *`,
      [sessionId]
    );
  }

  return cart;
}

// POST: Add item to cart
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    const cart = await getOrCreateCart(session?.user?.id as string | undefined, sessionId);

    const body = await req.json();
    const { product_id, variant_id, quantity } = body;

    if (!product_id || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const product = await db.getOne(
      'SELECT price FROM products WHERE id = $1',
      [product_id]
    );

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if item already in cart
    const existing = await db.getOne(
      `SELECT id, quantity FROM cart_items
       WHERE cart_id = $1 AND product_id = $2 AND variant_id IS NOT DISTINCT FROM $3`,
      [cart.id, product_id, variant_id || null]
    );

    let item;
    if (existing) {
      item = await db.getOne(
        `UPDATE cart_items
         SET quantity = quantity + $1, created_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [quantity, existing.id]
      );
    } else {
      item = await db.getOne(
        `INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, price_at_add, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING *`,
        [cart.id, product_id, variant_id || null, quantity, product.price]
      );
    }

    return NextResponse.json({
      data: item,
      message: 'Item added to cart',
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}
