import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateOrderNumber, getSkipTake, createPaginationMeta } from '@/lib/utils';
import { orderSchema } from '@/lib/validations';

// GET: List user's orders or all orders for admin
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const [skip, take] = getSkipTake(page, limit);

    let query = '';
    const params: any[] = [];

    if ((session.user as any).role === 'admin') {
      query = 'SELECT * FROM orders ORDER BY created_at DESC';
    } else {
      query = 'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC';
      params.push((session.user as any).id);
    }

    const countResult = await db.getOne<{ count: number }>(
      query.replace('SELECT *', 'SELECT COUNT(*)::int as count'),
      params
    );
    const total = countResult?.count || 0;

    const orders = await db.getAll(
      query + ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, take, skip]
    );

    const pagination = createPaginationMeta(total, page, limit);

    return NextResponse.json({ data: orders, pagination });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST: Create order from cart
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = orderSchema.parse(body);

    // Get cart items
    const cart = await db.getOne(
      'SELECT * FROM carts WHERE user_id = $1',
      [(session.user as any).id]
    );

    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    const cartItems = await db.getAll(
      `SELECT ci.*, p.name, p.price, p.sku
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1`,
      [cart.id]
    );

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of cartItems) {
      subtotal += item.price_at_add * item.quantity;
    }

    const orderNumber = generateOrderNumber();

    // Create order
    const order = await db.getOne(
      `INSERT INTO orders (
        user_id, order_number, status, subtotal, total, shipping_address_id,
        billing_address_id, payment_method, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *`,
      [
        (session.user as any).id,
        orderNumber,
        'pending',
        subtotal,
        subtotal,
        validated.shipping_address_id,
        validated.billing_address_id || validated.shipping_address_id,
        validated.payment_method || null,
      ]
    );

    // Create order items
    for (const item of cartItems) {
      await db.execute(
        `INSERT INTO order_items (
          order_id, product_id, variant_id, quantity, unit_price, total_price,
          product_name, product_sku, variant_info
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          order.id,
          item.product_id,
          item.variant_id,
          item.quantity,
          item.price_at_add,
          item.price_at_add * item.quantity,
          item.name,
          item.sku,
          JSON.stringify({ size: item.size, color: item.color }),
        ]
      );
    }

    // Clear cart
    await db.execute('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);

    return NextResponse.json(
      { data: order, message: 'Order created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
