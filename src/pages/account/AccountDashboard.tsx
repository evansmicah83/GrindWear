import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Package, Heart, ArrowRight, ShoppingBag, MapPin, User,
  TrendingUp, Clock, CheckCircle, Truck, Star, Gift, ChevronRight, ShoppingCart
} from 'lucide-react';
import { AccountLayout } from './AccountLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlistStore } from '../../stores/wishlistStore';
import { api } from '../../services/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { ImageWithFallback } from '../../components/ImageWithFallback';

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  pending:    { color: 'bg-yellow-100 text-yellow-700 border-yellow-200',   icon: Clock,        label: 'Pending' },
  confirmed:  { color: 'bg-blue-100 text-blue-700 border-blue-200',         icon: CheckCircle,  label: 'Confirmed' },
  processing: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200',   icon: TrendingUp,   label: 'Processing' },
  shipped:    { color: 'bg-purple-100 text-purple-700 border-purple-200',   icon: Truck,        label: 'Shipped' },
  delivered:  { color: 'bg-green-100 text-green-700 border-green-200',      icon: CheckCircle,  label: 'Delivered' },
  cancelled:  { color: 'bg-red-100 text-red-700 border-red-200',            icon: Package,      label: 'Cancelled' },
};

const QUICK_ACTIONS = [
  { label: 'Track Order',     icon: Truck,        href: '/account/orders',    color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
  { label: 'My Wishlist',     icon: Heart,        href: '/account/wishlist',  color: 'bg-red-50 text-red-500 hover:bg-red-100' },
  { label: 'My Addresses',    icon: MapPin,        href: '/account/addresses', color: 'bg-green-50 text-green-600 hover:bg-green-100' },
  { label: 'Edit Profile',    icon: User,          href: '/account/profile',   color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
  { label: 'Shop Now',        icon: ShoppingCart,  href: '/products',          color: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
  { label: 'Refer a Friend',  icon: Gift,          href: '#',                  color: 'bg-pink-50 text-pink-600 hover:bg-pink-100' },
];

export function AccountDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { items: wishlistItems } = useWishlistStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { navigate('/login', { state: { from: '/account' } }); return; }
    api.getMyOrders()
      .then((res: any) => {
        const raw = res?.data ?? res ?? [];
        setOrders(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated, isLoading]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const totalSpent = orders.reduce((s, o) => s + parseFloat(o.total || 0), 0);
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;
  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));

  return (
    <AccountLayout>
      <div className="space-y-6">

        {/* ── HERO GREETING ── */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 20% 80%, #8b5cf6 0%, transparent 50%)' }} />
          <div className="relative">
            <p className="text-white/60 text-sm font-medium">{greeting} 👋</p>
            <h1 className="text-2xl font-black mt-0.5">{user?.name?.split(' ')[0]}</h1>
            <p className="text-white/50 text-sm mt-1">Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</p>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-white/50 text-xs">Total Orders</p>
                <p className="text-xl font-black">{orders.length}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <p className="text-white/50 text-xs">Total Spent</p>
                <p className="text-xl font-black">{formatPrice(totalSpent)}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <p className="text-white/50 text-xs">Wishlist</p>
                <p className="text-xl font-black">{wishlistItems.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── STATS GRID ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Package,      label: 'All Orders',      value: orders.length,       color: 'text-blue-600',   bg: 'bg-blue-50' },
            { icon: Truck,        label: 'Active Orders',   value: activeOrders.length, color: 'text-purple-600', bg: 'bg-purple-50' },
            { icon: CheckCircle,  label: 'Delivered',       value: deliveredCount,      color: 'text-green-600',  bg: 'bg-green-50' },
            { icon: Heart,        label: 'Wishlist',        value: wishlistItems.length,color: 'text-red-500',    bg: 'bg-red-50' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h2 className="font-black text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {QUICK_ACTIONS.map(({ label, icon: Icon, href, color }) => (
              <button
                key={label}
                onClick={() => navigate(href)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all cursor-pointer ${color}`}
              >
                <Icon size={20} />
                <span className="text-xs font-semibold text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── ACTIVE ORDERS BANNER ── */}
        {activeOrders.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Truck size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-blue-900 text-sm">
                  {activeOrders.length} order{activeOrders.length > 1 ? 's' : ''} in progress
                </p>
                <p className="text-xs text-blue-600">Track your shipments in real time</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/account/orders')}
              className="flex items-center gap-1 text-sm font-bold text-blue-700 hover:text-blue-900 transition-colors cursor-pointer"
            >
              Track <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* ── RECENT ORDERS ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <h2 className="font-black text-gray-900">Recent Orders</h2>
            <button
              onClick={() => navigate('/account/orders')}
              className="text-sm text-grind-blue hover:underline flex items-center gap-1 cursor-pointer"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-14 px-5">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={28} className="text-gray-300" />
              </div>
              <p className="font-bold text-gray-700">No orders yet</p>
              <p className="text-sm text-gray-400 mt-1">Your order history will appear here</p>
              <button
                onClick={() => navigate('/products')}
                className="mt-4 px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {orders.slice(0, 4).map(order => {
                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                return (
                  <div
                    key={order.id}
                    onClick={() => navigate('/account/orders')}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {/* Product thumbnails */}
                    <div className="flex -space-x-2 flex-shrink-0">
                      {(order.items || []).slice(0, 3).map((item: any, i: number) => (
                        <div key={i} className="w-12 h-12 rounded-xl border-2 border-white overflow-hidden bg-gray-100 shadow-sm">
                          <ImageWithFallback
                            src={item.productImage || item.product_image || ''}
                            alt={item.productName || ''}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {(order.items || []).length > 3 && (
                        <div className="w-12 h-12 rounded-xl border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>

                    {/* Order info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-900 text-sm">
                          #{(order.order_number || order.id || '').toString().slice(-8).toUpperCase()}
                        </p>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                          <StatusIcon size={10} />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''} · {formatDate(order.created_at || order.createdAt)}
                      </p>
                    </div>

                    {/* Price + arrow */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <p className="font-black text-gray-900">{formatPrice(parseFloat(order.total || 0))}</p>
                      <ChevronRight size={16} className="text-gray-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── WISHLIST PREVIEW ── */}
        {wishlistItems.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <h2 className="font-black text-gray-900 flex items-center gap-2">
                <Heart size={16} className="text-red-500 fill-red-500" /> Wishlist
              </h2>
              <button
                onClick={() => navigate('/account/wishlist')}
                className="text-sm text-grind-blue hover:underline flex items-center gap-1 cursor-pointer"
              >
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {wishlistItems.slice(0, 4).map(item => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/products/${item.slug || item.id}`)}
                  className="group cursor-pointer"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-2">
                    <ImageWithFallback
                      src={item.images?.[0] || ''}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatPrice(item.price)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LOYALTY CARD ── */}
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
          <div className="absolute right-8 bottom-0 w-20 h-20 bg-white/10 rounded-full translate-y-6" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Star size={18} className="fill-white" />
              <span className="font-black text-sm uppercase tracking-wider">Grind Rewards</span>
            </div>
            <p className="text-3xl font-black">{deliveredCount * 100} pts</p>
            <p className="text-white/80 text-sm mt-1">
              {deliveredCount > 0
                ? `Earned from ${deliveredCount} completed order${deliveredCount > 1 ? 's' : ''}`
                : 'Complete your first order to earn points'}
            </p>
            <div className="mt-4 bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${Math.min((deliveredCount * 100) / 1000 * 100, 100)}%` }}
              />
            </div>
            <p className="text-white/70 text-xs mt-1.5">{Math.max(0, 1000 - deliveredCount * 100)} pts to next reward</p>
          </div>
        </div>

      </div>
    </AccountLayout>
  );
}
