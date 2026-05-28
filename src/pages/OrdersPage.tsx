import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Package, ArrowLeft, XCircle } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
};

function normalize(order: any) {
  return {
    ...order,
    createdAt: order.created_at || order.createdAt,
    orderNumber: order.order_number || order.orderNumber || order.id?.slice(-8).toUpperCase(),
    items: Array.isArray(order.items) ? order.items.filter(Boolean).map((item: any) => ({
      ...item,
      productName: item.product_name || item.productName || 'Product',
      productImage: item.product_image || item.productImage || item.image || '',
      variantInfo: item.variant_info || {},
      size: item.size || item.variant_info?.size || '—',
      color: item.color || item.variant_info?.color || '—',
      price: parseFloat(item.unit_price || item.price || 0),
    })) : [],
    subtotal: parseFloat(order.subtotal || order.total || 0),
    shipping: parseFloat(order.shipping_cost || order.shipping || 0),
    discount: parseFloat(order.discount_amount || order.discount || 0),
    total: parseFloat(order.total || 0),
  };
}

export function OrdersPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/orders' } });
      return;
    }
    api.getMyOrders()
      .then((res: any) => {
        const raw = res?.data ?? res ?? [];
        setOrders(Array.isArray(raw) ? raw.map(normalize) : []);
      })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading]);

  const handleCancel = async (orderId: string) => {
    try {
      const res: any = await api.cancelOrder(orderId);
      const updated = normalize(res?.data ?? res);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      toast.success('Order cancelled');
    } catch (e: any) {
      toast.error(e.message || 'Cannot cancel this order');
    }
  };

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-black text-gray-900">My Orders</h1>
          </div>
          <a href="/account" className="text-sm text-gray-500 hover:text-gray-900">Account Settings &rarr;</a>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
            <Package size={56} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No orders yet</h3>
            <p className="text-gray-400 mb-6 text-sm">Your orders will appear here once you make a purchase</p>
            <button onClick={() => navigate('/products')} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)} &middot; {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full capitalize', STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600')}>
                      {order.status}
                    </span>
                    {['pending', 'processing'].includes(order.status) && (
                      <button onClick={() => handleCancel(order.id)} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 cursor-pointer">
                        <XCircle size={13} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {order.items.slice(0, 4).map((item: any, i: number) => (
                      item.productImage
                        ? <img key={i} src={item.productImage} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        : <div key={i} className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center"><Package size={14} className="text-gray-400" /></div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                  <p className="font-black text-gray-900">{formatPrice(order.total)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}