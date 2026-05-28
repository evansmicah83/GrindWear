import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { LayoutDashboard, Package, User, MapPin, Heart, LogOut, Moon, Sun, ChevronRight } from 'lucide-react';
import { MainLayout } from '../../layouts/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

const TABS = [
  { label: 'Dashboard', href: '/account', icon: LayoutDashboard },
  { label: 'My Orders', href: '/account/orders', icon: Package },
  { label: 'Profile & Settings', href: '/account/profile', icon: User },
  { label: 'Addresses', href: '/account/addresses', icon: MapPin },
  { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
];

export function AccountLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [dark, setDark] = useState(() => localStorage.getItem('grind-theme') === 'dark');

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) navigate('/login', { state: { from: location.pathname } });
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('grind-theme', dark ? 'dark' : 'light');
  }, [dark]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
    </div>
  );

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden sticky top-24">

              {/* User card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-black flex-shrink-0 shadow-lg">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-white/50 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav className="p-3 space-y-0.5">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  const active = location.pathname === tab.href;
                  return (
                    <Link key={tab.href} to={tab.href}
                      className={cn(
                        'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all no-underline group',
                        active ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className={active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} />
                        {tab.label}
                      </div>
                      {active && <ChevronRight size={14} className="text-white/50" />}
                    </Link>
                  );
                })}
              </nav>

              {/* Dark mode + logout */}
              <div className="p-3 border-t border-gray-100 space-y-0.5">
                <button
                  onClick={() => setDark(d => !d)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {dark ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-gray-400" />}
                    {dark ? 'Light Mode' : 'Dark Mode'}
                  </div>
                  <div className={cn('w-9 h-5 rounded-full transition-colors relative', dark ? 'bg-gray-900' : 'bg-gray-200')}>
                    <div className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', dark ? 'translate-x-4' : 'translate-x-0.5')} />
                  </div>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </MainLayout>
  );
}
