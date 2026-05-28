import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Save, Plus, Trash2, Upload, Pencil, X } from 'lucide-react';
import { api } from '../../services/api';
import { slugify } from '../../lib/utils';
import { toast } from 'sonner';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36'];
const COLORS = [
  { name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' },
  { name: 'Gray', hex: '#808080' }, { name: 'Navy', hex: '#1E3A5F' },
  { name: 'Blue', hex: '#3B82F6' }, { name: 'Beige', hex: '#F5F0E8' },
  { name: 'Khaki', hex: '#C3B091' }, { name: 'Olive', hex: '#6B7C3A' },
];

export function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // Category modal state
  const [catModal, setCatModal] = useState(false);
  const [catEdit, setCatEdit] = useState<any>(null); // null = create, object = edit
  const [catForm, setCatForm] = useState({ name: '', description: '', image_url: '' });
  const [catSaving, setCatSaving] = useState(false);
  const [catDeleting, setCatDeleting] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '', slug: '', short_description: '', description: '',
    price: '', compare_price: '', sku: '', category_id: '',
    is_active: true, is_featured: false, is_new: false,
    tags: '',
  });

  const [variants, setVariants] = useState<any[]>([]);
  const [images, setImages] = useState<{ url: string; alt_text: string }[]>([]);
  const [newVariant, setNewVariant] = useState({ size: 'M', color: 'Black', color_hex: '#000000', stock_qty: 0 });

  const loadCategories = () => api.adminGetCategories().then(r => setCategories(r.data)).catch(() => api.getCategories().then(r => setCategories(r.data)));

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      api.adminGetProducts().then(r => {
        const p = r.data.find((x: any) => x.id === id);
        if (!p) { toast.error('Product not found'); navigate('/admin/products'); return; }
        setForm({
          name: p.name || '', slug: p.slug || '',
          short_description: p.short_description || '',
          description: p.description || '',
          price: p.price || '', compare_price: p.compare_price || '',
          sku: p.sku || '', category_id: p.category_id || '',
          is_active: p.is_active ?? true, is_featured: p.is_featured ?? false,
          is_new: p.is_new ?? false, tags: (p.tags || []).join(', '),
        });
        setVariants(Array.isArray(p.variants) ? p.variants.filter(Boolean) : []);
        setImages(Array.isArray(p.images) ? p.images.filter(Boolean).map((img: any) =>
          typeof img === 'string' ? { url: img, alt_text: '' } : { url: img.url || '', alt_text: img.alt_text || '' }
        ) : []);
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price as string),
        compare_price: form.compare_price ? parseFloat(form.compare_price as string) : null,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        variants,
        images,
      };
      if (isEdit) {
        await api.adminUpdateProduct(id!, payload);
        toast.success('Product updated');
      } else {
        await api.adminCreateProduct(payload);
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const openCreateCat = () => { setCatEdit(null); setCatForm({ name: '', description: '', image_url: '' }); setCatModal(true); };
  const openEditCat = (cat: any) => { setCatEdit(cat); setCatForm({ name: cat.name, description: cat.description || '', image_url: cat.image_url || '' }); setCatModal(true); };

  const saveCat = async () => {
    if (!catForm.name.trim()) { toast.error('Category name is required'); return; }
    setCatSaving(true);
    try {
      if (catEdit) {
        await api.adminUpdateCategory(catEdit.id, catForm);
        toast.success('Category updated');
      } else {
        const res = await api.adminCreateCategory(catForm);
        set('category_id', res.data.id);
        toast.success('Category created');
      }
      await loadCategories();
      setCatModal(false);
    } catch (err: any) { toast.error(err.message || 'Failed to save category'); }
    finally { setCatSaving(false); }
  };

  const deleteCat = async (catId: string) => {
    setCatDeleting(catId);
    try {
      await api.adminDeleteCategory(catId);
      if (form.category_id === catId) set('category_id', '');
      await loadCategories();
      toast.success('Category deleted');
    } catch (err: any) { toast.error(err.message || 'Failed to delete category'); }
    finally { setCatDeleting(null); }
  };

  const addVariant = () => {
    setVariants(v => [...v, { ...newVariant, sku_variant: `${form.sku || 'SKU'}-${newVariant.size}-${newVariant.color.toUpperCase().slice(0, 3)}` }]);
  };

  const removeVariant = (i: number) => setVariants(v => v.filter((_, idx) => idx !== i));

  const addImage = () => setImages(imgs => [...imgs, { url: '', alt_text: '' }]);
  const removeImage = (i: number) => setImages(imgs => imgs.filter((_, idx) => idx !== i));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/admin/products')} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900">{isEdit ? 'Edit Product' : 'New Product'}</h1>
            <p className="text-gray-500 text-sm">{isEdit ? `Editing: ${form.name}` : 'Fill in the details below'}</p>
          </div>
        </div>
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 cursor-pointer transition-colors">
          <Save size={16} /> {saving ? 'Saving...' : 'Save Product'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — main fields */}
        <div className="lg:col-span-2 space-y-5">

          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-gray-900">Basic Info</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Product Name</label>
              <input value={form.name} onChange={e => { set('name', e.target.value); set('slug', slugify(e.target.value)); }} required placeholder="Classic Black Hoodie" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Slug</label>
              <input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="classic-black-hoodie" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-gray-600" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Short Description <span className="normal-case text-gray-400">({form.short_description.length}/140)</span></label>
              <input value={form.short_description} onChange={e => e.target.value.length <= 140 && set('short_description', e.target.value)} placeholder="One-line product summary" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} placeholder="Full product description..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Tags <span className="normal-case text-gray-400">(comma separated)</span></label>
              <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="streetwear, casual, trending" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Images</h2>
              <button type="button" onClick={addImage} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                <Plus size={14} /> Add Image
              </button>
            </div>
            {images.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No images yet. Upload a file or paste an image URL.</p>}
            {images.map((img, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  {/* Preview */}
                  {img.url && (
                    <div className="w-full h-32 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                      <img
                        src={img.url}
                        alt="preview"
                        className="w-full h-full object-cover"
                        onError={e => { (e.currentTarget.parentElement!.style.display = 'none'); }}
                      />
                    </div>
                  )}
                  {/* File upload */}
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-600 transition-colors">
                    <Upload size={14} />
                    {img.url ? 'Replace Image' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const dataUrl = ev.target?.result as string;
                          setImages(imgs => imgs.map((x, idx) => idx === i ? { ...x, url: dataUrl } : x));
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="hidden"
                    />
                  </label>
                  {/* Or paste URL */}
                  <input
                    value={img.url.startsWith('data:') ? '' : img.url}
                    onChange={e => setImages(imgs => imgs.map((x, idx) => idx === i ? { ...x, url: e.target.value } : x))}
                    placeholder="Or paste image URL: https://..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    value={img.alt_text}
                    onChange={e => setImages(imgs => imgs.map((x, idx) => idx === i ? { ...x, alt_text: e.target.value } : x))}
                    placeholder="Alt text (optional)"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button type="button" onClick={() => removeImage(i)} className="p-2 hover:bg-red-50 rounded-lg cursor-pointer mt-0.5"><Trash2 size={14} className="text-red-400" /></button>
              </div>
            ))}
          </div>

          {/* Variants */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-gray-900">Variants</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Size</label>
                <select value={newVariant.size} onChange={e => setNewVariant(v => ({ ...v, size: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none bg-white cursor-pointer">
                  {SIZES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Color</label>
                <select value={newVariant.color} onChange={e => { const c = COLORS.find(x => x.name === e.target.value); setNewVariant(v => ({ ...v, color: e.target.value, color_hex: c?.hex || '#000000' })); }} className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none bg-white cursor-pointer">
                  {COLORS.map(c => <option key={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Stock</label>
                <input type="number" min="0" value={newVariant.stock_qty} onChange={e => setNewVariant(v => ({ ...v, stock_qty: parseInt(e.target.value) || 0 }))} className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none" />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={addVariant} className="w-full flex items-center justify-center gap-1 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 cursor-pointer transition-colors">
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            {variants.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-100">{['Size', 'Color', 'Stock', ''].map(h => <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-gray-500">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {variants.map((v, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium">{v.size}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: v.color_hex }} />
                            {v.color}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" min="0" value={v.stock_qty} onChange={e => setVariants(vs => vs.map((x, idx) => idx === i ? { ...x, stock_qty: parseInt(e.target.value) || 0 } : x))} className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none" />
                        </td>
                        <td className="px-3 py-2">
                          <button type="button" onClick={() => removeVariant(i)} className="p-1 hover:bg-red-50 rounded cursor-pointer"><Trash2 size={13} className="text-red-400" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right — sidebar fields */}
        <div className="space-y-5">
          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-gray-900">Pricing</h2>
            {[['price', 'Price (KES)', true], ['compare_price', 'Compare Price (KES)', false], ['sku', 'SKU', false]].map(([key, label, req]) => (
              <div key={key as string}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">{label as string}</label>
                <input type={key === 'sku' ? 'text' : 'number'} value={(form as any)[key as string]} onChange={e => set(key as string, e.target.value)} required={req as boolean} placeholder={key === 'price' ? '8500' : key === 'compare_price' ? '10500' : 'GB-HOD-001'} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>

          {/* Category */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Category</h2>
              <button type="button" onClick={openCreateCat} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                <Plus size={13} /> New
              </button>
            </div>
            <select value={form.category_id} onChange={e => set('category_id', e.target.value)} required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white">
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {/* Category list with edit/delete */}
            <div className="space-y-1 pt-1">
              {categories.map(c => (
                <div key={c.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50 group">
                  <span className="text-sm text-gray-700 truncate">{c.name}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => openEditCat(c)} className="p-1 hover:bg-gray-200 rounded cursor-pointer"><Pencil size={11} className="text-gray-500" /></button>
                    <button type="button" onClick={() => deleteCat(c.id)} disabled={catDeleting === c.id} className="p-1 hover:bg-red-100 rounded cursor-pointer"><Trash2 size={11} className="text-red-400" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="font-bold text-gray-900">Status</h2>
            {[['is_active', 'Active', 'Visible in store'], ['is_featured', 'Featured', 'Show on homepage'], ['is_new', 'New Arrival', 'Show in new arrivals']].map(([key, label, desc]) => (
              <label key={key} className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <div className={`relative w-10 h-6 rounded-full transition-colors ${(form as any)[key] ? 'bg-blue-500' : 'bg-gray-200'}`} onClick={() => set(key, !(form as any)[key])}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${(form as any)[key] ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {catModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-gray-900">{catEdit ? 'Edit Category' : 'New Category'}</h3>
              <button type="button" onClick={() => setCatModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Name *</label>
                <input value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Hoodies" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Description</label>
                <input value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Image</label>
                {catForm.image_url && <img src={catForm.image_url} alt="" className="mb-2 w-full h-24 object-cover rounded-xl" onError={e => (e.currentTarget.style.display = 'none')} />}
                <label className="flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-600 transition-colors mb-2">
                  <Upload size={14} />
                  {catForm.image_url ? 'Replace Image' : 'Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => setCatForm(f => ({ ...f, image_url: ev.target?.result as string }));
                    reader.readAsDataURL(file);
                  }} />
                </label>
                <input value={catForm.image_url.startsWith('data:') ? '' : catForm.image_url} onChange={e => setCatForm(f => ({ ...f, image_url: e.target.value }))} placeholder="Or paste image URL: https://..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setCatModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button type="button" onClick={saveCat} disabled={catSaving} className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 cursor-pointer">
                {catSaving ? 'Saving...' : catEdit ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
