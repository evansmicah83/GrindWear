import { create } from 'zustand';

interface UIStore {
  cartDrawerOpen: boolean;
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  sizeGuideOpen: boolean;
  notificationsOpen: boolean;
  setCartDrawer: (open: boolean) => void;
  setMobileMenu: (open: boolean) => void;
  setSearch: (open: boolean) => void;
  setSizeGuide: (open: boolean) => void;
  setNotifications: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  cartDrawerOpen: false,
  mobileMenuOpen: false,
  searchOpen: false,
  sizeGuideOpen: false,
  notificationsOpen: false,
  setCartDrawer: (open) => set({ cartDrawerOpen: open }),
  setMobileMenu: (open) => set({ mobileMenuOpen: open }),
  setSearch: (open) => set({ searchOpen: open }),
  setSizeGuide: (open) => set({ sizeGuideOpen: open }),
  setNotifications: (open) => set({ notificationsOpen: open }),
}));
