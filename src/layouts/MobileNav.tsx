import { useLocation, useNavigate } from 'react-router';
import { Home, ShoppingBag, Heart, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useUIStore } from '../stores/uiStore';
import { cn } from '../lib/utils';

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const { setCartDrawer } = useUIStore();

  const path = location.pathname;

  const items = [
    { icon: Home, label: 'Home', action: () => navigate('/'), active: path === '/' },
    { icon: ShoppingBag, label: 'Shop', action: () => navigate('/products'), active: path === '/products' },
    {
      icon: ShoppingCart, label: 'Cart', action: () => setCartDrawer(true), active: false,
      badge: itemCount > 0 ? (itemCount > 9 ? '9+' : String(itemCount)) : null,
    },
    { icon: Heart, label: 'Wishlist', action: () => navigate('/account/wishlist'), active: path === '/account/wishlist' },
    {
      icon: User, label: isAuthenticated ? 'Account' : 'Sign In',
      action: () => navigate(isAuthenticated ? '/account' : '/login'),
      active: path.startsWith('/account') || path === '/login',
    },
  ];

  // Hide on admin pages
  if (path.startsWith('/admin')) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden">
      <div className="bg-white border-t border-gray-200 shadow-2xl">
        <div className="flex items-center justify-around px-1 py-1 pb-safe">
          {items.map(item => (
            <button
              key={item.label}
              onClick={item.action}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-all cursor-pointer',
                item.active ? 'text-grind-black' : 'text-gray-400'
              )}
            >
              <div className="relative">
                <item.icon
                  size={20}
                  className={cn('transition-all', item.active ? 'stroke-[2.5px]' : 'stroke-[1.8px]')}
                />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-grind-blue text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[11px] font-semibold leading-none transition-all',
                item.active ? 'text-grind-black' : 'text-gray-400'
              )}>
                {item.label}
              </span>
              {item.active && <div className="w-1 h-1 rounded-full bg-grind-black" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
