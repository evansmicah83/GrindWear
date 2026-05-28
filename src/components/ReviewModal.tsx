import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, EyeOff, Eye } from 'lucide-react';
import { api } from '../services/api';
import Swal from 'sweetalert2';

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];

function Stars({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 focus:outline-none"
          >
            <Star size={30} className={`transition-all duration-100 ${active >= n ? 'fill-amber-400 text-amber-400 scale-110' : 'fill-transparent text-gray-200'}`} />
          </button>
        ))}
      </div>
      <span className={`text-xs font-bold h-4 transition-colors ${active ? 'text-amber-500' : 'text-transparent'}`}>
        {LABELS[active]}
      </span>
    </div>
  );
}

interface Props {
  productId: string;
  productName: string;
  productImage: string;
  orderId: string;
  onClose: () => void;
  onSubmitted?: (productId: string) => void;
}

export function ReviewModal({ productId, productName, productImage, orderId, onClose, onSubmitted }: Props) {
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [anon, setAnon] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!rating) { setErr('Please select a star rating'); return; }
    setErr(''); setBusy(true);
    try {
      await api.addReview({ product_id: productId, order_id: orderId, rating, body: body.trim(), anonymous: anon });
      onClose();
      onSubmitted?.(productId);
      Swal.fire({
        toast: true, position: 'top-end', icon: 'success',
        title: 'Review submitted! 🎉', text: 'Your review is now live.',
        showConfirmButton: false, timer: 3000, timerProgressBar: true,
        background: '#111827', color: '#fff', iconColor: '#34d399',
        customClass: { popup: 'rounded-2xl' },
      });
    } catch (e: any) {
      setErr(e.message || 'Something went wrong.');
    } finally { setBusy(false); }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center px-0 sm:px-4"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          onClick={e => e.stopPropagation()}
          className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />
          <div className="flex justify-center pt-2.5 sm:hidden">
            <div className="w-8 h-1 bg-gray-200 rounded-full" />
          </div>

          <div className="px-5 pt-3 pb-5 sm:px-6 sm:pt-5 sm:pb-6 space-y-4">
            {/* header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-black text-gray-900">Rate your purchase</h2>
                <p className="text-xs text-gray-400 mt-0.5">Help other shoppers with your feedback</p>
              </div>
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-400 transition-colors cursor-pointer flex-shrink-0 ml-2">
                <X size={13} />
              </button>
            </div>

            {/* product */}
            <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                {productImage
                  ? <img src={productImage} alt={productName} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                  : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                }
              </div>
              <p className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug">{productName}</p>
            </div>

            {/* stars */}
            <Stars value={rating} onChange={v => { setRating(v); setErr(''); }} />

            {/* textarea */}
            <textarea
              value={body} onChange={e => setBody(e.target.value)}
              placeholder="Share your experience… (optional)"
              rows={2}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none placeholder:text-gray-300 transition-all"
            />

            {/* anonymous */}
            <button type="button" onClick={() => setAnon(a => !a)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition-all cursor-pointer text-left ${anon ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${anon ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {anon ? <EyeOff size={13} /> : <Eye size={13} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900">Post anonymously</p>
                <p className="text-[11px] text-gray-400">{anon ? 'Name hidden publicly' : 'Name visible publicly'}</p>
              </div>
              <div className={`w-9 h-5 rounded-full relative flex-shrink-0 transition-colors ${anon ? 'bg-gray-900' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${anon ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </button>

            {err && <p className="text-xs text-red-500 font-semibold -mt-1">⚠ {err}</p>}

            {/* actions */}
            <div className="flex gap-2.5 pt-0.5">
              <button onClick={onClose} className="flex-1 py-3 text-sm font-semibold text-gray-500 border-2 border-gray-100 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={submit} disabled={busy}
                className="flex-1 py-3 text-sm font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {busy
                  ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending</>
                  : <><Star size={13} className="fill-amber-400 text-amber-400" />Submit</>
                }
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
