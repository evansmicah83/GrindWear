import { Home, ShoppingBag, User, Heart, Menu } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export function MobileNav() {
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const currentPath = window.location.pathname;

  const navItems = [
    { icon: Home, label: 'Home', href: '/', active: currentPath === '/' },
    { icon: ShoppingBag, label: 'Shop', href: '/products', active: currentPath === '/products' },
    { icon: Heart, label: 'Wishlist', href: '/wishlist', active: currentPath === '/wishlist' },
    { icon: User, label: 'Account', href: isAuthenticated ? '/dashboard' : '/login', active: currentPath === '/dashboard' || currentPath === '/login' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-grind-border shadow-2xl z-30 sm:hidden">
      <div className="grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-3 transition-colors ${
                item.active
                  ? 'text-grind-blue'
                  : 'text-gray-600 hover:text-grind-black'
              }`}
            >
              <div className="relative">
                <Icon size={22} />
                {item.label === 'Shop' && itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-grind-blue text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
