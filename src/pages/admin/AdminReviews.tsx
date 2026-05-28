import { useEffect, useState } from 'react';
import { Search, Star, Trash2, CheckCircle, XCircle, EyeOff } from 'lucide-react';
import { api } from '../../services/api';
import { formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';
import Swal from 'sweetalert2';

export function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.adminGetReviews();
      setReviews(res.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const toggleApprove = async (id: string, current: boolean) => {
    try {
      await api.adminUpdateReview(id, { is_approved: !current });
      setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: !current } : r));
    } catch (e: any) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: e.message || 'Failed', showConfirmButton: false, timer: 2000 });
    }
  };

  const deleteReview = async (id: string) => {
    const result = await Swal.fire({
      title: 'Delete review?',
      text: 'This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#dc2626',
      cancelButtonText: 'Cancel',
      customClass: { popup: 'rounded-2xl font-sans' },
    });
    if (!result.isConfirmed) return;
    try {
      await api.adminDeleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (e: any) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: e.message || 'Failed', showConfirmButton: false, timer: 2000 });
    }
  };

  const filtered = reviews.filter(r => {
    const matchSearch = !search ||
      r.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.body?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'approved' ? r.is_approved : !r.is_approved);
    return matchSearch && matchFilter;
  });

  const stats = {
    total: reviews.length,
    approved: reviews.filter(r => r.is_approved).length,
    pending: reviews.filter(r => !r.is_approved).length,
    avg: reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—',
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Reviews</h1>
        <p className="text-gray-500 text-sm">{stats.total} total reviews</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900' },
          { label: 'Approved', value: stats.approved, color: 'text-green-600' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
          { label: 'Avg Rating', value: stats.avg, color: 'text-amber-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search product, reviewer or content..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <div className="flex gap-2">
          {(['all', 'approved', 'pending'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-colors cursor-pointer',
                filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300')}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            No reviews found
          </div>
        ) : filtered.map(review => (
          <div key={review.id} className={cn('bg-white rounded-2xl border shadow-sm p-4 transition-all', review.is_approved ? 'border-gray-100' : 'border-yellow-200 bg-yellow-50/30')}>
            <div className="flex items-start gap-3">
              {/* Product image */}
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {review.product_image
                  ? <img src={review.product_image} alt={review.product_name} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                  : <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">📦</div>
                }
              </div>

              <div className="flex-1 min-w-0">
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-bold text-gray-900 text-sm truncate">{review.product_name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {/* Stars */}
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={12} className={s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                        ))}
                      </div>
                      {/* Reviewer */}
                      <div className="flex items-center gap-1">
                        {review.avatar_url
                          ? <img src={review.avatar_url} className="w-4 h-4 rounded-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                          : <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[9px] font-bold">{(review.user_name || 'A')[0]}</div>
                        }
                        <span className="text-xs text-gray-500">{review.user_name}</span>
                        {review.anonymous && <EyeOff size={10} className="text-gray-400" />}
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0',
                    review.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
                    {review.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </div>

                {/* Body */}
                {review.body && (
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-2">{review.body}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => toggleApprove(review.id, review.is_approved)}
                    className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
                      review.is_approved
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200')}
                  >
                    {review.is_approved ? <><XCircle size={12} /> Unapprove</> : <><CheckCircle size={12} /> Approve</>}
                  </button>
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
