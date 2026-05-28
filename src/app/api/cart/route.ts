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

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;

    const cart = await getOrCreateCart(session?.user?.id as string | undefined, sessionId);

    const items = await db.getAll(
      `SELECT ci.*, p.name, p.price, p.slug, pv.size, pv.color, pv.color_hex
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN product_variants pv ON ci.variant_id = pv.id
       WHERE ci.cart_id = $1
       ORDER BY ci.created_at DESC`,
      [cart.id]
    );

    return NextResponse.json({
      data: { ...cart, items },
    });
  } catch (error) {
    console.error('Cart fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}
