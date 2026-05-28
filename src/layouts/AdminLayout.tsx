import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Outlet, Navigate } from 'react-router';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, Star,
  Mail, Settings, Menu, Bell, LogOut,
  ChevronRight, Boxes, BarChart3, Check, X, User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { cn } from '../lib/utils';

const NAV = [
  { section: 'Overview', items: [{ label: 'Dashboard', icon: LayoutDashboard, path: '/admin' }] },
  { section: 'Catalog', items: [
    { label: 'Products', icon: Package, path: '/admin/products' },
    { label: 'Inventory', icon: Boxes, path: '/admin/inventory' },
  ]},
  { section: 'Sales', items: [
    { label: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
    { label: 'Customers', icon: Users, path: '/admin/customers' },
    { label: 'Coupons', icon: Tag, path: '/admin/coupons' },
  ]},
  { section: 'Content', items: [
    { label: 'Reviews', icon: Star, path: '/admin/reviews' },
    { label: 'Newsletter', icon: Mail, path: '/admin/newsletter' },
  ]},
  { section: 'Settings', items: [
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ]},
];

export function AdminLayout() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentLabel = NAV.flatMap(s => s.items).find(i => i.path === location.pathname)?.label || 'Admin';

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1117]">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-white/10', collapsed && 'justify-center px-2')}>
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <BarChart3 size={16} className="text-white" />
        </div>
        {!collapsed && <span className="text-white font-black text-lg tracking-tight">GRIND BYTE</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {NAV.map(section => (
          <div key={section.section}>
            {!collapsed && (
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-3 mb-1">{section.section}</p>
            )}
            {section.items.map(item => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setMobileOpen(false); }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer',
                    active ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/10',
                    collapsed && 'justify-center px-2'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  {!collapsed && item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className={cn('p-3 border-t border-white/10', collapsed && 'flex justify-center')}>
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/10 transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-white/40 text-xs truncate">{user?.email}</p>
            </div>
            <button onClick={logout} className="text-white/40 hover:text-white cursor-pointer" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={logout} className="text-white/40 hover:text-white cursor-pointer p-2" title="Logout">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col bg-[#0f1117] transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed top-0 left-0 bottom-0 w-60 bg-[#0f1117] z-50 flex flex-col lg:hidden">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-14 flex items-center gap-4 flex-shrink-0">
          <button onClick={() => { setCollapsed(c => !c); setMobileOpen(o => !o); }} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
            <Menu size={20} className="text-gray-600" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <span>Admin</span>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">{currentLabel}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Notifications bell */}
            <div className="relative">
              <button onClick={() => { setBellOpen(o => !o); setProfileOpen(false); }} className="relative p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <Bell size={18} className="text-gray-600" />
                {unreadCount > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>
              {bellOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                  <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <span className="font-bold text-gray-900 text-sm">Notifications {unreadCount > 0 && <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">{unreadCount}</span>}</span>
                      <div className="flex gap-2">
                        {unreadCount > 0 && <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline cursor-pointer">Mark all read</button>}
                        {notifications.length > 0 && <button onClick={clearAll} className="text-xs text-red-500 hover:underline cursor-pointer">Clear</button>}
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-8">No notifications</p>
                      ) : notifications.slice(0, 10).map(n => (
                        <div key={n.id} className={cn('flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0', !n.read && 'bg-blue-50/40')}>
                          <div className={cn('w-2 h-2 rounded-full mt-2 flex-shrink-0', n.read ? 'bg-gray-200' : 'bg-blue-500')} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
                            <p className="text-xs text-gray-500 truncate">{n.message}</p>
                          </div>
                          {!n.read && (
                            <button onClick={() => markAsRead(n.id)} className="p-1 hover:bg-gray-200 rounded cursor-pointer flex-shrink-0"><Check size={11} className="text-gray-500" /></button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div ref={profileRef} className="relative">
              <button
                onClick={() => { setProfileOpen(o => !o); setBellOpen(false); }}
                className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all">
                {user?.name?.[0]?.toUpperCase()}
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-11 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    {/* User info */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                          {user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-bold text-sm truncate">{user?.name}</p>
                          <p className="text-white/50 text-xs truncate">{user?.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-purple-500/30 text-purple-300 text-[10px] font-bold rounded-full uppercase tracking-wide">Admin</span>
                        </div>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="p-2">
                      <button
                        onClick={() => { navigate('/admin/settings'); setProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-left">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                          <User size={14} className="text-gray-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Account Settings</span>
                      </button>
                      <button
                        onClick={() => { logout(); navigate('/admin/login'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors cursor-pointer text-left">
                        <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                          <LogOut size={14} className="text-red-500" />
                        </div>
                        <span className="text-sm font-semibold text-red-600">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
