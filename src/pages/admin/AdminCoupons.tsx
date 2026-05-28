import { useEffect, useState } from 'react';
import { Plus, Copy, Check } from 'lucide-react';
import { api } from '../../services/api';
import { formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', min_order_amount: '', usage_limit: '', expires_at: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const res = await api.adminGetCoupons(); setCoupons(res.data); }
    catch { toast.error('Failed to load coupons'); }
    finally { setLoading(false); }
  };

  const generate = () => {
    const code = 'GRIND' + Math.random().toString(36).slice(2, 6).toUpperCase();
    setForm(f => ({ ...f, code }));
  };

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.adminCreateCoupon({ ...form, value: parseFloat(form.value), min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : null, usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null });
      setCoupons(c => [res.data, ...c]);
      setShowForm(false);
      setForm({ code: '', type: 'percentage', value: '', min_order_amount: '', usage_limit: '', expires_at: '' });
      toast.success('Coupon created');
    } catch (err: any) { toast.error(err.message || 'Failed to create coupon'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Coupons</h1>
          <p className="text-gray-500 text-sm">{coupons.length} coupons</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors cursor-pointer">
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Code', 'Type', 'Value', 'Used / Limit', 'Min Order', 'Expires', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? Array.from({ length: 3 }).map((_, i) => (
              <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-8 bg-gray-100 rounded animate-pulse" /></td></tr>
            )) : coupons.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-gray-900">{c.code}</td>
                <td className="px-4 py-3 capitalize text-gray-600">{c.type}</td>
                <td className="px-4 py-3 font-semibold">{c.type === 'percentage' ? `${c.value}%` : `KES ${c.value}`}</td>
                <td className="px-4 py-3 text-gray-600">{c.used_count} / {c.usage_limit || '∞'}</td>
                <td className="px-4 py-3 text-gray-600">{c.min_order_amount ? `KES ${c.min_order_amount}` : '—'}</td>
                <td className="px-4 py-3 text-gray-500">{c.expires_at ? formatDate(c.expires_at) : '—'}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs font-semibold px-2 py-1 rounded-full', c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => copy(c.code)} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                    {copied === c.code ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && coupons.length === 0 && <p className="text-center text-gray-400 py-12">No coupons yet</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-bold text-lg">Create Coupon</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={submit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Code</label>
                <div className="flex gap-2">
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required placeholder="WELCOME10" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="button" onClick={generate} className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold hover:bg-gray-50 cursor-pointer">Auto</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none cursor-pointer">
                    <option value="percentage">Percentage %</option>
                    <option value="fixed">Fixed KES</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Value</label>
                  <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} required placeholder={form.type === 'percentage' ? '10' : '500'} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Min Order (KES)</label>
                  <input type="number" value={form.min_order_amount} onChange={e => setForm(f => ({ ...f, min_order_amount: e.target.value }))} placeholder="0" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Usage Limit</label>
                  <input type="number" value={form.usage_limit} onChange={e => setForm(f => ({ ...f, usage_limit: e.target.value }))} placeholder="Unlimited" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Expires At</label>
                <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-700 disabled:opacity-50 cursor-pointer transition-colors">
                {saving ? 'Creating...' : 'Create Coupon'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
