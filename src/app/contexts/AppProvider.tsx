import { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { NotificationsProvider } from './NotificationsContext';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationsProvider>
          {children}
        </NotificationsProvider>
      </CartProvider>
    </AuthProvider>
  );
}
