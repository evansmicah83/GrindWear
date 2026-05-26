import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';

const DB_PATH = path.join(__dirname, '../../db.json');

interface DB {
  users: User[];
  products: Product[];
  orders: Order[];
  messages: Message[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'user' | 'admin';
  avatar?: string;
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

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  content: string;
  createdAt: string;
  read: boolean;
}

function readDB(): DB {
  if (!fs.existsSync(DB_PATH)) {
    const initial: DB = { users: [], products: SEED_PRODUCTS, orders: [], messages: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDB(data: DB): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export const db = {
  // Users
  getUsers: () => readDB().users,
  getUserById: (id: string) => readDB().users.find(u => u.id === id),
  getUserByEmail: (email: string) => readDB().users.find(u => u.email === email),
  createUser: (data: Omit<User, 'id' | 'createdAt'>) => {
    const d = readDB();
    const user: User = { ...data, id: uuid(), createdAt: new Date().toISOString() };
    d.users.push(user);
    writeDB(d);
    return user;
  },

  // Products
  getProducts: () => readDB().products,
  getProductById: (id: string) => readDB().products.find(p => p.id === id),
  createProduct: (data: Omit<Product, 'id' | 'createdAt'>) => {
    const d = readDB();
    const product: Product = { ...data, id: uuid(), createdAt: new Date().toISOString() };
    d.products.push(product);
    writeDB(d);
    return product;
  },
  updateProduct: (id: string, data: Partial<Product>) => {
    const d = readDB();
    const idx = d.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    d.products[idx] = { ...d.products[idx], ...data };
    writeDB(d);
    return d.products[idx];
  },
  deleteProduct: (id: string) => {
    const d = readDB();
    d.products = d.products.filter(p => p.id !== id);
    writeDB(d);
  },

  // Orders
  getOrders: () => readDB().orders,
  getOrderById: (id: string) => readDB().orders.find(o => o.id === id),
  getOrdersByUser: (userId: string) => readDB().orders.filter(o => o.userId === userId),
  createOrder: (data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const d = readDB();
    const order: Order = { ...data, id: `ORD-${uuid().slice(0,8).toUpperCase()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    d.orders.push(order);
    writeDB(d);
    return order;
  },
  updateOrder: (id: string, data: Partial<Order>) => {
    const d = readDB();
    const idx = d.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    d.orders[idx] = { ...d.orders[idx], ...data, updatedAt: new Date().toISOString() };
    writeDB(d);
    return d.orders[idx];
  },

  // Messages
  getMessages: () => readDB().messages,
  createMessage: (data: Omit<Message, 'id' | 'createdAt'>) => {
    const d = readDB();
    const msg: Message = { ...data, id: uuid(), createdAt: new Date().toISOString() };
    d.messages.push(msg);
    writeDB(d);
    return msg;
  },
  markMessagesRead: (userId: string) => {
    const d = readDB();
    d.messages = d.messages.map(m => m.senderId !== userId ? { ...m, read: true } : m);
    writeDB(d);
  }
};

const SEED_PRODUCTS: Product[] = [
  { id: '1', name: 'Classic Black Hoodie', slug: 'classic-black-hoodie', description: 'Premium quality cotton hoodie with modern streetwear design', price: 8500, compareAtPrice: 10500, category: 'hoodies', images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800', 'https://images.unsplash.com/photo-1620799140188-3b2a7c2fb7e5?w=800'], sizes: ['XS','S','M','L','XL','XXL'], colors: ['Black','White','Gray'], tags: ['streetwear','casual','trending'], stock: 50, featured: true, trending: true, rating: 4.8, reviewCount: 127, createdAt: new Date().toISOString() },
  { id: '2', name: 'Urban Cargo Pants', slug: 'urban-cargo-pants', description: 'Comfortable cargo pants with multiple pockets', price: 9500, category: 'pants', images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800'], sizes: ['28','30','32','34','36'], colors: ['Black','Khaki','Olive'], tags: ['cargo','streetwear'], stock: 35, featured: true, trending: false, rating: 4.6, reviewCount: 89, createdAt: new Date().toISOString() },
  { id: '3', name: 'Grind Byte Logo Tee', slug: 'grind-byte-logo-tee', description: 'Signature GRIND BYTE t-shirt with embroidered logo', price: 4200, compareAtPrice: 5200, category: 'tshirts', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'], sizes: ['XS','S','M','L','XL'], colors: ['Black','White','Navy'], tags: ['basics','logo','bestseller'], stock: 100, featured: true, trending: true, rating: 4.9, reviewCount: 245, createdAt: new Date().toISOString() },
  { id: '4', name: 'Premium Denim Jacket', slug: 'premium-denim-jacket', description: 'Classic denim jacket with modern fit', price: 13500, category: 'jackets', images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'], sizes: ['S','M','L','XL'], colors: ['Blue','Black'], tags: ['denim','classic'], stock: 25, featured: false, trending: true, rating: 4.7, reviewCount: 156, createdAt: new Date().toISOString() },
  { id: '5', name: 'Essential Joggers', slug: 'essential-joggers', description: 'Comfortable joggers for everyday wear', price: 6200, category: 'pants', images: ['https://images.unsplash.com/photo-1618517351616-38fb9c5210c6?w=800'], sizes: ['XS','S','M','L','XL'], colors: ['Black','Gray','Navy'], tags: ['comfort','casual'], stock: 75, featured: false, trending: false, rating: 4.5, reviewCount: 98, createdAt: new Date().toISOString() },
  { id: '6', name: 'Oversized Sweatshirt', slug: 'oversized-sweatshirt', description: 'Trendy oversized fit sweatshirt', price: 7300, category: 'hoodies', images: ['https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800'], sizes: ['S','M','L','XL'], colors: ['Beige','Black','White'], tags: ['oversized','trending'], stock: 40, featured: true, trending: true, rating: 4.8, reviewCount: 203, createdAt: new Date().toISOString() }
];
