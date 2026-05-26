import type { Product, User, Order, Notification, Review, Category, Coupon } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Classic Black Hoodie',
    slug: 'classic-black-hoodie',
    description: 'Premium quality cotton hoodie with modern streetwear design',
    price: 8500,
    compareAtPrice: 10500,
    category: 'hoodies',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
      'https://images.unsplash.com/photo-1620799140188-3b2a7c2fb7e5?w=800'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'White', 'Gray'],
    tags: ['streetwear', 'casual', 'trending'],
    stock: 50,
    featured: true,
    trending: true,
    rating: 4.8,
    reviewCount: 127,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Urban Cargo Pants',
    slug: 'urban-cargo-pants',
    description: 'Comfortable cargo pants with multiple pockets',
    price: 9500,
    category: 'pants',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800'
    ],
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Black', 'Khaki', 'Olive'],
    tags: ['cargo', 'streetwear'],
    stock: 35,
    featured: true,
    trending: false,
    rating: 4.6,
    reviewCount: 89,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Grind Byte Logo Tee',
    slug: 'grind-byte-logo-tee',
    description: 'Signature GRIND BYTE t-shirt with embroidered logo',
    price: 4200,
    compareAtPrice: 5200,
    category: 'tshirts',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Navy'],
    tags: ['basics', 'logo', 'bestseller'],
    stock: 100,
    featured: true,
    trending: true,
    rating: 4.9,
    reviewCount: 245,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Premium Denim Jacket',
    slug: 'premium-denim-jacket',
    description: 'Classic denim jacket with modern fit',
    price: 13500,
    category: 'jackets',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      'https://images.unsplash.com/photo-1543076659-9380cdf10613?w=800'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'Black'],
    tags: ['denim', 'classic'],
    stock: 25,
    featured: false,
    trending: true,
    rating: 4.7,
    reviewCount: 156,
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Essential Joggers',
    slug: 'essential-joggers',
    description: 'Comfortable joggers for everyday wear',
    price: 6200,
    category: 'pants',
    images: [
      'https://images.unsplash.com/photo-1618517351616-38fb9c5210c6?w=800',
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Gray', 'Navy'],
    tags: ['comfort', 'casual'],
    stock: 75,
    featured: false,
    trending: false,
    rating: 4.5,
    reviewCount: 98,
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Oversized Sweatshirt',
    slug: 'oversized-sweatshirt',
    description: 'Trendy oversized fit sweatshirt',
    price: 7300,
    category: 'hoodies',
    images: [
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800',
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Beige', 'Black', 'White'],
    tags: ['oversized', 'trending'],
    stock: 40,
    featured: true,
    trending: true,
    rating: 4.8,
    reviewCount: 203,
    createdAt: new Date().toISOString()
  }
];

const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Hoodies', slug: 'hoodies', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', productCount: 24 },
  { id: '2', name: 'T-Shirts', slug: 'tshirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', productCount: 45 },
  { id: '3', name: 'Pants', slug: 'pants', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400', productCount: 31 },
  { id: '4', name: 'Jackets', slug: 'jackets', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', productCount: 18 },
  { id: '5', name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', productCount: 27 }
];

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    productId: '1',
    userId: '1',
    userName: 'Alex Johnson',
    rating: 5,
    title: 'Perfect fit and quality!',
    comment: 'This hoodie exceeded my expectations. The fabric is soft and the fit is exactly what I wanted.',
    helpful: 12,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    productId: '1',
    userId: '2',
    userName: 'Sarah Chen',
    rating: 4,
    title: 'Great but runs slightly large',
    comment: 'Love the quality but I should have sized down. Still keeping it!',
    helpful: 8,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const mockApi = {
  async getProducts(filters?: { category?: string; search?: string; sort?: string }): Promise<Product[]> {
    await delay(800);
    let products = [...MOCK_PRODUCTS];

    if (filters?.category) {
      products = products.filter(p => p.category === filters.category);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters?.sort === 'price-asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (filters?.sort === 'price-desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (filters?.sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    }

    return products;
  },

  async getProduct(id: string): Promise<Product | null> {
    await delay(600);
    return MOCK_PRODUCTS.find(p => p.id === id) || null;
  },

  async getFeaturedProducts(): Promise<Product[]> {
    await delay(500);
    return MOCK_PRODUCTS.filter(p => p.featured);
  },

  async getTrendingProducts(): Promise<Product[]> {
    await delay(500);
    return MOCK_PRODUCTS.filter(p => p.trending);
  },

  async getCategories(): Promise<Category[]> {
    await delay(400);
    return MOCK_CATEGORIES;
  },

  async getProductReviews(productId: string): Promise<Review[]> {
    await delay(500);
    return MOCK_REVIEWS.filter(r => r.productId === productId);
  },

  async login(email: string, password: string): Promise<User> {
    await delay(1000);
    return {
      id: '1',
      email,
      name: 'John Doe',
      role: 'user',
      avatar: 'https://i.pravatar.cc/150?u=' + email,
      createdAt: new Date().toISOString()
    };
  },

  async register(data: { email: string; password: string; name: string }): Promise<User> {
    await delay(1200);
    return {
      id: Math.random().toString(36).substr(2, 9),
      email: data.email,
      name: data.name,
      role: 'user',
      avatar: 'https://i.pravatar.cc/150?u=' + data.email,
      createdAt: new Date().toISOString()
    };
  },

  async getNotifications(): Promise<Notification[]> {
    await delay(600);
    return [
      {
        id: '1',
        type: 'order',
        title: 'Order Shipped',
        message: 'Your order #12345 has been shipped',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        link: '/orders/12345'
      },
      {
        id: '2',
        type: 'message',
        title: 'New Message',
        message: 'Support team replied to your inquiry',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        link: '/chat'
      },
      {
        id: '3',
        type: 'product',
        title: 'Back in Stock',
        message: 'Classic Black Hoodie is now available',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      }
    ];
  },

  async validateCoupon(code: string): Promise<Coupon | null> {
    await delay(800);
    const coupons: Record<string, Coupon> = {
      'WELCOME10': { code: 'WELCOME10', discount: 10, type: 'percentage' },
      'SAVE500': { code: 'SAVE500', discount: 500, type: 'fixed', minAmount: 5000 },
      'GRIND20': { code: 'GRIND20', discount: 20, type: 'percentage', minAmount: 3000 }
    };
    return coupons[code.toUpperCase()] || null;
  },

  async createOrder(orderData: any): Promise<Order> {
    await delay(1500);
    return {
      id: Math.random().toString(36).substr(2, 9),
      userId: '1',
      items: orderData.items,
      total: orderData.total,
      status: 'pending',
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
};
