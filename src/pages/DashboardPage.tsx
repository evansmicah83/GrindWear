import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Package, XCircle, MessageCircle, LogOut } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { ChatWidget } from '../components/ChatWidget';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    api.getMyOrders()
      .then((res: any) => setOrders(res?.data ?? res ?? []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleCancel = async (orderId: string) => {
    try {
      const res = await api.cancelOrder(orderId) as any;
      const updated = res?.data ?? res;
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      toast.success('Order cancelled successfully');
    } catch (e: any) {
      toast.error(e.message || 'Cannot cancel this order');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-lg">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setChatOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              <MessageCircle size={16} /> Chat Support
            </button>
            <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Package size={20} /> My Orders
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Package size={48} className="mx-auto mb-3 opacity-30" />
            <p>No orders yet</p>
            <button onClick={() => navigate('/products')} className="mt-4 text-blue-600 font-medium hover:underline">Start shopping</button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                    {['pending', 'processing'].includes(order.status) && (
                      <button onClick={() => handleCancel(order.id)} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium transition-colors">
                        <XCircle size={14} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mb-3">
                  {order.items.slice(0, 3).map((item: any) => (
                    <img key={item.id} src={item.productImage} alt={item.productName} className="w-14 h-14 rounded-lg object-cover" />
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                  <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {chatOpen && <ChatWidget onClose={() => setChatOpen(false)} />}
    </MainLayout>
  );
}
