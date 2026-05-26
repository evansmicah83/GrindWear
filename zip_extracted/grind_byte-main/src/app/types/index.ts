export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  subcategory?: string;
  images: string[];
  sizes: string[];
  colors: string[];
  tags: string[];
  stock: number;
  featured: boolean;
  trending: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface CartItem {
  id: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface Notification {
  id: string;
  type: 'order' | 'message' | 'product' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
}

export interface WishlistItem {
  id: string;
  product: Product;
  addedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
}

export interface Coupon {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minAmount?: number;
  expiresAt?: string;
}
