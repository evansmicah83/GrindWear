import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await db.getOne(
      'SELECT * FROM products WHERE slug = $1 AND is_active = true',
      [params.slug]
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const [variants, images, reviews] = await Promise.all([
      db.getAll(
        'SELECT * FROM product_variants WHERE product_id = $1 ORDER BY created_at',
        [product.id]
      ),
      db.getAll(
        'SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order',
        [product.id]
      ),
      db.getAll(
        `SELECT r.*, u.name as user_name, u.avatar_url as user_avatar
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.product_id = $1 AND r.is_approved = true
         ORDER BY r.created_at DESC
         LIMIT 10`,
        [product.id]
      ),
    ]);

    return NextResponse.json({
      data: {
        ...product,
        variants,
        images,
        reviews,
      },
    });
  } catch (error) {
    console.error('Product detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
