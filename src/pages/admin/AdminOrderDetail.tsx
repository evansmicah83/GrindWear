import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Package, MapPin, CreditCard, User, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { api } from '../../services/api';
import { formatPrice, formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';

const STATUS_CONFIG: Record<string, { color: string; icon: any }> = {
  pending:    { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  confirmed:  { color: 'bg-blue-100 text-blue-700 border-blue-200',       icon: CheckCircle },
  processing: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Package },
  shipped:    { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Truck },
  delivered:  { color: 'bg-green-100 text-green-700 border-green-200',    icon: CheckCircle },
  cancelled:  { color: 'bg-red-100 text-red-700 border-red-200',          icon: XCircle },
  refunded:   { color: 'bg-gray-100 text-gray-600 border-gray-200',       icon: XCircle },
};

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.adminGetOrders()
      .then(res => {
        const found = res.data.find((o: any) => o.id === id || o.order_number === id);
        if (!found) setError('Order not found');
        else setOrder(found);
      })
      .catch(err => setError(err.message || 'Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      await api.adminUpdateOrder(order.id, { status });
      setOrder((o: any) => ({ ...o, status }));
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
    </div>
  );

  if (error || !order) return (
    <div className="text-center py-20">
      <p className="text-red-500 font-semibold mb-4">{error || 'Order not found'}</p>
      <button onClick={() => navigate('/admin/orders')} className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold cursor-pointer">
        Back to Orders
      </button>
    </div>
  );

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const items = Array.isArray(order.items) ? order.items.filter(Boolean) : [];
  const addr = order.shipping_address || {};

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/orders')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black text-gray-900">{order.order_number}</h1>
          <p className="text-sm text-gray-400">{formatDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border', cfg.color)}>
            <StatusIcon size={12} /> {order.status}
          </span>
          <select
            value={order.status}
            onChange={e => updateStatus(e.target.value)}
            disabled={updating}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer disabled:opacity-50"
          >
            {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — items + totals */}
        <div className="lg:col-span-2 space-y-5">

          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
              <Package size={16} className="text-gray-400" />
              <h2 className="font-bold text-gray-900">Order Items ({items.length})</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {items.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">No items found</p>
              ) : items.map((item: any, i: number) => {
                const variantInfo = typeof item.variant_info === 'string'
                  ? (() => { try { return JSON.parse(item.variant_info); } catch { return {}; } })()
                  : item.variant_info || {};
                return (
                  <div key={item.id || i} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                      {item.product_image
                        ? <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={20} /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{item.product_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {variantInfo.size && `Size: ${variantInfo.size}`}
                        {variantInfo.size && variantInfo.color && ' · '}
                        {variantInfo.color && `Color: ${variantInfo.color}`}
                      </p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">{formatPrice(item.total_price)}</p>
                      <p className="text-xs text-gray-400">{formatPrice(item.unit_price)} each</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">Payment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              {parseFloat(order.discount_amount) > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount_amount)}</span></div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{parseFloat(order.shipping_cost) === 0 ? 'FREE' : formatPrice(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between font-black text-base pt-3 border-t border-gray-100">
                <span>Total</span><span>{formatPrice(order.total)}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <CreditCard size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600 capitalize">{order.payment_method || 'N/A'}</span>
              <span className={cn('ml-auto text-xs font-semibold px-2 py-0.5 rounded-full',
                order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}>
                {order.payment_status || 'unpaid'}
              </span>
            </div>
          </div>
        </div>

        {/* Right — customer + address */}
        <div className="space-y-5">

          {/* Customer */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <User size={16} className="text-gray-400" />
              <h2 className="font-bold text-gray-900">Customer</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                {(order.customer_name || 'G')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{order.customer_name || 'Guest'}</p>
                <p className="text-xs text-gray-400 truncate">{order.customer_email || '—'}</p>
                <p className="text-xs text-gray-400 truncate">{order.customer_phone || '—'}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={16} className="text-gray-400" />
              <h2 className="font-bold text-gray-900">Shipping Address</h2>
            </div>
            {addr.street ? (
              <div className="text-sm text-gray-600 space-y-0.5">
                <p className="font-semibold text-gray-900">{addr.street}</p>
                <p>{addr.city}{addr.county ? `, ${addr.county}` : ''}</p>
                <p>{addr.country || 'Kenya'} {addr.postal_code}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No address on record</p>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-3">
              {[
                { label: 'Order placed', date: order.created_at, done: true },
                { label: 'Confirmed', date: order.status !== 'pending' ? order.updated_at : null, done: !['pending'].includes(order.status) },
                { label: 'Shipped', date: ['shipped', 'delivered'].includes(order.status) ? order.updated_at : null, done: ['shipped', 'delivered'].includes(order.status) },
                { label: 'Delivered', date: order.status === 'delivered' ? order.updated_at : null, done: order.status === 'delivered' },
              ].map(({ label, date, done }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', done ? 'bg-green-500' : 'bg-gray-200')} />
                  <div className="flex-1">
                    <p className={cn('text-sm font-medium', done ? 'text-gray-900' : 'text-gray-400')}>{label}</p>
                    {date && <p className="text-xs text-gray-400">{formatDate(date)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
