import { useEffect, useRef, useState, ReactNode } from 'react';
import { AnimatePresence } from 'motion/react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import { ReviewModal } from '../components/ReviewModal';

const KEY = 'grind-reviewed';

export const getDismissed = (): Set<string> => {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { return new Set(); }
};

export const dismiss = (id: string) => {
  const s = getDismissed(); s.add(id);
  localStorage.setItem(KEY, JSON.stringify([...s]));
};

export interface ReviewItem {
  productId: string;
  productName: string;
  productImage: string;
  orderId: string;
}

async function fetchPendingReviews(): Promise<ReviewItem[]> {
  const dismissed = getDismissed();
  const res = await api.getMyOrders() as any;
  const orders: any[] = res?.data ?? res ?? [];
  const seen = new Set<string>();
  const out: ReviewItem[] = [];

  for (const order of orders.filter((o: any) => o.status === 'delivered')) {
    for (const item of (Array.isArray(order.items) ? order.items.filter(Boolean) : [])) {
      const pid = item.product_id || item.productId || '';
      if (!pid || seen.has(pid) || dismissed.has(pid)) continue;
      seen.add(pid);

      try {
        const { reviewed } = await api.checkReviewed(pid);
        if (reviewed) { dismiss(pid); continue; }
      } catch { continue; }

      out.push({
        productId: pid,
        productName: item.product_name || item.productName || 'Product',
        productImage: item.product_image || item.productImage || '',
        orderId: order.id,
      });
    }
  }
  return out;
}

export function ReviewPromptProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  // Track which user ID we last ran for — re-runs when a different user logs in
  const lastUserId = useRef<string | null>(null);
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [current, setCurrent] = useState<ReviewItem | null>(null);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;
    // Already ran for this user
    if (lastUserId.current === user.id) return;
    lastUserId.current = user.id;

    const t = setTimeout(async () => {
      try {
        const items = await fetchPendingReviews();
        if (!items.length) return;
        setCurrent(items[0]);
        setQueue(items.slice(1, 3));
      } catch { /* never crash */ }
    }, 3500);

    return () => clearTimeout(t);
  }, [isAuthenticated, isLoading, user]);

  // Reset when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      lastUserId.current = null;
      setCurrent(null);
      setQueue([]);
    }
  }, [isAuthenticated]);

  const next = () => {
    setCurrent(null);
    setTimeout(() => {
      if (queue.length) { setCurrent(queue[0]); setQueue(q => q.slice(1)); }
    }, 350);
  };

  return (
    <>
      {children}
      <AnimatePresence>
        {current && (
          <ReviewModal
            key={current.productId}
            productId={current.productId}
            productName={current.productName}
            productImage={current.productImage}
            orderId={current.orderId}
            onClose={() => { dismiss(current.productId); next(); }}
            onSubmitted={() => next()}
          />
        )}
      </AnimatePresence>
    </>
  );
}
