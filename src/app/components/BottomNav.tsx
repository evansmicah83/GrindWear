import { Home, ShoppingBag, ShoppingCart, Heart, User, Package } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { motion } from 'motion/react';

export function BottomNav() {
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const currentPath = window.location.pathname;
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const navItems = [
    { icon: Home, label: 'Home', href: '/', key: 'home' },
    { icon: ShoppingBag, label: 'Shop', href: '/products', key: 'shop' },
    { icon: ShoppingCart, label: 'Cart', href: '/cart', badge: itemCount, key: 'cart' },
    ...(isAuthenticated ? [
      { icon: Package, label: 'Orders', href: '/orders', key: 'orders' },
      { icon: Heart, label: 'Wishlist', href: '/wishlist', key: 'wishlist' },
      { icon: User, label: 'Account', href: '/account', key: 'account' },
    ] : [
      { icon: User, label: 'Sign In', href: '/login', key: 'account' },
    ]),
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#fff',
      borderTop: '1px solid #f3f4f6',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
      zIndex: 40,
      display: 'grid',
      gridTemplateColumns: `repeat(${navItems.length}, 1fr)`,
      paddingBottom: 'env(safe-area-inset-bottom)',
      paddingTop: '4px',
    }}
    className="sm:hidden"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.href;
        return (
          <motion.a
            key={item.key}
            href={item.href}
            onMouseEnter={() => setHoveredItem(item.key)}
            onMouseLeave={() => setHoveredItem(null)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 4px 8px',
              color: isActive ? '#2563eb' : '#6b7280',
              textDecoration: 'none',
              transition: 'color 0.15s',
              position: 'relative',
            }}
          >
            {/* Hover background */}
            {hoveredItem === item.key && (
              <motion.div
                layoutId={`hover-${item.key}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: isActive ? 'rgba(37, 99, 235, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '12px',
                  zIndex: -1
                }}
              />
            )}

            <div style={{ position: 'relative' }}>
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{ transition: 'all 0.2s' }}
              />
              {item.badge != null && item.badge > 0 && (
                <motion.span
                  key={item.badge}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-8px',
                    minWidth: '18px',
                    height: '18px',
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                    border: '1px solid white'
                  }}
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </motion.span>
              )}
            </div>
            <span style={{
              fontSize: '0.65rem',
              marginTop: '3px',
              fontWeight: isActive ? 600 : 400,
              letterSpacing: '0.01em',
              transition: 'font-weight 0.15s'
            }}>
              {item.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="active-indicator"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: '2px' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '20px',
                  backgroundColor: '#2563eb',
                  borderRadius: '0 0 2px 2px',
                }}
              />
            )}
          </motion.a>
        );
      })}
    </div>
  );
}
