import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { TrendingUp, ShoppingBag, Users, Package, ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '../../services/api';
import { formatPrice, formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
};

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#f97316', '#22c55e', '#ef4444'];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminDashboard()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-2xl p-5 h-28 animate-pulse" />)}
    </div>
  );

  const stats = [
    { label: 'Total Revenue', value: formatPrice(data?.revenue || 0), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', change: '+12%', up: true },
    { label: 'Total Orders', value: data?.orders || 0, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', change: '+8%', up: true },
    { label: 'Customers', value: data?.customers || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', change: '+5%', up: true },
    { label: 'Low Stock Items', value: data?.lowStock?.length || 0, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50', change: '-2', up: false },
  ];

  const statusMap: Record<string, number> = {};
  (data?.recentOrders || []).forEach((o: any) => { statusMap[o.status] = (statusMap[o.status] || 0) + 1; });
  const pieData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Welcome back — here's what's happening.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.bg)}>
                <s.icon size={20} className={s.color} />
              </div>
              <span className={cn('flex items-center gap-0.5 text-xs font-semibold', s.up ? 'text-green-600' : 'text-red-500')}>
                {s.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{s.change}
              </span>
            </div>
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Revenue — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d?.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => formatPrice(v)} />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Orders by Status</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No order data yet</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Recent Orders</h3>
            <button onClick={() => navigate('/admin/orders')} className="text-xs text-blue-600 hover:underline cursor-pointer">View all</button>
          </div>
          <div className="divide-y divide-gray-50">
            {(data?.recentOrders || []).slice(0, 6).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{order.order_number}</p>
                  <p className="text-xs text-gray-500">{order.customer_name || 'Guest'} · {formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full capitalize', STATUS_COLORS[order.status])}>{order.status}</span>
                  <span className="text-sm font-bold">{formatPrice(order.total)}</span>
                  <button onClick={() => navigate(`/admin/orders/${order.id}`)} className="p-1 hover:bg-gray-100 rounded cursor-pointer">
                    <Eye size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
            {!data?.recentOrders?.length && <p className="text-center text-gray-400 py-8 text-sm">No orders yet</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Low Stock Alert</h3>
            <button onClick={() => navigate('/admin/inventory')} className="text-xs text-blue-600 hover:underline cursor-pointer">Manage</button>
          </div>
          <div className="divide-y divide-gray-50">
            {(data?.lowStock || []).slice(0, 6).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.size} · {item.color}</p>
                </div>
                <span className={cn('text-xs font-bold px-2 py-1 rounded-full', item.stock_qty === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700')}>
                  {item.stock_qty} left
                </span>
              </div>
            ))}
            {!data?.lowStock?.length && <p className="text-center text-gray-400 py-8 text-sm">All items well stocked</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
