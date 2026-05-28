import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Package, ArrowLeft, XCircle, ChevronRight, Star, MessageSquarePlus } from 'lucide-react';
import { AccountLayout } from './AccountLayout';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { cn } from '../../lib/utils';
import { ReviewModal } from '../../components/ReviewModal';
import { dismiss } from '../../contexts/ReviewPromptContext';
import Swal from 'sweetalert2';

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-orange-100 text-orange-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  refunded:   'bg-gray-100 text-gray-600',
};

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

function normalize(order: any) {
  return {
    ...order,
    createdAt: order.created_at || order.createdAt,
    orderNumber: order.order_number || order.orderNumber || order.id?.slice(-8).toUpperCase(),
    items: Array.isArray(order.items) ? order.items.filter(Boolean).map((item: any) => ({
      ...item,
      productName: item.product_name || item.productName || 'Product',
      productImage: item.product_image || item.productImage || item.image || '',
      productId: item.product_id || item.productId || '',
      size: item.size || (typeof item.variant_info === 'string' ? JSON.parse(item.variant_info || '{}') : item.variant_info || {})?.size || '—',
      color: item.color || (typeof item.variant_info === 'string' ? JSON.parse(item.variant_info || '{}') : item.variant_info || {})?.color || '—',
      price: parseFloat(item.unit_price || item.price || 0),
    })) : [],
    subtotal: parseFloat(order.subtotal || order.total || 0),
    shipping: parseFloat(order.shipping_cost || order.shipping || 0),
    discount: parseFloat(order.discount_amount || order.discount || 0),
    total: parseFloat(order.total || 0),
  };
}

