import { Minus, Plus, Trash2, ShoppingBag, Tag, Check } from 'lucide-react';
import { useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../../lib/utils';
import { mockApi } from '../services/mockApi';
import { toast } from 'sonner';
import type { Coupon } from '../types';

export function CartPage() {
  const { items, total, updateQuantity, removeItem } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCheckingCoupon(true);
    try {
      const coupon = await mockApi.validateCoupon(couponCode);
      if (coupon) {
        if (coupon.minAmount && total < coupon.minAmount) {
          toast.error(`Minimum order of ${formatPrice(coupon.minAmount)} required for this coupon`);
        } else {
          setAppliedCoupon(coupon);
          toast.success('Coupon applied successfully!', {
            description: `You saved ${coupon.type === 'percentage' ? `${coupon.discount}%` : formatPrice(coupon.discount)}`
          });
        }
      } else {
        toast.error('Invalid coupon code');
      }
    } catch (error) {
      toast.error('Failed to apply coupon');
    } finally {
      setCheckingCoupon(false);
    }
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percentage') {
      return total * (appliedCoupon.discount / 100);
    }
    return appliedCoupon.discount;
  };

  const discount = calculateDiscount();
  const subtotalAfterDiscount = total - discount;

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center py-16">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-3xl font-bold text-grind-black mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added anything to your cart yet
            </p>
            <Button size="lg" onClick={() => window.location.href = '/products'}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-grind-black mb-8">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-grind-border rounded-lg p-4 flex gap-4"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />

                <div className="flex-1">
                  <h3 className="font-semibold text-grind-black mb-1">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.size} / {item.color}
                  </p>
                  <p className="font-bold text-grind-black">
                    {formatPrice(item.product.price)}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-grind-danger transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="flex items-center gap-2 border border-grind-border rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-grind-border rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-grind-black mb-4">
                Order Summary
              </h2>

              <div className="mb-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      icon={<Tag size={18} />}
                    />
                  </div>
                  <Button
                    onClick={handleApplyCoupon}
                    loading={checkingCoupon}
                    variant="outline"
                  >
                    Apply
                  </Button>
                </div>
                {appliedCoupon && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <Check size={16} />
                    <span>Coupon "{appliedCoupon.code}" applied</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Try: WELCOME10, SAVE500, GRIND20
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-grind-success">
                    {total > 5000 ? 'FREE' : formatPrice(300)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (16%)</span>
                  <span>{formatPrice(subtotalAfterDiscount * 0.16)}</span>
                </div>
                <div className="border-t border-grind-border pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(subtotalAfterDiscount * 1.16 + (total > 5000 ? 0 : 300))}</span>
                </div>
              </div>

              <Button fullWidth size="lg" className="mb-3" onClick={() => window.location.href = '/checkout'}>
                Proceed to Checkout
              </Button>

              <Button
                fullWidth
                variant="outline"
                onClick={() => window.location.href = '/products'}
              >
                Continue Shopping
              </Button>

              <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <span className="text-lg">🚚</span>
                  <strong>Free shipping</strong> on orders over KES 5,000
                </p>
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="text-lg">♻️</span>
                  <strong>30-day returns</strong> for a full refund
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
