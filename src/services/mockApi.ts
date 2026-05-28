import { api } from './api';
import type { Product, Category, Notification } from '../types';
import { normalizeImageSource } from '../lib/utils';

// Normalize a single image object from the backend
function normalizeDbImage(img: any): string {
  if (!img) return '';
  // img is an object with url field
  const url = typeof img === 'string' ? img : (img.url || '');
  return normalizeImageSource(url);
}

// Adapter: maps backend snake_case shape to frontend camelCase Product type
function mapProduct(p: any): Product {
  // Sort images so primary comes first, then by sort_order
  const sortedImages = Array.isArray(p.images)
    ? [...p.images].sort((a: any, b: any) => {
        if (a?.is_primary && !b?.is_primary) return -1;
        if (!a?.is_primary && b?.is_primary) return 1;
        return (a?.sort_order ?? 0) - (b?.sort_order ?? 0);
      })
    : [];

  // Normalize each image URL (handles raw base64, data URIs, and https URLs)
  const images = sortedImages
    .map(normalizeDbImage)
    .filter(Boolean);

  const sizes: string[] = Array.isArray(p.variants)
    ? [...new Set(p.variants.filter(Boolean).map((v: any) => v.size).filter(Boolean))] as string[]
    : [];

  const colors: string[] = Array.isArray(p.variants)
    ? [...new Set(p.variants.filter(Boolean).map((v: any) => v.color).filter(Boolean))] as string[]
    : [];

  const stock: number = Array.isArray(p.variants)
    ? p.variants.filter(Boolean).reduce((sum: number, v: any) => sum + (parseInt(v.stock_qty) || 0), 0)
    : 0;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || '',
    price: parseFloat(p.price),
    compareAtPrice: p.compare_price ? parseFloat(p.compare_price) : undefined,
    category: p.category_slug || p.category || '',
    images,
    sizes,
    colors,
    tags: p.tags || [],
    stock,
    featured: p.is_featured || false,
    trending: p.is_new || false,
    rating: parseFloat(p.rating) || 0,
    reviewCount: parseInt(p.review_count) || 0,
    createdAt: p.created_at,
  };
}

function mapCategory(c: any): Category {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image_url || '',
    productCount: parseInt(c.product_count) || 0,
  };
}

export const mockApi = {
  async getProducts(filters?: { category?: string; search?: string; sort?: string }): Promise<Product[]> {
    const params: Record<string, string> = {};
    if (filters?.category) params.category = filters.category;
    if (filters?.search) params.search = filters.search;
    if (filters?.sort) params.sort = filters.sort;
    const res = await api.getProducts(params);
    return res.data.map(mapProduct);
  },

  async getProduct(id: string): Promise<Product | null> {
    try {
      const res = await api.getProduct(id);
      return mapProduct(res.data);
    } catch {
      return null;
    }
  },

  async getFeaturedProducts(): Promise<Product[]> {
    const res = await api.getProducts({ featured: 'true' });
    return res.data.map(mapProduct);
  },

  async getTrendingProducts(): Promise<Product[]> {
    const res = await api.getProducts({ trending: 'true' });
    return res.data.map(mapProduct);
  },

  async getCategories(): Promise<Category[]> {
    const res = await api.getCategories();
    return res.data.map(mapCategory);
  },

  async getProductReviews(productId: string) {
    const res = await api.getReviews(productId);
    return res.data.map((r: any) => ({
      id: r.id,
      productId: r.product_id,
      userId: r.user_id,
      userName: r.user_name || r.userName || 'Anonymous',
      userAvatar: r.user_avatar || r.userAvatar || undefined,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      helpful: r.helpful || 0,
      createdAt: r.created_at || r.createdAt,
    }));
  },

  async validateCoupon(code: string) {
    try {
      const res = await api.validateCoupon(code, 0);
      const c = res.data.coupon;
      return {
        code: c.code,
        discount: parseFloat(c.value),
        type: c.type as 'percentage' | 'fixed',
        minAmount: c.min_order_amount ? parseFloat(c.min_order_amount) : undefined,
      };
    } catch {
      return null;
    }
  },

  async createOrder(orderData: any) {
    const res = await api.createOrder(orderData);
    return res.data;
  },

  async getNotifications(): Promise<Notification[]> {
    return [
      { id: '1', type: 'order', title: 'Order Shipped', message: 'Your order #12345 has been shipped', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), link: '/account/orders' },
      { id: '2', type: 'message', title: 'New Message', message: 'Support team replied to your inquiry', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), link: '/account' },
      { id: '3', type: 'product', title: 'Back in Stock', message: 'Classic Black Hoodie is now available', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    ];
  },
};
