import { createContext, useContext, ReactNode } from 'react';
import { useCartStore } from '../stores/cartStore';
import type { CartItem, Product, Coupon } from '../types';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  coupon: Coupon | null;
  addItem: (product: Product, size: string, color: string, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  isInCart: (productId: string, size: string, color: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const store = useCartStore();

  const value: CartContextType = {
    items: store.items,
    coupon: store.coupon,
    itemCount: store.itemCount(),
    subtotal: store.subtotal(),
    discount: store.discount(),
    shipping: store.shipping(),
    total: store.total(),
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    applyCoupon: store.applyCoupon,
    removeCoupon: store.removeCoupon,
    isInCart: store.isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
