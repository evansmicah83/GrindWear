import { useEffect, useState } from 'react';
import { CheckCircle, Package, Truck, Home, MapPin } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { formatPrice, formatDate } from '../../lib/utils';
import type { Order } from '../types';
import { backendEmulator } from '../services/backendEmulator';

export function OrderConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');

    if (orderId) {
      loadOrder(orderId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadOrder = async (orderId: string) => {
    try {
      const orderData = await backendEmulator.getOrder(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Failed to load order', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="animate-pulse">Loading order...</div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <Button onClick={() => window.location.href = '/'}>
            Return to Home
          </Button>
        </div>
      </MainLayout>
    );
  }

  const orderStatuses = [
    { key: 'pending', label: 'Order Placed', icon: Package },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Home }
  ];

  const currentStatusIndex = orderStatuses.findIndex(s => s.key === order.status);

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-green-50 to-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
            <h1 className="text-3xl lg:text-4xl font-bold text-grind-black mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600 text-lg">
              Thank you for your purchase. Your order has been received.
            </p>
          </div>

          <Card padding="lg" className="mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                <p className="text-xl font-bold text-grind-black">{order.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Order Date</p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Package size={20} />
                Order Status
              </h3>
              <div className="flex items-center justify-between relative">
                {orderStatuses.map((status, index) => {
                  const Icon = status.icon;
                  const isCompleted = index <= currentStatusIndex;
                  const isActive = index === currentStatusIndex;

                  return (
                    <div key={status.key} className="flex flex-col items-center flex-1 relative">
                      {index < orderStatuses.length - 1 && (
                        <div
                          className={`absolute top-6 left-1/2 w-full h-0.5 ${
                            isCompleted ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          style={{ zIndex: 0 }}
                        />
                      )}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 relative z-10 ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                        } ${isActive ? 'ring-4 ring-green-200' : ''}`}
                      >
                        <Icon size={24} />
                      </div>
                      <p className={`text-xs text-center ${isActive ? 'font-semibold' : ''}`}>
                        {status.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Shipping Address
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                  {order.shippingAddress.country}
                </p>
              </div>
            </div>
          </Card>

          <Card padding="lg" className="mb-6">
            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">
                      {item.size} / {item.color} × {item.quantity}
                    </p>
                    <p className="font-semibold mt-1">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t mt-6 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(order.total / 1.16 - 300)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery</span>
                <span>{formatPrice(300)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span>{formatPrice(order.total * 0.16)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              fullWidth
              variant="outline"
              onClick={() => window.location.href = '/products'}
            >
              Continue Shopping
            </Button>
            <Button
              fullWidth
              onClick={() => window.location.href = '/dashboard'}
            >
              View All Orders
            </Button>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-700">
              We've sent a confirmation email to your registered email address.
              You can track your order status from your dashboard.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
