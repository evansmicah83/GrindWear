import { Router } from 'express';
import { query, queryOne } from '../db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { category, search, sort, featured, trending, page = '1', limit = '12' } = req.query as Record<string, string>;

    const conditions: string[] = ['p.is_active = true'];
    const params: any[] = [];

    if (category) { params.push(category); conditions.push(`c.slug = $${params.length}`); }
    if (featured === 'true') conditions.push(`p.is_featured = true`);
    if (trending === 'true') conditions.push(`p.is_new = true`);
    if (search) { params.push(`%${search}%`); conditions.push(`(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`); }

    const where = 'WHERE ' + conditions.join(' AND ');

    const orderMap: Record<string, string> = {
      'price-asc': 'p.price ASC',
      'price-desc': 'p.price DESC',
      'newest': 'p.created_at DESC',
      'featured': 'p.is_featured DESC, p.created_at DESC',
    };
    const orderBy = orderMap[sort] || 'p.created_at DESC';

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const dataParams = [...params, limitNum, offset];

    const rows = await query<any>(
      `SELECT p.id, p.name, p.slug, p.description, p.short_description,
        p.price, p.compare_price, p.sku, p.is_active, p.is_featured, p.is_new,
        p.tags, p.created_at,
        c.name as category_name, c.slug as category_slug,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id',pi.id,'url',pi.url,'alt_text',pi.alt_text,'is_primary',pi.is_primary,'sort_order',pi.sort_order)) FILTER (WHERE pi.id IS NOT NULL), '[]') as images,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id',pv.id,'size',pv.size,'color',pv.color,'color_hex',pv.color_hex,'stock_qty',pv.stock_qty,'sku_variant',pv.sku_variant)) FILTER (WHERE pv.id IS NOT NULL), '[]') as variants,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) as rating,
        COUNT(DISTINCT r.id) as review_count
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN product_images pi ON pi.product_id = p.id
       LEFT JOIN product_variants pv ON pv.product_id = p.id
       LEFT JOIN reviews r ON r.product_id = p.id AND r.is_approved = true
       ${where}
       GROUP BY p.id, c.name, c.slug
       ORDER BY ${orderBy}
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams
    );

    const countRes = await query<any>(
      `SELECT COUNT(DISTINCT p.id) as count FROM products p LEFT JOIN categories c ON p.category_id = c.id ${where}`,
      params
    );

    res.json({ data: rows, pagination: { page: pageNum, limit: limitNum, total: parseInt(countRes[0]?.count || '0') } });
  } catch (err: any) {
    console.error('[Products]', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/categories', async (_req, res) => {
  try {
    const rows = await query(
      `SELECT c.*, COUNT(p.id)::int as product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.is_active = true
       WHERE c.is_active = true
       GROUP BY c.id
       ORDER BY c.sort_order ASC`
    );
    res.json({ data: rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const product = await queryOne<any>(
      `SELECT p.id, p.name, p.slug, p.description, p.short_description,
        p.price, p.compare_price, p.sku, p.is_active, p.is_featured, p.is_new,
        p.tags, p.created_at,
        c.name as category_name, c.slug as category_slug,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id',pi.id,'url',pi.url,'alt_text',pi.alt_text,'is_primary',pi.is_primary,'sort_order',pi.sort_order)) FILTER (WHERE pi.id IS NOT NULL), '[]') as images,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id',pv.id,'size',pv.size,'color',pv.color,'color_hex',pv.color_hex,'stock_qty',pv.stock_qty,'sku_variant',pv.sku_variant)) FILTER (WHERE pv.id IS NOT NULL), '[]') as variants
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN product_images pi ON pi.product_id = p.id
       LEFT JOIN product_variants pv ON pv.product_id = p.id
       WHERE (p.slug = $1 OR (p.id::text = $1 AND $1 ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')) AND p.is_active = true
       GROUP BY p.id, c.name, c.slug`,
      [req.params.slug]
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ data: product });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
