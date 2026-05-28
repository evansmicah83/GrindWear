import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { quantity } = body;

    if (quantity <= 0) {
      await db.execute('DELETE FROM cart_items WHERE id = $1', [params.id]);
      return NextResponse.json({ message: 'Item removed' });
    }

    const item = await db.getOne(
      `UPDATE cart_items SET quantity = $1, created_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [quantity, params.id]
    );

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error('Update cart item error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.execute('DELETE FROM cart_items WHERE id = $1', [params.id]);
    return NextResponse.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Delete cart item error:', error);
    return NextResponse.json(
      { error: 'Failed to remove item' },
      { status: 500 }
    );
  }
}
