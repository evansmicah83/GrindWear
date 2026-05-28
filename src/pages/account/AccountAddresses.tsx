import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { AccountLayout } from './AccountLayout';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { toast } from 'sonner';

export function AccountAddresses() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: '', street: '', city: '', county: '', postalCode: '', country: 'Kenya' });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate('/login', { state: { from: '/account/addresses' } }); return; }
    api.getAddresses()
      .then((res: any) => setAddresses(res.data ?? []))
      .catch(() => toast.error('Failed to load addresses'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label || !form.street || !form.city) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      if (editingId) {
        const res: any = await api.updateAddress(editingId, form);
        setAddresses(prev => prev.map(a => a.id === editingId ? res.data : a));
        toast.success('Address updated');
      } else {
        const res: any = await api.addAddress(form);
        setAddresses(prev => [...prev, res.data]);
        toast.success('Address added');
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ label: '', street: '', city: '', county: '', postalCode: '', country: 'Kenya' });
    } catch {
      toast.error('Could not save address');
    }
  };

  const handleEdit = (addr: any) => {
    setEditingId(addr.id);
    setForm({ label: addr.label || '', street: addr.street || '', city: addr.city || '', county: addr.county || '', postalCode: addr.postalCode || addr.postal_code || '', country: addr.country || 'Kenya' });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success('Address removed');
    } catch {
      toast.error('Could not remove address');
    }
  };

  if (authLoading || loading) {
    return (
      <AccountLayout>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-gray-900">My Addresses</h1>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-700 transition-colors">
            <Plus size={16} /> Add New
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{editingId ? 'Edit Address' : 'Add New Address'}</h2>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-2 rounded-lg hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Label</label>
                  <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Home, Work, etc." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Street Address</label>
                  <input value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">City</label>
                    <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">County</label>
                    <input value={form.county} onChange={e => setForm(f => ({ ...f, county: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase">Postal Code (optional)</label>
                  <input value={form.postalCode} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors">Save</button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {addresses.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
            <MapPin size={48} className="mx-auto text-gray-200 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No addresses saved</h3>
            <p className="text-gray-500 text-sm mb-4">Add an address for faster checkout</p>
            <button onClick={() => setShowForm(true)} className="px-5 py-2 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-700 transition-colors">Add Address</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map(addr => (
              <div key={addr.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-gray-500" />
                    <p className="font-bold text-gray-900">{addr.label}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(addr)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(addr.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{addr.street}</p>
                <p className="text-sm text-gray-600">{addr.city}, {addr.county}</p>
                <p className="text-sm text-gray-500">{addr.country}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}