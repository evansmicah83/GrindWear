import { X, Minus, Plus, Trash2, ShoppingBag, Tag, Check } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../contexts/CartContext';
import { useUIStore } from '../stores/uiStore';
import { mockApi } from '../services/mockApi';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { ImageWithFallback } from './ImageWithFallback';

export function CartDrawer() {
  const navigate = useNavigate();
  const { items, itemCount, subtotal, discount, shipping, total, coupon, updateQuantity, removeItem, applyCoupon, removeCoupon } = useCart();
  const { cartDrawerOpen, setCartDrawer } = useUIStore();
  const [couponCode, setCouponCode] = useState('');
  const [checking, setChecking] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setChecking(true);
    try {
      const c = await mockApi.validateCoupon(couponCode);
      if (c) {
        if (c.minAmount && subtotal < c.minAmount) {
          toast.error(`Min. order of ${formatPrice(c.minAmount)} required`);
        } else {
          applyCoupon(c);
          toast.success(`Coupon applied! You saved ${c.type === 'percentage' ? `${c.discount}%` : formatPrice(c.discount)}`);
          setCouponCode('');
        }
      } else {
        toast.error('Invalid coupon code');
      }
    } finally {
      setChecking(false);
    }
  };

  const handleCheckout = () => {
    setCartDrawer(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {cartDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setCartDrawer(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-grind-border">
              <h2 className="text-lg font-bold text-grind-black">
                Your Cart {itemCount > 0 && <span className="text-gray-400 font-normal">({itemCount})</span>}
              </h2>
              <button onClick={() => setCartDrawer(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                <ShoppingBag size={56} className="text-gray-200" />
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Your cart is empty</p>
                  <p className="text-sm text-gray-400">Add some items to get started</p>
                </div>
                <button
                  onClick={() => { setCartDrawer(false); navigate('/products'); }}
                  className="px-6 py-2.5 bg-grind-black text-white rounded-xl text-sm font-semibold hover:bg-grind-black/90 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                      <ImageWithFallback
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.size} · {item.color}</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(item.product.price)}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 hover:bg-gray-100 transition-colors"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 hover:bg-gray-100 transition-colors"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="border-t border-grind-border p-4 space-y-3 bg-gray-50">
                  {/* Coupon */}
                  {coupon ? (
                    <div className="flex items-center justify-between text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 text-green-700">
                        <Check size={14} />
                        <span className="font-medium">{coupon.code}</span>
                        <span className="text-green-600">-{formatPrice(discount)}</span>
                      </div>
                      <button onClick={removeCoupon} className="text-gray-400 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Coupon code"
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value.toUpperCase())}
                          onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                          className="w-full pl-8 pr-3 py-2 text-sm border border-grind-border rounded-lg focus:outline-none focus:ring-2 focus:ring-grind-blue"
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        disabled={checking}
                        className="px-3 py-2 border border-grind-border rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                      >
                        {checking ? '...' : 'Apply'}
                      </button>
                    </div>
                  )}

                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span><span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                    </div>
                    {shipping > 0 && (
                      <p className="text-xs text-gray-400">Add {formatPrice(2500 - subtotal)} more for free shipping</p>
                    )}
                    <div className="flex justify-between font-bold text-base pt-2 border-t border-grind-border">
                      <span>Total</span><span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 bg-grind-black text-white rounded-xl font-semibold hover:bg-grind-black/90 transition-colors"
                  >
                    Checkout · {formatPrice(total)}
                  </button>
                  <button
                    onClick={() => { setCartDrawer(false); navigate('/cart'); }}
                    className="w-full py-2.5 border border-grind-border rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    View Full Cart
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
