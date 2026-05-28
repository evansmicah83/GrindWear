import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, Coupon } from '../types';

interface CartStore {
  items: CartItem[];
  coupon: Coupon | null;
  addItem: (product: Product, size: string, color: string, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  isInCart: (productId: string, size: string, color: string) => boolean;
  itemCount: () => number;
  subtotal: () => number;
  discount: () => number;
  shipping: () => number;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

      addItem: (product, size, color, quantity = 1) => {
        set(state => {
          const existing = state.items.find(
            i => i.product.id === product.id && i.size === size && i.color === color
          );
          if (existing) {
            return {
              items: state.items.map(i =>
                i.id === existing.id ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { id: `${product.id}-${size}-${color}-${Date.now()}`, product, size, color, quantity },
            ],
          };
        });
      },

      removeItem: (itemId) => set(state => ({ items: state.items.filter(i => i.id !== itemId) })),

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) { get().removeItem(itemId); return; }
        set(state => ({ items: state.items.map(i => i.id === itemId ? { ...i, quantity } : i) }));
      },

      clearCart: () => set({ items: [], coupon: null }),

      applyCoupon: (coupon) => set({ coupon }),

      removeCoupon: () => set({ coupon: null }),

      isInCart: (productId, size, color) =>
        get().items.some(i => i.product.id === productId && i.size === size && i.color === color),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

      discount: () => {
        const { coupon } = get();
        if (!coupon) return 0;
        const sub = get().subtotal();
        return coupon.type === 'percentage'
          ? sub * (coupon.discount / 100)
          : coupon.discount;
      },

      shipping: () => {
        const sub = get().subtotal();
        return sub >= 2500 ? 0 : 300;
      },

      total: () => {
        const { subtotal, discount, shipping } = get();
        return subtotal() - discount() + shipping();
      },
    }),
    { name: 'grind-cart' }
  )
);
