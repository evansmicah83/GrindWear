import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Bell, BellRing, Check, Trash2, Package, MessageCircle, ShoppingBag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '../contexts/NotificationsContext';
import { useUIStore } from '../stores/uiStore';
import { formatDate } from '../lib/utils';
import { cn } from '../lib/utils';

const TYPE_ICONS: Record<string, any> = {
  order: Package,
  message: MessageCircle,
  product: ShoppingBag,
  system: Bell,
};

const TYPE_COLORS: Record<string, string> = {
  order: 'bg-blue-100 text-blue-600',
  message: 'bg-green-100 text-green-600',
  product: 'bg-purple-100 text-purple-600',
  system: 'bg-gray-100 text-gray-600',
};

export function NotificationsModal() {
  const navigate = useNavigate();
  const { notificationsOpen, setNotifications } = useUIStore();
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!notificationsOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notificationsOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setNotifications(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleClick = (n: any) => {
    markAsRead(n.id);
    if (n.link) { navigate(n.link); setNotifications(false); }
  };

  return (
    <AnimatePresence>
      {notificationsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 pointer-events-none">
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, x: 40, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.97 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="pointer-events-auto w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden mt-14"
              style={{ maxHeight: 'calc(100vh - 5rem)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <Bell size={18} className="text-gray-900" />
                  <span className="font-black text-gray-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{unreadCount} new</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button onClick={clearAll}
                      className="text-xs font-semibold text-red-500 hover:text-red-600 cursor-pointer px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                      Clear all
                    </button>
                  )}
                  <button onClick={() => setNotifications(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <X size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                      <BellRing size={28} className="text-gray-300" />
                    </div>
                    <p className="font-bold text-gray-900 mb-1">All caught up!</p>
                    <p className="text-sm text-gray-400">No notifications yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {notifications.map(n => {
                      const Icon = TYPE_ICONS[n.type] || Bell;
                      return (
                        <motion.div
                          key={n.id}
                          layout
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          onClick={() => handleClick(n)}
                          className={cn(
                            'flex items-start gap-3 px-5 py-4 transition-colors',
                            n.link ? 'cursor-pointer hover:bg-gray-50' : '',
                            !n.read ? 'bg-blue-50/40' : ''
                          )}
                        >
                          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5', TYPE_COLORS[n.type] || 'bg-gray-100 text-gray-600')}>
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className={cn('text-sm font-semibold text-gray-900 leading-snug', !n.read && 'font-bold')}>{n.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                                <p className="text-[11px] text-gray-400 mt-1.5">{formatDate(n.createdAt)}</p>
                              </div>
                              <div className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
                                {!n.read && (
                                  <button
                                    onClick={e => { e.stopPropagation(); markAsRead(n.id); }}
                                    className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
                                    title="Mark as read"
                                  >
                                    <Check size={13} />
                                  </button>
                                )}
                                <button
                                  onClick={e => { e.stopPropagation(); deleteNotification(n.id); }}
                                  className="p-1.5 rounded-lg hover:bg-red-100 text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
