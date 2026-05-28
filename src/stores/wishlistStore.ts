import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, WishlistItem } from '../types';
import { api } from '../services/api';

interface WishlistStore {
  items: WishlistItem[];
  hydrated: boolean;
  toggle: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  removeItem: (productId: string) => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,

      toggle: async (product) => {
        const exists = get().items.find(i => i.product.id === product.id);
        if (exists) {
          set(state => ({ items: state.items.filter(i => i.product.id !== product.id) }));
        } else {
          set(state => ({
            items: [...state.items, { id: `wl-${product.id}`, product, addedAt: new Date().toISOString() }],
          }));
        }
      },

      isInWishlist: (productId) => get().items.some(i => i.product.id === productId),

      removeItem: (productId) =>
        set(state => ({ items: state.items.filter(i => i.product.id !== productId) })),

      setHydrated: (hydrated) => set({ hydrated }),
    }),
    { name: 'grind-wishlist' }
  )
);
