import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getSkipTake, createPaginationMeta } from '@/lib/utils';

// GET: Admin products list
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const [skip, take] = getSkipTake(page, limit);

    const countResult = await db.getOne<{ count: number }>(
      'SELECT COUNT(*)::int as count FROM products'
    );
    const total = countResult?.count || 0;

    const products = await db.getAll(
      `SELECT p.*, c.name as category_name,
              SUM(pv.stock_qty)::int as total_stock
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN product_variants pv ON p.id = pv.product_id
       GROUP BY p.id, c.name
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [take, skip]
    );

    const pagination = createPaginationMeta(total, page, limit);

    return NextResponse.json({ data: products, pagination });
  } catch (error) {
    console.error('Admin products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
