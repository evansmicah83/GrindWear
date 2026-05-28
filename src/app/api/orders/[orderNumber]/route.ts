import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET: Single order detail
export async function GET(
  req: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await db.getOne(
      `SELECT * FROM orders WHERE order_number = $1`,
      [params.orderNumber]
    );

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check access (own order or admin)
    if (
      order.user_id !== (session.user as any).id &&
      (session.user as any).role !== 'admin'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const items = await db.getAll(
      `SELECT * FROM order_items WHERE order_id = $1`,
      [order.id]
    );

    return NextResponse.json({
      data: { ...order, items },
    });
  } catch (error) {
    console.error('Order detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
