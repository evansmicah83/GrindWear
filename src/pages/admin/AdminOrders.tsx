import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Eye, Phone, Mail } from 'lucide-react';
import { api } from '../../services/api';
import { formatPrice, formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';
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

const PAYMENT_COLORS: Record<string, string> = {
  unpaid: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
};

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.adminGetOrders();
      setOrders(res.data);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.adminUpdateOrder(id, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      toast.success('Status updated');
    } catch { toast.error('Failed to update'); }
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.order_number?.toLowerCase().includes(search.toLowerCase()) || o.customer_name?.toLowerCase().includes(search.toLowerCase()) || o.customer_email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm">{orders.length} total orders</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order or customer..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white cursor-pointer">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order', 'Customer', 'Phone', 'Total', 'Payment', 'Status', 'Date', 'Products'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-8 bg-gray-100 rounded animate-pulse" /></td></tr>
              )) : filtered.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{order.order_number}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{order.customer_name || 'Guest'}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {order.customer_email && (
                        <a href={`mailto:${order.customer_email}`} title={order.customer_email}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors cursor-pointer">
                          <Mail size={11} />
                          <span className="text-[11px] font-semibold max-w-[100px] truncate">{order.customer_email}</span>
                        </a>
                      )}
                      {order.customer_phone && (
                        <a href={`tel:${order.customer_phone}`} title={order.customer_phone}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors cursor-pointer">
                          <Phone size={11} />
                          <span className="text-[11px] font-semibold">{order.customer_phone}</span>
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{order.customer_phone || '—'}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full capitalize', PAYMENT_COLORS[order.payment_status] || 'bg-gray-100 text-gray-600')}>
                      {order.payment_status || 'unpaid'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      className={cn('text-xs font-semibold px-2 py-1 rounded-full capitalize border-0 cursor-pointer focus:outline-none', STATUS_COLORS[order.status])}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* Product image thumbnails */}
                      <div className="flex -space-x-2">
                        {Array.isArray(order.items) && order.items.filter(Boolean).slice(0, 3).map((item: any, i: number) => (
                          <div key={i} className="w-8 h-8 rounded-lg border-2 border-white bg-gray-100 overflow-hidden shadow-sm flex-shrink-0">
                            {item?.product_image
                              ? <img src={item.product_image} alt={item.product_name || ''} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                              : <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px] font-bold">{(item?.product_name || '?')[0]}</div>
                            }
                          </div>
                        ))}
                        {Array.isArray(order.items) && order.items.filter(Boolean).length > 3 && (
                          <div className="w-8 h-8 rounded-lg border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm">
                            +{order.items.filter(Boolean).length - 3}
                          </div>
                        )}
                      </div>
                      {/* Eye button */}
                      <button onClick={() => navigate(`/admin/orders/${order.id}`)} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors flex-shrink-0" title="View order">
                        <Eye size={14} className="text-gray-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && <p className="text-center text-gray-400 py-12">No orders found</p>}
      </div>
    </div>
  );
}
