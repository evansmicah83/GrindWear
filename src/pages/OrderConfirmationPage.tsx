import { useEffect, useState } from 'react';
import { CheckCircle, Package, Truck, Home, MapPin } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order } from '../types';
import { api } from '../services/api';

export function OrderConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');
    if (orderId) {
      api.getOrder(orderId)
        .then(setOrder)
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="animate-pulse text-gray-500">Loading order...</div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <a href="/" className="px-6 py-3 bg-grind-black text-white rounded-xl font-semibold no-underline">
            Return to Home
          </a>
        </div>
      </MainLayout>
    );
  }

  const STATUS_STEPS = [
    { key: 'pending', label: 'Order Placed', icon: Package },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Home },
  ];
  const currentIdx = STATUS_STEPS.findIndex(s => s.key === order.status);

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-green-50 to-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
            <h1 className="text-3xl lg:text-4xl font-black text-grind-black mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 text-lg">Thank you for your purchase. Your order has been received.</p>
          </div>

          <div className="bg-white border border-grind-border rounded-2xl p-6 mb-5">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Order Number</p>
                <p className="text-xl font-black text-grind-black">#{order.id.slice(-8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Order Date</p>
                <p className="font-semibold text-sm">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            {/* Status timeline */}
            <div className="flex items-start justify-between relative mb-2">
              {STATUS_STEPS.map((step, i) => {
                const Icon = step.icon;
                const done = i <= currentIdx;
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1 relative">
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`absolute top-5 left-1/2 w-full h-0.5 ${done ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 ${done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <Icon size={18} />
                    </div>
                    <p className="text-xs text-center mt-1.5 text-gray-500">{step.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping address */}
          <div className="bg-white border border-grind-border rounded-2xl p-6 mb-5">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin size={16} /> Shipping Address
            </h3>
            <p className="text-sm text-gray-700">{order.shippingAddress.fullName}</p>
            <p className="text-sm text-gray-500">{order.shippingAddress.street}</p>
            <p className="text-sm text-gray-500">{order.shippingAddress.city}, {order.shippingAddress.county}</p>
            <p className="text-sm text-gray-500">{order.shippingAddress.phone}</p>
          </div>

          {/* Order totals */}
          <div className="bg-white border border-grind-border rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(order.subtotal || order.total)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{(order.shipping || 0) === 0 ? 'FREE' : formatPrice(order.shipping || 0)}</span></div>
              {(order.discount || 0) > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount || 0)}</span></div>
              )}
              <div className="flex justify-between font-black text-base pt-2 border-t border-grind-border">
                <span>Total</span><span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a href="/account/orders" className="flex-1 py-3 border-2 border-grind-black text-grind-black font-bold rounded-xl text-center no-underline hover:bg-gray-50 transition-colors">
              Track Order
            </a>
            <a href="/products" className="flex-1 py-3 bg-grind-black text-white font-bold rounded-xl text-center no-underline hover:bg-grind-black/90 transition-colors">
              Continue Shopping
            </a>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600">
              A confirmation email has been sent. Track your order from your account dashboard.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
