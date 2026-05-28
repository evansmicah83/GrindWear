import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  short_description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  compare_price: z.number().optional(),
  cost_price: z.number().optional(),
  sku: z.string().optional(),
  category_id: z.string().uuid('Invalid category ID'),
  is_featured: z.boolean().optional(),
  is_new: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

export const addressSchema = z.object({
  label: z.string().optional(),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  county: z.string().min(1, 'County is required'),
  country: z.string().default('Kenya'),
  postal_code: z.string().optional(),
  is_default: z.boolean().optional(),
});

export const orderSchema = z.object({
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      variant_id: z.string().uuid().optional(),
      quantity: z.number().positive(),
    })
  ),
  shipping_address_id: z.string().uuid(),
  billing_address_id: z.string().uuid().optional(),
  delivery_method: z.enum(['standard', 'express', 'pickup']).optional(),
  payment_method: z.string().optional(),
});

export const couponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().positive('Value must be positive'),
  min_order_amount: z.number().optional(),
  max_discount: z.number().optional(),
  usage_limit: z.number().optional(),
  expires_at: z.string().datetime().optional(),
});

export const reviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().min(1).max(5),
  title: z.string().min(1),
  body: z.string().min(1),
});

export const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
