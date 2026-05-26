import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, User, Menu, X, Bell, Heart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { motion, AnimatePresence } from 'motion/react';

const navigation = [
  { name: 'New Arrivals', href: '/products?sort=newest' },
  { name: 'Men', href: '/products?category=men' },
  { name: 'Women', href: '/products?category=women' },
  { name: 'Sale', href: '/products?sale=true', badge: 'HOT' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const { itemCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 100);
  }, [searchOpen]);

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: scrolled ? 'rgba(255,255,255,0.97)' : '#fff',
        borderBottom: '1px solid #f3f4f6',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.06)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

            {/* Left */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <button
                className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>

              <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#111' }}>GRIND</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#2563eb' }}>BYTE</span>
              </a>

              <div className="hidden lg:flex items-center gap-1">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 500, color: '#374151', transition: 'all 0.15s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#eff6ff'; (e.currentTarget as HTMLElement).style.color = '#2563eb'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#374151'; }}
                  >
                    {item.name}
                    {item.badge && (
                      <span style={{ fontSize: '0.6rem', fontWeight: 700, backgroundColor: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: '999px', letterSpacing: '0.05em' }}>
                        {item.badge}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ position: 'relative' }}>
                      <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={16} />
                      <input
                        ref={searchRef}
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        style={{ width: '100%', paddingLeft: '34px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.8125rem', outline: 'none', backgroundColor: '#f9fafb' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && searchQuery) window.location.href = `/products?search=${searchQuery}`;
                          if (e.key === 'Escape') setSearchOpen(false);
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                {searchOpen ? <X size={20} style={{ color: '#374151' }} /> : <Search size={20} style={{ color: '#374151' }} />}
              </button>

              {isAuthenticated && (
                <>
                  <a href="/wishlist" className="hidden sm:flex p-2 rounded-xl hover:bg-gray-100 transition-colors" aria-label="Wishlist">
                    <Heart size={20} style={{ color: '#374151' }} />
                  </a>
                  <a href="/notifications" className="p-2 rounded-xl hover:bg-gray-100 transition-colors" style={{ position: 'relative' }} aria-label="Notifications">
                    <Bell size={20} style={{ color: '#374151' }} />
                    {unreadCount > 0 && (
                      <motion.span key={unreadCount} initial={{ scale: 0 }} animate={{ scale: 1 }}
                        style={{ position: 'absolute', top: '4px', right: '4px', minWidth: '16px', height: '16px', backgroundColor: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: 700, borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </a>
                </>
              )}

              <a href="/cart" className="p-2 rounded-xl hover:bg-gray-100 transition-colors" style={{ position: 'relative' }} aria-label="Cart">
                <ShoppingCart size={20} style={{ color: '#374151' }} />
                {itemCount > 0 && (
                  <motion.span key={itemCount} initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{ position: 'absolute', top: '4px', right: '4px', minWidth: '16px', height: '16px', backgroundColor: '#111', color: '#fff', fontSize: '0.6rem', fontWeight: 700, borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                )}
              </a>

              {isAuthenticated ? (
                <a href="/dashboard" className="ml-1 p-1 rounded-xl hover:bg-gray-100 transition-colors" aria-label="Account">
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                </a>
              ) : (
                <a
                  href="/login"
                  style={{ textDecoration: 'none', marginLeft: '6px', padding: '8px 18px', backgroundColor: '#111', color: '#fff', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600, transition: 'opacity 0.15s' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
                >
                  Sign In
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div style={{ height: '64px' }} />

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: '280px', backgroundColor: '#fff', zIndex: 51, display: 'flex', flexDirection: 'column', boxShadow: '4px 0 24px rgba(0,0,0,0.12)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #f3f4f6' }}>
                <span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#111', letterSpacing: '-0.04em' }}>GRIND</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#2563eb', letterSpacing: '-0.04em' }}>BYTE</span>
                </span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9375rem', fontWeight: 500, color: '#111', marginBottom: '2px' }}
                    className="hover:bg-blue-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                    {item.badge && (
                      <span style={{ fontSize: '0.6rem', fontWeight: 700, backgroundColor: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: '999px' }}>
                        {item.badge}
                      </span>
                    )}
                  </a>
                ))}
              </div>

              <div style={{ padding: '16px', borderTop: '1px solid #f3f4f6' }}>
                {isAuthenticated ? (
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    style={{ width: '100%', padding: '12px', fontSize: '0.875rem', fontWeight: 500, color: '#ef4444', backgroundColor: 'transparent', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
                    className="hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                ) : (
                  <a
                    href="/login"
                    style={{ textDecoration: 'none', display: 'block', padding: '12px', backgroundColor: '#111', color: '#fff', borderRadius: '12px', fontSize: '0.9375rem', fontWeight: 600, textAlign: 'center' }}
                  >
                    Sign In
                  </a>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
