import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AppProvider } from './contexts/AppProvider';
import { socketService } from './services/socketService';
import { Toaster } from 'sonner';

import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { LoginPage } from './pages/LoginPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';

export default function App() {
  useEffect(() => {
    socketService.connect();
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" richColors closeButton />
      </AppProvider>
    </BrowserRouter>
  );
}