import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { getSkipTake, createPaginationMeta } from '@/lib/utils';

// GET: Admin orders list
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const [skip, take] = getSkipTake(page, limit);

    let query = 'SELECT o.*, u.name as user_name, u.email as user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id';
    const params: any[] = [];

    if (status) {
      query += ' WHERE o.status = $1';
      params.push(status);
    }

    const countResult = await db.getOne<{ count: number }>(
      query.replace('SELECT o.*', 'SELECT COUNT(*)::int as count'),
      params
    );
    const total = countResult?.count || 0;

    const orders = await db.getAll(
      query + ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, take, skip]
    );

    const pagination = createPaginationMeta(total, page, limit);

    return NextResponse.json({ data: orders, pagination });
  } catch (error) {
    console.error('Admin orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
