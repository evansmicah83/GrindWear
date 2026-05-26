import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Users, Package, ShoppingBag, MessageCircle, Pencil, Trash2, Plus, X, Check } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { formatPrice } from '../../lib/utils';
import { toast } from 'sonner';
import { ChatWidget } from '../components/ChatWidget';

type Tab = 'orders' | 'products' | 'users' | 'chat';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [showProductForm, setShowProductForm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role !== 'admin') { navigate('/'); return; }
    loadAll();
  }, [isAuthenticated, user]);

  const loadAll = async () => {
    const [o, p, u] = await Promise.all([api.adminGetOrders(), api.adminGetProducts(), api.adminGetUsers()]);
    setOrders(o); setProducts(p); setUsers(u);
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const updated = await api.adminUpdateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      toast.success('Order status updated');
    } catch { toast.error('Failed to update status'); }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await api.adminDeleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Product deleted');
  };

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
    { key: 'products', label: 'Products', icon: Package, count: products.length },
    { key: 'users', label: 'Users', icon: Users, count: users.length },
    { key: 'chat', label: 'Chat', icon: MessageCircle },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-black text-gray-900 mb-6">Admin Panel</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); if (t.key === 'chat') setChatOpen(true); }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 cursor-pointer transition-colors -mb-px ${tab === t.key ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <t.icon size={16} />
              {t.label}
              {t.count !== undefined && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Orders */}
        {tab === 'orders' && (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-bold text-sm text-gray-900">{order.id}</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()} · {order.items.length} items · {formatPrice(order.total)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">User: {order.userId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-center text-gray-400 py-12">No orders yet</p>}
          </div>
        )}

        {/* Products */}
        {tab === 'products' && (
          <div>
            <button
              onClick={() => { setEditProduct(null); setShowProductForm(true); }}
              className="flex items-center gap-2 mb-4 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <Plus size={16} /> Add Product
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <img src={p.images[0]} alt={p.name} className="w-full h-40 object-cover" />
                  <div className="p-3">
                    <p className="font-semibold text-sm text-gray-900 line-clamp-1">{p.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.category} · Stock: {p.stock}</p>
                    <p className="font-bold text-sm mt-1">{formatPrice(p.price)}</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => { setEditProduct(p); setShowProductForm(true); }} className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 cursor-pointer transition-colors">
                        <Pencil size={12} /> Edit
                      </button>
                      <button onClick={() => deleteProduct(p.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 cursor-pointer transition-colors">
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name', 'Email', 'Role', 'Joined'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <p className="text-center text-gray-400 py-12">No users yet</p>}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductFormModal
          product={editProduct}
          onClose={() => setShowProductForm(false)}
          onSave={async (data) => {
            if (editProduct) {
              const updated = await api.adminUpdateProduct(editProduct.id, data);
              setProducts(prev => prev.map(p => p.id === editProduct.id ? updated : p));
            } else {
              const created = await api.adminCreateProduct(data);
              setProducts(prev => [...prev, created]);
            }
            setShowProductForm(false);
            toast.success(editProduct ? 'Product updated' : 'Product created');
          }}
        />
      )}

      {chatOpen && <ChatWidget onClose={() => { setChatOpen(false); setTab('orders'); }} />}
    </MainLayout>
  );
}

function ProductFormModal({ product, onClose, onSave }: { product: any; onClose: () => void; onSave: (d: any) => Promise<void> }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    compareAtPrice: product?.compareAtPrice || '',
    category: product?.category || '',
    stock: product?.stock || '',
    sizes: product?.sizes?.join(', ') || '',
    colors: product?.colors?.join(', ') || '',
    tags: product?.tags?.join(', ') || '',
    images: product?.images?.join(', ') || '',
    featured: product?.featured || false,
    trending: product?.trending || false,
    rating: product?.rating || 4.5,
    reviewCount: product?.reviewCount || 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...form,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
        stock: Number(form.stock),
        rating: Number(form.rating),
        reviewCount: Number(form.reviewCount),
        sizes: form.sizes.split(',').map((s: string) => s.trim()).filter(Boolean),
        colors: form.colors.split(',').map((s: string) => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map((s: string) => s.trim()).filter(Boolean),
        images: form.images.split(',').map((s: string) => s.trim()).filter(Boolean),
        slug: form.name.toLowerCase().replace(/\s+/g, '-'),
      });
    } finally {
      setSaving(false);
    }
  };

  const f = (key: string) => ({ value: (form as any)[key], onChange: (e: any) => setForm(p => ({ ...p, [key]: e.target.value })) });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-lg">{product ? 'Edit Product' : 'Add Product'}</h3>
          <button onClick={onClose} className="cursor-pointer hover:opacity-70"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {[['name', 'Name'], ['description', 'Description'], ['category', 'Category'], ['sizes', 'Sizes (comma separated)'], ['colors', 'Colors (comma separated)'], ['tags', 'Tags (comma separated)'], ['images', 'Image URLs (comma separated)']].map(([key, label]) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
              <input {...f(key)} required={['name','description','category','images'].includes(key)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            {[['price', 'Price (KES)'], ['compareAtPrice', 'Compare Price'], ['stock', 'Stock']].map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                <input type="number" {...f(key)} required={key !== 'compareAtPrice'} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" />
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            {[['featured', 'Featured'], ['trending', 'Trending']].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))} className="rounded" />
                {label}
              </label>
            ))}
          </div>
          <button type="submit" disabled={saving} className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-700 disabled:opacity-50 cursor-pointer transition-colors flex items-center justify-center gap-2">
            {saving ? 'Saving...' : <><Check size={16} /> {product ? 'Update' : 'Create'} Product</>}
          </button>
        </form>
      </div>
    </div>
  );
}
