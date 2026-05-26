import { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X, Bell, Heart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { Badge } from '../components/ui/badge';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const navigation = [
    { name: 'New Arrivals', href: '/products?sort=newest' },
    { name: 'Men', href: '/products?category=men' },
    { name: 'Women', href: '/products?category=women' },
    { name: 'Sale', href: '/products?sale=true' }
  ];

  return (
    <nav className="bg-white border-b border-grind-border sticky top-0 z-40 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <a href="/" className="flex items-center">
              <span className="text-2xl font-bold text-grind-black tracking-tight">
                GRIND BYTE
              </span>
            </a>

            <div className="hidden lg:flex items-center gap-6">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-grind-black hover:text-grind-blue transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Search size={20} />
            </button>

            {isAuthenticated && (
              <>
                <a
                  href="/wishlist"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block"
                >
                  <Heart size={20} />
                </a>

                <a
                  href="/notifications"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-grind-danger text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </a>
              </>
            )}

            <a
              href="/cart"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-grind-black text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </a>

            {isAuthenticated ? (
              <a
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User size={20} />
              </a>
            ) : (
              <a
                href="/login"
                className="px-4 py-2 bg-grind-black text-white rounded-lg hover:bg-grind-black/90 transition-colors text-sm font-medium"
              >
                Sign In
              </a>
            )}
          </div>
        </div>

        {searchOpen && (
          <div className="pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="search"
                placeholder="Search for products..."
                className="w-full pl-10 pr-4 py-3 border border-grind-border rounded-lg focus:outline-none focus:ring-2 focus:ring-grind-blue"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-grind-border bg-white">
          <div className="px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-4 py-2 text-base font-medium text-grind-black hover:bg-gray-100 rounded-lg transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
