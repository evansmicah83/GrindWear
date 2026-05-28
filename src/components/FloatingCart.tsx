import { ShoppingCart, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ImageWithFallback } from './ImageWithFallback';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';

export function FloatingCart() {
  const { items, itemCount, total, subtotal, discount, shipping, coupon, removeItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: 'info',
        title: 'Sign in to checkout',
        html: `<p style="color:#6b7280;font-size:14px">Your cart items are saved. Sign in or create a free account to complete your order.</p>`,
        showCancelButton: true,
        confirmButtonText: '🔐 Sign In',
        cancelButtonText: 'Continue Browsing',
        confirmButtonColor: '#111827',
        cancelButtonColor: '#6b7280',
        customClass: { popup: 'rounded-2xl shadow-2xl font-sans' },
      }).then(result => {
        if (result.isConfirmed) navigate('/login', { state: { from: '/checkout' } });
      });
      return;
    }
    navigate('/checkout');
    setIsExpanded(false);
  };

  if (itemCount === 0) return null;

  return (
    <>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative bg-grind-black text-white rounded-full p-4 shadow-2xl hover:scale-110 transition-transform"
        >
          <ShoppingCart size={24} />
          <span className="absolute -top-2 -right-2 bg-grind-blue text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {itemCount}
          </span>
        </button>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsExpanded(false)}
            />

            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-grind-border flex items-center justify-between">
                <h3 className="text-xl font-bold text-grind-black">
                  Your Cart ({itemCount})
                </h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                    <ImageWithFallback
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-gray-600">
                        {item.size} / {item.color} × {item.quantity}
                      </p>
                      <p className="font-bold text-sm mt-1">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="self-start p-1 hover:bg-gray-200 rounded transition-colors text-gray-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-grind-border bg-gray-50 space-y-3">
                {/* Fee breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount {coupon ? `(${coupon.code})` : ''}</span>
                      <span>− {formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-600 font-medium">Free</span> : formatPrice(shipping)}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-gray-400">Free shipping on orders over {formatPrice(2500)}</p>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-lg">{formatPrice(total)}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-grind-black text-white py-3 rounded-lg font-medium hover:bg-grind-black/90 transition-colors"
                >
                  Checkout Now
                </button>
                <button
                  onClick={() => { navigate('/cart'); setIsExpanded(false); }}
                  className="w-full border-2 border-grind-border text-grind-black py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  View Full Cart
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
