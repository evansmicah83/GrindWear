import { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X, Bell, Heart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';

const navigation = [
  { name: 'New Arrivals', href: '/products?sort=newest' },
  { name: 'Men', href: '/products?category=men' },
  { name: 'Women', href: '/products?category=women' },
  { name: 'Sale', href: '/products?sale=true', badge: 'HOT' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <nav style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: hamburger + logo + desktop nav */}
          <div className="flex items-center gap-6">
            <button
              className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <a href="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#111', letterSpacing: '-0.03em' }}>
                GRIND BYTE
              </span>
            </a>

            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  style={{ textDecoration: 'none' }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {item.name}
                  {item.badge && (
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, backgroundColor: '#ef4444', color: '#fff', padding: '1px 5px', borderRadius: '4px', letterSpacing: '0.05em' }}>
                      {item.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Search"
            >
              <Search size={20} className="text-gray-700" />
            </button>

            {isAuthenticated && (
              <>
                <a href="/wishlist" className="hidden sm:flex p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Wishlist">
                  <Heart size={20} className="text-gray-700" />
                </a>
                <a href="/notifications" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Notifications">
                  <Bell size={20} className="text-gray-700" />
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '4px', right: '4px', minWidth: '18px', height: '18px', backgroundColor: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 700, borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </a>
              </>
            )}

            <a href="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Cart">
              <ShoppingCart size={20} className="text-gray-700" />
              {itemCount > 0 && (
                <span style={{ position: 'absolute', top: '4px', right: '4px', minWidth: '18px', height: '18px', backgroundColor: '#111', color: '#fff', fontSize: '0.65rem', fontWeight: 700, borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </a>

            {isAuthenticated ? (
              <a href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Account">
                <User size={20} className="text-gray-700" />
              </a>
            ) : (
              <a
                href="/login"
                style={{ textDecoration: 'none', marginLeft: '4px', padding: '8px 16px', backgroundColor: '#111', color: '#fff', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}
                className="hover:opacity-90 transition-opacity"
              >
                Sign In
              </a>
            )}
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div style={{ paddingBottom: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={18} />
              <input
                type="search"
                placeholder="Search products, categories..."
                autoFocus
                style={{ width: '100%', paddingLeft: '40px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', outline: 'none', backgroundColor: '#f9fafb' }}
                onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ borderTop: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
          <div style={{ padding: '8px 16px 16px' }}>
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '10px', fontSize: '0.9375rem', fontWeight: 500, color: '#111' }}
                className="hover:bg-gray-100 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {item.name}
                {item.badge && (
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, backgroundColor: '#ef4444', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
            {!isAuthenticated && (
              <a
                href="/login"
                style={{ textDecoration: 'none', display: 'block', marginTop: '8px', padding: '12px 16px', backgroundColor: '#111', color: '#fff', borderRadius: '10px', fontSize: '0.9375rem', fontWeight: 600, textAlign: 'center' }}
              >
                Sign In
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
