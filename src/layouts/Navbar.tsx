import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { Search, ShoppingCart, Menu, X, Heart, Bell, LogOut, Moon, Sun, ShieldCheck, Check, Trash2, Package, MessageCircle, ShoppingBag, BellRing } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useUIStore } from '../stores/uiStore';
import { useNotifications } from '../contexts/NotificationsContext';
import { normalizeImageSource, formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const NAV_LINKS = [
  { name: 'New Arrivals', href: '/products?filter=new' },
  { name: 'Shop All', href: '/products' },
  { name: 'Collections', href: '/products?category=collection' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('grind-theme') === 'dark');
  const searchRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  const { itemCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
  const { mobileMenuOpen, searchOpen, setCartDrawer, setMobileMenu, setSearch, setNotifications } = useUIStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('grind-theme', dark ? 'dark' : 'light');
  }, [dark]);

  // Close menus on route change
  useEffect(() => {
    setProfileOpen(false);
    setBellOpen(false);
    setMobileMenu(false);
    setSearch(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearch(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  const transparent = isHome && !scrolled;
  const iconCls = transparent ? 'text-white hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100';

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${transparent ? 'bg-transparent' : 'bg-white border-b border-gray-200 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Left */}
            <div className="flex items-center gap-6">
              <button className="lg:hidden p-2 -ml-1 rounded-lg transition-colors cursor-pointer" onClick={() => setMobileMenu(true)}>
                <Menu size={22} className={transparent ? 'text-white' : 'text-grind-black'} />
              </button>
              <Link to="/" className="flex items-center gap-3 no-underline">
                <span className={`text-2xl font-black tracking-tight transition-colors ${transparent ? 'text-white' : 'text-grind-black'}`}>GRIND BYTE</span>
                <span className={`hidden sm:inline-block text-[11px] uppercase tracking-[0.4em] transition-colors ${transparent ? 'text-white/60' : 'text-gray-400'}`}>Premium Streetwear</span>
              </Link>
              <div className="hidden lg:flex items-center gap-1">
                {NAV_LINKS.map(item => (
                  <Link key={item.name} to={item.href}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors no-underline ${transparent ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-grind-black hover:bg-gray-100'}`}>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1">
              <button onClick={() => setSearch(!searchOpen)} className={`p-2 rounded-lg transition-colors cursor-pointer ${iconCls}`}><Search size={20} /></button>

              {isAuthenticated && (
                <Link to="/wishlist" className={`hidden sm:flex p-2 rounded-lg transition-colors ${iconCls}`}><Heart size={20} /></Link>
              )}

              {isAuthenticated && (
                <div ref={bellRef} className="relative">
                  <button onClick={() => { setBellOpen(o => !o); setProfileOpen(false); }} className={`relative p-2 rounded-lg transition-colors cursor-pointer ${iconCls}`}>
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                  </button>

                  <AnimatePresence>
                    {bellOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">Notifications</span>
                            {unreadCount > 0 && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[11px] font-bold rounded-full">{unreadCount}</span>}
                          </div>
                          <div className="flex gap-2">
                            {unreadCount > 0 && <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline cursor-pointer">Mark all read</button>}
                            {notifications.length > 0 && <button onClick={clearAll} className="text-xs text-red-500 hover:underline cursor-pointer">Clear</button>}
                          </div>
                        </div>

                        {/* List */}
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                              <BellRing size={32} className="text-gray-200 mb-2" />
                              <p className="text-sm font-semibold text-gray-400">All caught up!</p>
                            </div>
                          ) : notifications.slice(0, 15).map(n => {
                            const Icon = { order: Package, message: MessageCircle, product: ShoppingBag }[n.type as string] || Bell;
                            const color = { order: 'bg-blue-100 text-blue-600', message: 'bg-green-100 text-green-600', product: 'bg-purple-100 text-purple-600' }[n.type as string] || 'bg-gray-100 text-gray-600';
                            return (
                              <div
                                key={n.id}
                                onClick={() => { markAsRead(n.id); if (n.link) { navigate(n.link); setBellOpen(false); } }}
                                className={cn('flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors', n.link ? 'cursor-pointer hover:bg-gray-50' : '', !n.read ? 'bg-blue-50/40' : '')}
                              >
                                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5', color)}>
                                  <Icon size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={cn('text-sm text-gray-900 leading-snug', !n.read ? 'font-bold' : 'font-semibold')}>{n.title}</p>
                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                                  <p className="text-[11px] text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
                                </div>
                                <div className="flex flex-col gap-0.5 flex-shrink-0">
                                  {!n.read && (
                                    <button onClick={e => { e.stopPropagation(); markAsRead(n.id); }} className="p-1 rounded-lg hover:bg-blue-100 text-blue-400 cursor-pointer"><Check size={11} /></button>
                                  )}
                                  <button onClick={e => { e.stopPropagation(); deleteNotification(n.id); }} className="p-1 rounded-lg hover:bg-red-100 text-gray-300 hover:text-red-400 cursor-pointer"><Trash2 size={11} /></button>
                                </div>
                                {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-2" />}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <button onClick={() => setCartDrawer(true)} className={`relative p-2 rounded-lg transition-colors cursor-pointer ${iconCls}`}>
                <ShoppingCart size={20} />
                {itemCount > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-grind-blue text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">{itemCount > 9 ? '9+' : itemCount}</span>}
              </button>

              {isAuthenticated ? (
                <div ref={profileRef} className="relative">
                  <button onClick={() => { setProfileOpen(o => !o); setBellOpen(false); }} className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors cursor-pointer ${transparent ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                    {user?.avatar
                      ? <img src={normalizeImageSource(user.avatar)} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20" />
                      : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</div>
                    }
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-5 py-4">
                          <div className="flex items-center gap-3">
                            {user?.avatar
                              ? <img src={normalizeImageSource(user.avatar)} alt={user.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-white/20" />
                              : <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-base font-black">{user?.name?.[0]?.toUpperCase()}</div>
                            }
                            <div className="min-w-0">
                              <p className="text-white font-bold text-sm truncate">{user?.name}</p>
                              <p className="text-white/50 text-xs truncate">{user?.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-2">
                          {[['My Account', '/account'], ['My Orders', '/account/orders'], ['Wishlist', '/account/wishlist']].map(([label, href]) => (
                            <Link key={href} to={href} onClick={() => setProfileOpen(false)}
                              className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 no-underline">
                              {label}
                            </Link>
                          ))}
                        </div>

                        <div className="p-2 border-t border-gray-100">
                          <button onClick={() => setDark(d => !d)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                                {dark ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-gray-500" />}
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{dark ? 'Light Mode' : 'Dark Mode'}</span>
                            </div>
                            <div className={`w-10 h-5 rounded-full transition-colors relative ${dark ? 'bg-gray-900' : 'bg-gray-200'}`}>
                              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${dark ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </div>
                          </button>

                          {user?.role === 'admin' && (
                            <Link to="/admin" onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-50 transition-colors no-underline">
                              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                                <ShieldCheck size={16} className="text-purple-600" />
                              </div>
                              <span className="text-sm font-semibold text-purple-700">Admin Dashboard</span>
                            </Link>
                          )}

                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors cursor-pointer">
                            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                              <LogOut size={16} className="text-red-500" />
                            </div>
                            <span className="text-sm font-semibold text-red-600">Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className={`ml-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all no-underline ${transparent ? 'bg-white text-grind-black hover:bg-white/90' : 'bg-grind-black text-white hover:bg-grind-black/90'}`}>
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Search bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden pb-3">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input ref={searchRef} type="search" placeholder="Search products, categories..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-grind-border rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-grind-blue focus:bg-white transition-all" />
                  <button type="button" onClick={() => setSearch(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"><X size={16} /></button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setMobileMenu(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 flex flex-col shadow-2xl lg:hidden">
              <div className="flex items-center justify-between p-5 border-b border-grind-border">
                <span className="text-xl font-black text-grind-black">GRIND BYTE</span>
                <button onClick={() => setMobileMenu(false)} className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"><X size={20} /></button>
              </div>
              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {NAV_LINKS.map(item => (
                  <Link key={item.name} to={item.href} onClick={() => setMobileMenu(false)}
                    className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-800 hover:bg-gray-100 transition-colors no-underline">
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t border-grind-border mt-4">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 mb-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold">{user?.name?.[0]?.toUpperCase()}</div>
                        <div><p className="text-sm font-bold text-gray-900">{user?.name}</p><p className="text-xs text-gray-500">{user?.email}</p></div>
                      </div>
                      {[['My Account', '/account'], ['My Orders', '/account/orders'], ['Wishlist', '/account/wishlist']].map(([label, href]) => (
                        <Link key={href} to={href} onClick={() => setMobileMenu(false)}
                          className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 no-underline">{label}</Link>
                      ))}
                      <button onClick={() => { logout(); setMobileMenu(false); navigate('/'); }} className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 cursor-pointer mt-1">
                        <LogOut size={16} className="mr-3" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setMobileMenu(false)} className="block text-center px-4 py-3 bg-grind-black text-white rounded-xl text-sm font-semibold no-underline">Sign In</Link>
                  )}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
