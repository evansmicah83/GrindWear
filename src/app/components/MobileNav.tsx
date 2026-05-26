import { Home, ShoppingBag, ShoppingCart, Heart, User } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export function MobileNav() {
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const currentPath = window.location.pathname;

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: ShoppingBag, label: 'Shop', href: '/products' },
    { icon: ShoppingCart, label: 'Cart', href: '/cart', badge: itemCount },
    { icon: Heart, label: 'Wishlist', href: '/wishlist' },
    { icon: User, label: 'Account', href: isAuthenticated ? '/dashboard' : '/login' },
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      backgroundColor: '#fff',
      borderTop: '1px solid #f3f4f6',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
      zIndex: 40,
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}
    className="sm:hidden"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.href;
        return (
          <a
            key={item.href}
            href={item.href}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '10px 4px 8px',
              color: isActive ? '#2563eb' : '#6b7280',
              textDecoration: 'none', transition: 'color 0.15s',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              {item.badge != null && item.badge > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-8px',
                  minWidth: '16px', height: '16px',
                  backgroundColor: '#2563eb', color: '#fff',
                  fontSize: '0.6rem', fontWeight: 700,
                  borderRadius: '999px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  padding: '0 3px',
                }}>
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
            <span style={{
              fontSize: '0.65rem', marginTop: '3px', fontWeight: isActive ? 600 : 400,
              letterSpacing: '0.01em',
            }}>
              {item.label}
            </span>
            {isActive && (
              <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: '20px', height: '2px', backgroundColor: '#2563eb', borderRadius: '0 0 2px 2px',
              }} />
            )}
          </a>
        );
      })}
    </div>
  );
}
