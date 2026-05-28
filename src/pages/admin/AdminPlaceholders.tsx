import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, AlertTriangle, Package, TrendingDown, TrendingUp, CheckCircle, Pencil, X, Check, Users, UserCheck, UserX, Mail, Download, Trash2, Store, Truck, Globe, Shield, Save, Plus, UserCog, Eye, EyeOff } from 'lucide-react';
import { api } from '../../services/api';
import { normalizeImageSource } from '../../lib/utils';
import { toast } from 'sonner';

export function AdminInventory() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'out' | 'low' | 'ok'>('all');
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await api.adminGetInventory(); setRows(r.data); }
    catch { toast.error('Failed to load inventory'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (row: any) => { setEditing(row.id); setEditVal(String(row.stock_qty)); };
  const cancelEdit = () => { setEditing(null); setEditVal(''); };

  const saveEdit = async (variantId: string) => {
    const qty = parseInt(editVal);
    if (isNaN(qty) || qty < 0) { toast.error('Enter a valid quantity'); return; }
    setSaving(true);
    try {
      await api.adminUpdateStock(variantId, qty);
      setRows(r => r.map(x => x.id === variantId ? { ...x, stock_qty: qty } : x));
      toast.success('Stock updated');
      setEditing(null);
    } catch (err: any) { toast.error(err.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const filtered = useMemo(() => {
    let data = rows;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(r => r.product_name?.toLowerCase().includes(q) || r.sku_variant?.toLowerCase().includes(q) || r.category_name?.toLowerCase().includes(q));
    }
    if (filter === 'out') data = data.filter(r => r.stock_qty === 0);
    else if (filter === 'low') data = data.filter(r => r.stock_qty > 0 && r.stock_qty < 10);
    else if (filter === 'ok') data = data.filter(r => r.stock_qty >= 10);
    return data;
  }, [rows, search, filter]);

  const stats = useMemo(() => ({
    total: rows.length,
    out: rows.filter(r => r.stock_qty === 0).length,
    low: rows.filter(r => r.stock_qty > 0 && r.stock_qty < 10).length,
    ok: rows.filter(r => r.stock_qty >= 10).length,
    totalUnits: rows.reduce((s, r) => s + (parseInt(r.stock_qty) || 0), 0),
  }), [rows]);

  const stockBadge = (qty: number) => {
    if (qty === 0) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700"><AlertTriangle size={10} /> Out of Stock</span>;
    if (qty < 10) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700"><TrendingDown size={10} /> Low ({qty})</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700"><CheckCircle size={10} /> In Stock ({qty})</span>;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Inventory</h1>
        <p className="text-gray-500 text-sm">{stats.total} variants · {stats.totalUnits.toLocaleString()} total units</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Variants', value: stats.total, color: 'bg-blue-50 text-blue-700', icon: <Package size={18} /> },
          { label: 'Out of Stock', value: stats.out, color: 'bg-red-50 text-red-700', icon: <AlertTriangle size={18} /> },
          { label: 'Low Stock', value: stats.low, color: 'bg-orange-50 text-orange-700', icon: <TrendingDown size={18} /> },
          { label: 'Healthy Stock', value: stats.ok, color: 'bg-green-50 text-green-700', icon: <CheckCircle size={18} /> },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`p-2 rounded-xl ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product, SKU, category..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <div className="flex gap-2">
          {(['all', 'out', 'low', 'ok'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
                filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {f === 'all' ? 'All' : f === 'out' ? `Out (${stats.out})` : f === 'low' ? `Low (${stats.low})` : `OK (${stats.ok})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Product', 'Category', 'Variant', 'SKU', 'Status', 'Stock', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-8 bg-gray-100 rounded animate-pulse" /></td></tr>
              )) : filtered.map(row => (
                <tr key={row.id} className={`hover:bg-gray-50 transition-colors ${row.stock_qty === 0 ? 'bg-red-50/30' : row.stock_qty < 10 ? 'bg-orange-50/20' : ''}`}>
                  {/* Product */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {row.image_url
                        ? <img src={normalizeImageSource(row.image_url)} alt={row.product_name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" onError={e => (e.currentTarget.style.display = 'none')} />
                        : <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0"><Package size={14} className="text-gray-400" /></div>
                      }
                      <button onClick={() => navigate(`/admin/products/${row.product_id}/edit`)} className="font-medium text-gray-900 hover:text-blue-600 text-left line-clamp-1 cursor-pointer">
                        {row.product_name}
                      </button>
                    </div>
                  </td>
                  {/* Category */}
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{row.category_name || '—'}</td>
                  {/* Variant */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: row.color_hex || '#ccc' }} />
                      <span className="text-gray-700 whitespace-nowrap">{row.size} / {row.color}</span>
                    </div>
                  </td>
                  {/* SKU */}
                  <td className="px-4 py-3 font-mono text-xs text-gray-400 whitespace-nowrap">{row.sku_variant || '—'}</td>
                  {/* Status */}
                  <td className="px-4 py-3 whitespace-nowrap">{stockBadge(parseInt(row.stock_qty))}</td>
                  {/* Stock edit */}
                  <td className="px-4 py-3">
                    {editing === row.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number" min="0" value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(row.id); if (e.key === 'Escape') cancelEdit(); }}
                          className="w-20 border border-blue-400 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button onClick={() => saveEdit(row.id)} disabled={saving} className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer"><Check size={12} /></button>
                        <button onClick={cancelEdit} className="p-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"><X size={12} /></button>
                      </div>
                    ) : (
                      <span className="font-bold text-gray-900 text-base">{row.stock_qty}</span>
                    )}
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    {editing !== row.id && (
                      <button onClick={() => startEdit(row)} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                        <Pencil size={13} className="text-gray-500" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No variants found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminReviews() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-gray-900">Reviews</h1>
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
        Reviews management coming soon
      </div>
    </div>
  );
}

export function AdminNewsletter() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await api.adminGetNewsletter(); setSubs(r.data); }
    catch { toast.error('Failed to load subscribers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id: string, current: boolean) => {
    try {
      await api.adminToggleSubscriber(id, !current);
      setSubs(s => s.map(x => x.id === id ? { ...x, is_active: !current } : x));
      toast.success(current ? 'Subscriber deactivated' : 'Subscriber activated');
    } catch (err: any) { toast.error(err.message); }
  };

  const remove = async (id: string) => {
    try {
      await api.adminDeleteSubscriber(id);
      setSubs(s => s.filter(x => x.id !== id));
      toast.success('Subscriber removed');
    } catch (err: any) { toast.error(err.message); }
    setConfirmDelete(null);
  };

  const exportCSV = () => {
    setExporting(true);
    const active = subs.filter(s => s.is_active);
    const csv = ['Email,Subscribed At', ...active.map(s => `${s.email},${new Date(s.created_at).toLocaleDateString()}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `newsletter-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    setExporting(false);
    toast.success(`Exported ${active.length} active subscribers`);
  };

  const filtered = useMemo(() => {
    let data = subs;
    if (search) data = data.filter(s => s.email.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'active') data = data.filter(s => s.is_active);
    if (filter === 'inactive') data = data.filter(s => !s.is_active);
    return data;
  }, [subs, search, filter]);

  const stats = useMemo(() => ({
    total: subs.length,
    active: subs.filter(s => s.is_active).length,
    inactive: subs.filter(s => !s.is_active).length,
    thisMonth: subs.filter(s => new Date(s.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
  }), [subs]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Newsletter</h1>
          <p className="text-gray-500 text-sm">{stats.active} active subscribers</p>
        </div>
        <button onClick={exportCSV} disabled={exporting || stats.active === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 cursor-pointer transition-colors">
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-blue-50 text-blue-700', icon: <Users size={18} /> },
          { label: 'Active', value: stats.active, color: 'bg-green-50 text-green-700', icon: <UserCheck size={18} /> },
          { label: 'Inactive', value: stats.inactive, color: 'bg-gray-50 text-gray-500', icon: <UserX size={18} /> },
          { label: 'This Month', value: stats.thisMonth, color: 'bg-purple-50 text-purple-700', icon: <TrendingUp size={18} /> },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`p-2 rounded-xl ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
                filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {f === 'all' ? `All (${stats.total})` : f === 'active' ? `Active (${stats.active})` : `Inactive (${stats.inactive})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Email', 'Status', 'Subscribed', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-8 bg-gray-100 rounded animate-pulse" /></td></tr>
            )) : filtered.map(sub => (
              <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {sub.email[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">{sub.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggle(sub.id, sub.is_active)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      sub.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}>
                    {sub.is_active ? <><UserCheck size={11} /> Active</> : <><UserX size={11} /> Inactive</>}
                  </button>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(sub.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setConfirmDelete(sub.id)} className="p-1.5 hover:bg-red-50 rounded-lg cursor-pointer transition-colors">
                    <Trash2 size={13} className="text-red-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Mail size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No subscribers found</p>
          </div>
        )}
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Remove Subscriber?</h3>
            <p className="text-gray-500 text-sm mb-5">This will permanently remove this email from the newsletter list.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={() => remove(confirmDelete)} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 cursor-pointer">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({
    store_name: '', store_email: '', store_phone: '', store_address: '',
    currency: 'KES', whatsapp_number: '', free_shipping_threshold: '2500',
    standard_shipping_cost: '300', express_shipping_cost: '600',
    meta_title: '', meta_description: '',
    facebook_url: '', instagram_url: '', twitter_url: '', tiktok_url: '',
    maintenance_mode: 'false', allow_guest_checkout: 'true', auto_approve_reviews: 'false',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'shipping' | 'social' | 'advanced' | 'admins'>('general');
  const [admins, setAdmins] = useState<any[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [adminModal, setAdminModal] = useState<{ open: boolean; admin: any | null }>({ open: false, admin: null });

  const loadAdmins = async () => {
    setAdminsLoading(true);
    try { const r = await api.adminGetAdmins(); setAdmins(r.data); }
    catch { toast.error('Failed to load admins'); }
    finally { setAdminsLoading(false); }
  };

  useEffect(() => {
    api.getSettings()
      .then(r => setSettings(s => ({ ...s, ...r.data })))
      .catch(() => {})
      .finally(() => setLoading(false));
    loadAdmins();
  }, []);

  const set = (key: string, val: string) => setSettings(s => ({ ...s, [key]: val }));
  const toggle = (key: string) => set(key, settings[key] === 'true' ? 'false' : 'true');

  const save = async () => {
    setSaving(true);
    try {
      await api.saveSettings(settings);
      toast.success('Settings saved successfully');
    } catch (err: any) { toast.error(err.message || 'Failed to save settings'); }
    finally { setSaving(false); }
  };

  const TABS = [
    { id: 'general', label: 'General', icon: <Store size={15} /> },
    { id: 'shipping', label: 'Shipping', icon: <Truck size={15} /> },
    { id: 'social', label: 'Social & SEO', icon: <Globe size={15} /> },
    { id: 'advanced', label: 'Advanced', icon: <Shield size={15} /> },
    { id: 'admins', label: 'Admins', icon: <UserCog size={15} /> },
  ] as const;

  const Field = ({ label, k, placeholder, type = 'text', hint }: { label: string; k: string; placeholder?: string; type?: string; hint?: string }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">{label}</label>
      <input
        type={type} value={settings[k] ?? ''}
        onChange={e => set(k, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );

  const Toggle = ({ label, k, desc }: { label: string; k: string; desc: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
      <button type="button" onClick={() => toggle(k)}
        className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${
          settings[k] === 'true' ? 'bg-blue-500' : 'bg-gray-200'
        }`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          settings[k] === 'true' ? 'translate-x-5' : 'translate-x-1'
        }`} />
      </button>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm">Manage your store configuration</p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 cursor-pointer transition-colors">
          <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* General */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-gray-900">Store Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Store Name" k="store_name" placeholder="GRIND BYTE" />
              <Field label="Currency" k="currency" placeholder="KES" hint="ISO currency code" />
              <Field label="Contact Email" k="store_email" placeholder="hello@grindbyte.com" type="email" />
              <Field label="Contact Phone" k="store_phone" placeholder="+254 700 000 000" />
            </div>
            <Field label="Store Address" k="store_address" placeholder="Tom Mboya Street, Nairobi, Kenya" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-gray-900">WhatsApp Chat</h2>
            <Field label="WhatsApp Number" k="whatsapp_number" placeholder="254700000000" hint="Include country code, no + or spaces e.g. 254712345678" />
          </div>
        </div>
      )}

      {/* Shipping */}
      {activeTab === 'shipping' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-gray-900">Shipping Rates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Free Shipping Threshold (KES)" k="free_shipping_threshold" placeholder="2500" type="number"
              hint="Orders above this get free shipping" />
            <Field label="Standard Shipping (KES)" k="standard_shipping_cost" placeholder="300" type="number" />
            <Field label="Express Shipping (KES)" k="express_shipping_cost" placeholder="600" type="number" />
          </div>
          <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
            <strong>Preview:</strong> Orders under KES {parseInt(settings.free_shipping_threshold || '2500').toLocaleString()} pay KES {parseInt(settings.standard_shipping_cost || '300').toLocaleString()} standard or KES {parseInt(settings.express_shipping_cost || '600').toLocaleString()} express. Free shipping above KES {parseInt(settings.free_shipping_threshold || '2500').toLocaleString()}.
          </div>
        </div>
      )}

      {/* Social & SEO */}
      {activeTab === 'social' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-gray-900">SEO</h2>
            <Field label="Meta Title" k="meta_title" placeholder="GRIND BYTE — Premium Kenyan Streetwear" />
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Meta Description</label>
              <textarea value={settings.meta_description ?? ''} onChange={e => set('meta_description', e.target.value)}
                rows={3} placeholder="Premium streetwear designed for the modern generation..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <p className="text-xs text-gray-400 mt-1">{(settings.meta_description || '').length}/160 characters</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-gray-900">Social Media</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Instagram" k="instagram_url" placeholder="https://instagram.com/grindwear_ke" />
              <Field label="Facebook" k="facebook_url" placeholder="https://facebook.com/grindbyte" />
              <Field label="Twitter / X" k="twitter_url" placeholder="https://twitter.com/grindbyte" />
              <Field label="TikTok" k="tiktok_url" placeholder="https://tiktok.com/@grindbyte" />
            </div>
          </div>
        </div>
      )}

      {/* Advanced */}
      {activeTab === 'advanced' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Advanced Settings</h2>
          <Toggle label="Maintenance Mode" k="maintenance_mode" desc="Show a maintenance page to all visitors" />
          <Toggle label="Guest Checkout" k="allow_guest_checkout" desc="Allow users to checkout without an account" />
          <Toggle label="Auto-approve Reviews" k="auto_approve_reviews" desc="Publish reviews immediately without manual approval" />
          {settings.maintenance_mode === 'true' && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700 flex items-center gap-2">
              <AlertTriangle size={15} /> Maintenance mode is ON — your store is hidden from visitors
            </div>
          )}
        </div>
      )}

      {/* Admins */}
      {activeTab === 'admins' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{admins.length} admin{admins.length !== 1 ? 's' : ''}</p>
            <button onClick={() => setAdminModal({ open: true, admin: null })}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 cursor-pointer transition-colors">
              <Plus size={14} /> Add Admin
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Email', 'Created', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {adminsLoading ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-8 bg-gray-100 rounded animate-pulse" /></td></tr>
                )) : admins.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {a.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{a.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{a.email}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(a.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setAdminModal({ open: true, admin: a })}
                        className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                        <Pencil size={13} className="text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!adminsLoading && admins.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <UserCog size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No admins found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {adminModal.open && (
        <AdminFormModal
          admin={adminModal.admin}
          onClose={() => setAdminModal({ open: false, admin: null })}
          onSave={async (data) => {
            if (adminModal.admin) {
              const r = await api.adminUpdateAdmin(adminModal.admin.id, data);
              setAdmins(prev => prev.map(a => a.id === adminModal.admin.id ? r.data : a));
              toast.success('Admin updated');
            } else {
              const r = await api.adminCreateAdmin(data);
              setAdmins(prev => [...prev, r.data]);
              toast.success('Admin created');
            }
            setAdminModal({ open: false, admin: null });
          }}
        />
      )}
    </div>
  );
}

function AdminFormModal({ admin, onClose, onSave }: { admin: any; onClose: () => void; onSave: (d: any) => Promise<void> }) {
  const [form, setForm] = useState({ name: admin?.name || '', email: admin?.email || '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const handleReset = () => {
    const newPw = generatePassword();
    setForm(f => ({ ...f, password: newPw, confirmPassword: newPw }));
    setShowPw(true);
    toast.success('Password generated — edit it if needed, then save.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin && !form.password) { toast.error('Password is required'); return; }
    if (form.password && form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password && form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      const payload: any = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      await onSave(payload);
    } catch (err: any) { toast.error(err.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{admin ? 'Edit Admin' : 'Create Admin'}</h3>
          <button onClick={onClose} className="cursor-pointer hover:opacity-70"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Password section */}
          {admin ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">New Password</label>
                <button type="button" onClick={handleReset}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer">
                  Generate Random
                </button>
              </div>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Leave blank to keep current"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                  <input type={showPw ? 'text' : 'password'} value={form.confirmPassword}
                    onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              {form.password && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                  <input type={showPw ? 'text' : 'password'} value={form.confirmPassword}
                    onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 cursor-pointer">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 cursor-pointer transition-colors">
              {saving ? 'Saving...' : admin ? 'Update Admin' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
