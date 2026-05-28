import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET: Admin dashboard stats
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get totals
    const [totalRevenue, ordersCount, customersCount] = await Promise.all([
      db.getOne<{ total: number }>(
        `SELECT SUM(total)::numeric as total FROM orders WHERE payment_status = 'paid'`
      ),
      db.getOne<{ count: number }>(
        `SELECT COUNT(*)::int as count FROM orders`
      ),
      db.getOne<{ count: number }>(
        `SELECT COUNT(*)::int as count FROM users WHERE role = 'customer'`
      ),
    ]);

    // Get low stock items
    const lowStock = await db.getAll(
      `SELECT p.id, p.name, p.sku, SUM(pv.stock_qty)::int as total_stock
       FROM products p
       LEFT JOIN product_variants pv ON p.id = pv.product_id
       GROUP BY p.id, p.name, p.sku
       HAVING SUM(pv.stock_qty) < 10
       ORDER BY total_stock ASC
       LIMIT 10`
    );

    // Get recent orders
    const recentOrders = await db.getAll(
      `SELECT o.*, u.name as user_name, u.email as user_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 10`
    );

    // Get revenue chart data (last 30 days)
    const chartData = await db.getAll(
      `SELECT
        DATE(created_at) as date,
        COUNT(*)::int as orders,
        SUM(total)::numeric as revenue
       FROM orders
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    return NextResponse.json({
      data: {
        stats: {
          totalRevenue: totalRevenue?.total || 0,
          ordersCount: ordersCount?.count || 0,
          customersCount: customersCount?.count || 0,
        },
        lowStock,
        recentOrders,
        chartData,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