export function AccountOrders() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [reviewTarget, setReviewTarget] = useState<{ productId: string; productName: string; productImage: string; orderId: string } | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { navigate('/login', { state: { from: '/account/orders' } }); return; }
    api.getMyOrders()
      .then((res: any) => {
        const raw = res?.data ?? res ?? [];
        setOrders(Array.isArray(raw) ? raw.map(normalize) : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, isLoading]);

  const handleCancel = async (orderId: string) => {
    try {
      const res: any = await api.cancelOrder(orderId);
      const updated = normalize(res?.data ?? res);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      if (selected?.id === orderId) setSelected(updated);
    } catch (e: any) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: e.message || 'Cannot cancel', showConfirmButton: false, timer: 2500 });
    }
  };

  const handleReviewed = (productId: string) => {
    dismiss(productId);
    setReviewed(prev => new Set([...prev, productId]));
    setReviewTarget(null);
  };

  // ── Order detail ────────────────────────────────────────────────────────────
  if (selected) {
    const stepIdx = STATUS_STEPS.indexOf(selected.status);
    const isDelivered = selected.status === 'delivered';
    const hasUnreviewed = isDelivered && selected.items.some((i: any) => !reviewed.has(i.productId));

    return (
      <AccountLayout>
        <div className="space-y-5">
          <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer text-sm font-medium">
            <ArrowLeft size={16} /> Back to Orders
          </button>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-black text-gray-900">Order #{selected.orderNumber}</h2>
                <p className="text-sm text-gray-400 mt-0.5">{formatDate(selected.createdAt)}</p>
              </div>
              <span className={cn('text-xs font-bold px-3 py-1.5 rounded-full capitalize', STATUS_COLORS[selected.status] || 'bg-gray-100 text-gray-600')}>
                {selected.status}
              </span>
            </div>

            {/* Timeline */}
            {!['cancelled', 'refunded'].includes(selected.status) && (
              <div className="flex items-center mb-6 overflow-x-auto pb-1">
                {STATUS_STEPS.map((s, i) => (
                  <div key={s} className="flex items-center flex-shrink-0">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                        i < stepIdx ? 'bg-green-500 text-white' : i === stepIdx ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400')}>
                        {i < stepIdx ? '✓' : i + 1}
                      </div>
                      <span className={cn('text-[10px] font-medium capitalize whitespace-nowrap', i <= stepIdx ? 'text-gray-900' : 'text-gray-400')}>{s}</span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={cn('h-0.5 w-8 sm:w-12 mx-1 mb-4 rounded-full', i < stepIdx ? 'bg-green-500' : 'bg-gray-200')} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Review banner */}
            {hasUnreviewed && (
              <div className="mb-5 p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Star size={16} className="fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">How was your order?</p>
                  <p className="text-xs text-gray-500">Tap "Write a Review" on any item below</p>
                </div>
              </div>
            )}

            {/* Items */}
            <div className="space-y-3 mb-5">
              {selected.items.length === 0
                ? <p className="text-sm text-gray-400 text-center py-4">No items found</p>
                : selected.items.map((item: any, i: number) => {
                  const done = reviewed.has(item.productId);
                  return (
                    <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                      {item.productImage
                        ? <img src={item.productImage} alt={item.productName} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                        : <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center"><Package size={20} className="text-gray-400" /></div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{item.productName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.size} · {item.color} · Qty: {item.quantity}</p>
                        {isDelivered && (
                          done
                            ? <p className="text-xs text-green-600 font-semibold mt-1.5 flex items-center gap-1">
                                <Star size={11} className="fill-green-500 text-green-500" /> Reviewed
                              </p>
                            : <button
                                onClick={() => setReviewTarget({ productId: item.productId, productName: item.productName, productImage: item.productImage, orderId: selected.id })}
                                className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-grind-blue hover:text-blue-700 transition-colors cursor-pointer"
                              >
                                <MessageSquarePlus size={13} /> Write a Review
                              </button>
                        )}
                      </div>
                      <p className="font-bold text-sm text-gray-900 flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  );
                })
              }
            </div>

            {/* Totals */}
            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatPrice(selected.subtotal)}</span></div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span>{selected.shipping === 0 ? <span className="text-green-600 font-semibold">FREE</span> : formatPrice(selected.shipping)}</span>
              </div>
              {selected.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(selected.discount)}</span></div>}
              <div className="flex justify-between font-black text-base pt-2 border-t border-gray-100">
                <span>Total</span><span>{formatPrice(selected.total)}</span>
              </div>
            </div>
          </div>

          {['pending', 'processing'].includes(selected.status) && (
            <button onClick={() => handleCancel(selected.id)}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 font-medium transition-colors cursor-pointer">
              <XCircle size={16} /> Cancel Order
            </button>
          )}
        </div>

        {/* Review modal */}
        {reviewTarget && (
          <ReviewModal
            productId={reviewTarget.productId}
            productName={reviewTarget.productName}
            productImage={reviewTarget.productImage}
            orderId={reviewTarget.orderId}
            onClose={() => setReviewTarget(null)}
            onSubmitted={handleReviewed}
          />
        )}
      </AccountLayout>
    );
  }

  // ── Orders list ─────────────────────────────────────────────────────────────
  return (
    <AccountLayout>
      <div>
        <h1 className="text-2xl font-black text-gray-900 mb-6">My Orders</h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl shadow-sm">
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
              <div key={order.id} onClick={() => setSelected(order)}
                className="bg-white border border-gray-100 rounded-2xl p-5 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full capitalize', STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600')}>
                      {order.status}
                    </span>
                    {order.status === 'delivered' && (
                      <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                        <Star size={11} className="fill-amber-500 text-amber-500" /> Review
                      </span>
                    )}
                    {['pending', 'processing'].includes(order.status) && (
                      <button onClick={e => { e.stopPropagation(); handleCancel(order.id); }}
                        className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 cursor-pointer">
                        <XCircle size={13} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {order.items.slice(0, 4).map((item: any, i: number) => (
                      item.productImage
                        ? <img key={i} src={item.productImage} alt="" className="w-12 h-12 rounded-lg object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                        : <div key={i} className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center"><Package size={14} className="text-gray-400" /></div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-gray-900">{formatPrice(order.total)}</p>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
