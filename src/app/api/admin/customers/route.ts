import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getSkipTake, createPaginationMeta } from '@/lib/utils';

// GET: Admin customers list
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
      'SELECT COUNT(*)::int as count FROM users WHERE role = $1',
      ['customer']
    );
    const total = countResult?.count || 0;

    const customers = await db.getAll(
      `SELECT u.*, COUNT(o.id)::int as order_count, SUM(o.total)::numeric as total_spent
       FROM users u
       LEFT JOIN orders o ON u.id = o.user_id
       WHERE u.role = 'customer'
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      [take, skip]
    );

    const pagination = createPaginationMeta(total, page, limit);

    return NextResponse.json({ data: customers, pagination });
  } catch (error) {
    console.error('Admin customers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
