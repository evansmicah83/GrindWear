import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router';
import { useEffect } from 'react';
import { AppProvider } from './contexts/AppProvider';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PageProgress } from './components/PageProgress';

const HomePage             = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const ProductsPage         = lazy(() => import('./pages/ProductsPage').then(m => ({ default: m.ProductsPage })));
const ProductDetailPage    = lazy(() => import('./pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const LoginPage            = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const CartPage             = lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage         = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderConfirmationPage= lazy(() => import('./pages/OrderConfirmationPage').then(m => ({ default: m.OrderConfirmationPage })));
const DashboardPage        = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const OrdersPage           = lazy(() => import('./pages/OrdersPage').then(m => ({ default: m.OrdersPage })));
const WishlistPage         = lazy(() => import('./pages/WishlistPage').then(m => ({ default: m.WishlistPage })));
const AboutPage            = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage          = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));

const AccountDashboard     = lazy(() => import('./pages/account/AccountDashboard').then(m => ({ default: m.AccountDashboard })));
const AccountOrders        = lazy(() => import('./pages/account/AccountOrders').then(m => ({ default: m.AccountOrders })));
const AccountProfile       = lazy(() => import('./pages/account/AccountProfile').then(m => ({ default: m.AccountProfile })));
const AccountAddresses     = lazy(() => import('./pages/account/AccountAddresses').then(m => ({ default: m.AccountAddresses })));
const AccountWishlist      = lazy(() => import('./pages/account/AccountWishlist').then(m => ({ default: m.AccountWishlist })));

const AdminLayout          = lazy(() => import('./layouts/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminLoginPage       = lazy(() => import('./pages/admin/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminDashboard       = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts        = lazy(() => import('./pages/admin/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminProductForm     = lazy(() => import('./pages/admin/AdminProductForm').then(m => ({ default: m.AdminProductForm })));
const AdminOrders          = lazy(() => import('./pages/admin/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminCustomers       = lazy(() => import('./pages/admin/AdminCustomers').then(m => ({ default: m.AdminCustomers })));
const AdminCoupons         = lazy(() => import('./pages/admin/AdminCoupons').then(m => ({ default: m.AdminCoupons })));
const AdminOrderDetail     = lazy(() => import('./pages/admin/AdminOrderDetail').then(m => ({ default: m.AdminOrderDetail })));
const AdminInventory       = lazy(() => import('./pages/admin/AdminPlaceholders').then(m => ({ default: m.AdminInventory })));
const AdminReviews         = lazy(() => import('./pages/admin/AdminReviews').then(m => ({ default: m.AdminReviews })));
const AdminNewsletter      = lazy(() => import('./pages/admin/AdminPlaceholders').then(m => ({ default: m.AdminNewsletter })));
const AdminSettings        = lazy(() => import('./pages/admin/AdminPlaceholders').then(m => ({ default: m.AdminSettings })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-grind-blue rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppProvider>
          <ScrollToTop />
          <PageProgress />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
              <Route path="/products" element={<ErrorBoundary><ProductsPage /></ErrorBoundary>} />
              <Route path="/products/:id" element={<ErrorBoundary><ProductDetailPage /></ErrorBoundary>} />
              <Route path="/shop" element={<ErrorBoundary><ProductsPage /></ErrorBoundary>} />
              <Route path="/login" element={<ErrorBoundary><LoginPage /></ErrorBoundary>} />
              <Route path="/cart" element={<ErrorBoundary><CartPage /></ErrorBoundary>} />
              <Route path="/checkout" element={<ErrorBoundary><CheckoutPage /></ErrorBoundary>} />
              <Route path="/order-confirmation" element={<ErrorBoundary><OrderConfirmationPage /></ErrorBoundary>} />
              <Route path="/notifications" element={<Navigate to="/" replace />} />
              <Route path="/dashboard" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
              <Route path="/orders" element={<ErrorBoundary><OrdersPage /></ErrorBoundary>} />
              <Route path="/wishlist" element={<ErrorBoundary><WishlistPage /></ErrorBoundary>} />
              <Route path="/about" element={<ErrorBoundary><AboutPage /></ErrorBoundary>} />
              <Route path="/contact" element={<ErrorBoundary><ContactPage /></ErrorBoundary>} />

              <Route path="/account" element={<ErrorBoundary><AccountDashboard /></ErrorBoundary>} />
              <Route path="/account/orders" element={<ErrorBoundary><AccountOrders /></ErrorBoundary>} />
              <Route path="/account/profile" element={<ErrorBoundary><AccountProfile /></ErrorBoundary>} />
              <Route path="/account/addresses" element={<ErrorBoundary><AccountAddresses /></ErrorBoundary>} />
              <Route path="/account/wishlist" element={<ErrorBoundary><AccountWishlist /></ErrorBoundary>} />

              <Route path="/admin/login" element={<ErrorBoundary><AdminLoginPage /></ErrorBoundary>} />
              <Route path="/admin" element={<ErrorBoundary><AdminLayout /></ErrorBoundary>}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/new" element={<AdminProductForm />} />
                <Route path="products/:id/edit" element={<AdminProductForm />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/:id" element={<AdminOrderDetail />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="newsletter" element={<AdminNewsletter />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <Toaster position="top-right" richColors closeButton toastOptions={{ duration: 4000 }} />
        </AppProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
