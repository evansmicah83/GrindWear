import { Minus, Plus, Trash2, ShoppingBag, Tag, Check, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MainLayout } from '../layouts/MainLayout';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { mockApi } from '../services/mockApi';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { formatPrice } from '@/lib/utils';
import Swal from 'sweetalert2';

export function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, subtotal, discount, shipping, total, coupon, updateQuantity, removeItem, applyCoupon, removeCoupon } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [checking, setChecking] = useState(false);

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
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setChecking(true);
    try {
      const c = await mockApi.validateCoupon(couponCode);
      if (c) {
        if (c.minAmount && subtotal < c.minAmount) {
          Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: `Minimum order of ${formatPrice(c.minAmount)} required`, showConfirmButton: false, timer: 2500 });
        } else {
          applyCoupon(c);
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Coupon applied!', showConfirmButton: false, timer: 2000, background: '#111', color: '#fff', iconColor: '#22c55e' });
          setCouponCode('');
        }
      } else {
        Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Invalid coupon code', showConfirmButton: false, timer: 2000 });
      }
    } finally {
      setChecking(false);
    }
  };

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag size={80} className="text-gray-200 mb-6" />
            <h2 className="text-3xl font-black text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              Looks like you haven't added anything yet. Explore our collection and find something you love.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-grind-black text-white font-bold rounded-xl hover:bg-grind-black/90 transition-colors"
            >
              Start Shopping <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl lg:text-4xl font-black text-grind-black mb-8">
          Shopping Cart <span className="text-gray-400 font-normal text-2xl">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-white border border-grind-border rounded-2xl p-4 flex gap-4">
                <button onClick={() => navigate(`/products/${item.product.id}`)} className="flex-shrink-0 overflow-hidden rounded-xl cursor-pointer">
                  <ImageWithFallback
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl"
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3
                        className="font-bold text-gray-900 hover:text-grind-blue cursor-pointer transition-colors line-clamp-1"
                        onClick={() => navigate(`/products/${item.product.id}`)}
                      >
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">{item.size} · {item.color}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900">{formatPrice(item.product.price * item.quantity)}</p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-400">{formatPrice(item.product.price)} each</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mt-2"
            >
              ← Continue Shopping
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-grind-border rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-black text-grind-black mb-5">Order Summary</h2>

              {/* Coupon */}
              {coupon ? (
                <div className="flex items-center justify-between mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 text-green-700 text-sm">
                    <Check size={15} />
                    <span className="font-semibold">{coupon.code}</span>
                    <span>applied</span>
                  </div>
                  <button onClick={removeCoupon} className="text-gray-400 hover:text-red-500">
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                        className="w-full pl-8 pr-3 py-2.5 text-sm border border-grind-border rounded-xl focus:outline-none focus:ring-2 focus:ring-grind-blue"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      disabled={checking}
                      className="px-4 py-2.5 border border-grind-border rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      {checking ? '...' : 'Apply'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">Try: WELCOME10, SAVE500, GRIND20</p>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount ({coupon?.code})</span><span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-400 bg-blue-50 rounded-lg px-3 py-2">
                    Add {formatPrice(2500 - subtotal)} more for free shipping 🚚
                  </p>
                )}
                <div className="border-t border-grind-border pt-3 flex justify-between font-black text-lg">
                  <span>Total</span><span>{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-5 py-4 bg-grind-black text-white font-bold rounded-xl hover:bg-grind-black/90 transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-2">
                <p className="text-xs text-gray-600 flex items-center gap-2">
                  <span>🔒</span> Secure checkout with SSL encryption
                </p>
                <p className="text-xs text-gray-600 flex items-center gap-2">
                  <span>🔄</span> 30-day hassle-free returns
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
