import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ShoppingCart, User, Menu, X, Bell, Heart, Package, LogOut, LogIn, Zap, ChevronDown, Settings } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { motion, AnimatePresence } from 'motion/react';
import type { Product } from '../types';
import { mockApi } from '../services/mockApi';

const navigation = [
  { name: 'New Arrivals', href: '/products?sort=newest' },
  { name: 'Men', href: '/products?category=men' },
  { name: 'Women', href: '/products?category=women' },
  { name: 'Sale', href: '/products?sale=true', badge: 'HOT' },
];

const dropdownMenus = {
  shop: [
    { label: 'New Arrivals', href: '/products?sort=newest', icon: '✨' },
    { label: 'Best Sellers', href: '/products?sort=popular', icon: '⭐' },
    { label: 'Trending Now', href: '/products?sort=trending', icon: '🔥' },
  ],
  account: (isAuth: boolean) => [
    ...(isAuth ? [
      { label: 'My Dashboard', href: '/dashboard', icon: '📊' },
      { label: 'My Orders', href: '/orders', icon: '📦' },
      { label: 'Wishlist', href: '/wishlist', icon: '❤️' },
      { label: 'Settings', href: '/settings', icon: '⚙️' },
      { label: 'Sign Out', href: '#', icon: '🚪', action: 'logout' },
    ] : [
      { label: 'Sign In', href: '/login', icon: '🔓' },
      { label: 'Create Account', href: '/login?register=true', icon: '✍️' },
    ])
  ]
};

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    mockApi.searchProducts(searchQuery).then(results => {
      setSearchResults(results.slice(0, 4));
      setSearchLoading(false);
    }).catch(() => {
      setSearchLoading(false);
    });
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowAccountMenu(false);
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: scrolled ? 'rgba(255,255,255,0.98)' : '#fff',
        borderBottom: scrolled ? '1px solid #e5e7eb' : 'none',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        {/* Top Promo Bar */}
        <div style={{
          backgroundColor: '#0f172a',
          color: '#fff',
          fontSize: '0.75rem',
          padding: '8px 0',
          textAlign: 'center',
          fontWeight: 500
        }}>
          <Zap size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
          Free shipping on orders over KES 5,000 • Same-day Nairobi delivery
        </div>

        {/* Main Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

            {/* Left - Mobile Menu + Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <button
                className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>

              <a href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#111' }}>GRIND</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#2563eb' }}>BYTE</span>
                </div>
                <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: '#6b7280', fontWeight: 600 }}>STREETWEAR</span>
              </a>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 500, color: '#374151', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#eff6ff'; (e.currentTarget as HTMLElement).style.color = '#2563eb'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#374151'; }}
                  >
                    {item.name}
                    {item.badge && (
                      <span style={{ fontSize: '0.55rem', fontWeight: 700, backgroundColor: '#ef4444', color: '#fff', padding: '2px 5px', borderRadius: '4px', letterSpacing: '0.05em' }}>
                        {item.badge}
                      </span>
                    )}
                  </a>
                ))}

                {/* Trending Dropdown */}
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === 'trending' ? null : 'trending')}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 500, color: '#374151', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#eff6ff'; (e.currentTarget as HTMLElement).style.color = '#2563eb'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#374151'; }}
                  >
                    Explore <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: activeDropdown === 'trending' ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === 'trending' && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: '200px', zIndex: 100, border: '1px solid #f3f4f6' }}
                      >
                        {dropdownMenus.shop.map((item, i) => (
                          <a
                            key={i}
                            href={item.href}
                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', color: '#111', fontSize: '0.875rem', fontWeight: 500, borderBottom: i < dropdownMenus.shop.length - 1 ? '1px solid #f3f4f6' : 'none', transition: 'background-color 0.2s' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f9fafb'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                          >
                            <span style={{ fontSize: '1.125rem' }}>{item.icon}</span>
                            {item.label}
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Right - Search + Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Search Bar */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <AnimatePresence>
                  {searchOpen && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 280, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden', position: 'relative' }}
                    >
                      <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={16} />
                        <input
                          ref={searchRef}
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search products..."
                          style={{ width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.8125rem', outline: 'none', backgroundColor: '#f9fafb', transition: 'all 0.2s' }}
                          onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#2563eb'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                          onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && searchQuery) window.location.href = `/products?search=${searchQuery}`;
                            if (e.key === 'Escape') setSearchOpen(false);
                          }}
                        />
                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                          {searchQuery && (searchResults.length > 0 || searchLoading) && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px',
                                backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                maxHeight: '300px', overflowY: 'auto', zIndex: 100
                              }}
                            >
                              {searchLoading ? (
                                <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.8125rem', color: '#9ca3af' }}>Loading...</div>
                              ) : (
                                <>
                                  {searchResults.map((product) => (
                                    <a
                                      key={product.id}
                                      href={`/products?search=${searchQuery}`}
                                      style={{ textDecoration: 'none', display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid #f3f4f6', color: '#111', fontSize: '0.8125rem', transition: 'background-color 0.2s', cursor: 'pointer' }}
                                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f9fafb'; }}
                                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                                    >
                                      <img src={product.image} alt="" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                                      <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500 }}>{product.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>KES {product.price.toLocaleString()}</div>
                                      </div>
                                    </a>
                                  ))}
                                  {searchResults.length > 0 && (
                                    <a
                                      href={`/products?search=${searchQuery}`}
                                      style={{ textDecoration: 'none', display: 'block', padding: '10px 12px', textAlign: 'center', color: '#2563eb', fontSize: '0.8125rem', fontWeight: 600, backgroundColor: '#f9fafb', borderTop: '1px solid #f3f4f6' }}
                                    >
                                      View all results
                                    </a>
                                  )}
                                </>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
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
              </div>

              {/* Icons */}
              {isAuthenticated && (
                <>
                  <a href="/wishlist" className="hidden sm:flex p-2 rounded-xl hover:bg-gray-100 transition-colors" style={{ position: 'relative' }} aria-label="Wishlist">
                    <Heart size={20} style={{ color: '#374151' }} />
                  </a>
                  <a href="/orders" className="hidden sm:flex p-2 rounded-xl hover:bg-gray-100 transition-colors" style={{ position: 'relative' }} aria-label="Orders">
                    <Package size={20} style={{ color: '#374151' }} />
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

              {/* Account Menu */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="ml-1 p-1 rounded-xl hover:bg-gray-100 transition-colors"
                  aria-label="Account"
                >
                  {isAuthenticated ? (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  ) : (
                    <User size={20} style={{ color: '#374151' }} />
                  )}
                </button>

                <AnimatePresence>
                  {showAccountMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      style={{
                        position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                        backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        minWidth: '200px', zIndex: 100, border: '1px solid #f3f4f6'
                      }}
                    >
                      {isAuthenticated && (
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111' }}>{user?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{user?.email}</div>
                        </div>
                      )}

                      {dropdownMenus.account(isAuthenticated).map((item, i) => (
                        item.action === 'logout' ? (
                          <button
                            key={i}
                            onClick={handleLogout}
                            style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', color: '#111', fontSize: '0.875rem', fontWeight: 500, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderBottom: i < dropdownMenus.account(isAuthenticated).length - 1 ? '1px solid #f3f4f6' : 'none', transition: 'background-color 0.2s' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f9fafb'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                          >
                            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                            {item.label}
                          </button>
                        ) : (
                          <a
                            key={i}
                            href={item.href}
                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', color: '#111', fontSize: '0.875rem', fontWeight: 500, borderBottom: i < dropdownMenus.account(isAuthenticated).length - 1 ? '1px solid #f3f4f6' : 'none', transition: 'background-color 0.2s' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f9fafb'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                            onClick={() => setShowAccountMenu(false)}
                          >
                            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                            {item.label}
                          </a>
                        )
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div style={{ height: '88px' }} />

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
              style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: '100%', maxWidth: '320px', backgroundColor: '#fff', zIndex: 51, display: 'flex', flexDirection: 'column', boxShadow: '4px 0 24px rgba(0,0,0,0.12)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #f3f4f6' }}>
                <a href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '2px' }} onClick={() => setMobileMenuOpen(false)}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#111', letterSpacing: '-0.04em' }}>GRIND</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#2563eb', letterSpacing: '-0.04em' }}>BYTE</span>
                  </div>
                </a>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9375rem', fontWeight: 500, color: '#111', marginBottom: '4px' }}
                    className="hover:bg-blue-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                    {item.badge && (
                      <span style={{ fontSize: '0.6rem', fontWeight: 700, backgroundColor: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
                        {item.badge}
                      </span>
                    )}
                  </a>
                ))}

                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Explore</div>
                  {dropdownMenus.shop.map((item, i) => (
                    <a
                      key={i}
                      href={item.href}
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', color: '#111', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px', borderRadius: '8px' }}
                      className="hover:bg-blue-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>

              <div style={{ padding: '16px', borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {isAuthenticated ? (
                  <>
                    <a
                      href="/dashboard"
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', color: '#111', fontSize: '0.875rem', fontWeight: 500, backgroundColor: '#f9fafb', borderRadius: '10px' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>👤</span>
                      {user?.name}
                    </a>
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      style={{ width: '100%', padding: '10px', fontSize: '0.875rem', fontWeight: 500, color: '#ef4444', backgroundColor: 'transparent', border: '1px solid #fee2e2', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}
                      className="hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href="/login"
                      style={{ textDecoration: 'none', display: 'block', padding: '10px', backgroundColor: '#111', color: '#fff', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </a>
                    <a
                      href="/login?register=true"
                      style={{ textDecoration: 'none', display: 'block', padding: '10px', backgroundColor: '#f9fafb', color: '#111', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center', border: '1px solid #e5e7eb' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Create Account
                    </a>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
