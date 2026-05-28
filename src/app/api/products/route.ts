import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSkipTake, createPaginationMeta } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const size = searchParams.get('size');
    const color = searchParams.get('color');
    const priceMin = parseFloat(searchParams.get('price_min') || '0');
    const priceMax = parseFloat(searchParams.get('price_max') || '999999');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';

    const [skip, take] = getSkipTake(page, limit);
    let query = 'SELECT * FROM products WHERE is_active = true';
    const params: any[] = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category_id = $${paramCount++}`;
      params.push(category);
    }

    if (search) {
      query += ` AND (name ILIKE $${paramCount++} OR description ILIKE $${paramCount++})`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (priceMin || priceMax) {
      query += ` AND price BETWEEN $${paramCount++} AND $${paramCount++}`;
      params.push(priceMin, priceMax);
    }

    // Get total count before sorting and pagination
    const countResult = await db.getOne<{ count: number }>(
      query.replace('SELECT *', 'SELECT COUNT(*)::int as count'),
      params
    );
    const total = countResult?.count || 0;

    // Add sorting
    if (sort === 'price_asc') query += ' ORDER BY price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY price DESC';
    else if (sort === 'featured') query += ' ORDER BY is_featured DESC, created_at DESC';
    else query += ' ORDER BY created_at DESC';

    query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(take, skip);

    const products = await db.getAll(query, params);

    // Get variants and images for each product
    const enriched = await Promise.all(
      products.map(async (p) => ({
        ...p,
        variants: await db.getAll(
          'SELECT * FROM product_variants WHERE product_id = $1',
          [p.id]
        ),
        images: await db.getAll(
          'SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order',
          [p.id]
        ),
      }))
    );

    const pagination = createPaginationMeta(total, page, limit);

    return NextResponse.json({
      data: enriched,
      pagination,
    });
  } catch (error) {
    console.error('Products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
