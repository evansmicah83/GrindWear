import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Bell, BellRing, Check, Trash2, Package, MessageCircle, ShoppingBag, Loader2 } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { useNotifications } from '../contexts/NotificationsContext';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import { cn } from '../lib/utils';

const TYPE_ICONS: Record<string, any> = {
  order: Package,
  message: MessageCircle,
  product: ShoppingBag,
  system: Bell,
};

const TYPE_COLORS: Record<string, string> = {
  order: 'bg-blue-100 text-blue-700',
  message: 'bg-green-100 text-green-700',
  product: 'bg-purple-100 text-purple-700',
  system: 'bg-gray-100 text-gray-700',
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { notifications, isLoading, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: '/notifications' } });
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bell className="w-7 h-7 text-gray-900" />
            <h1 className="text-2xl font-black text-gray-900">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Check size={16} /> Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
            <BellRing className="w-16 h-16 mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500 text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => {
              const Icon = TYPE_ICONS[n.type] || Bell;
              return (
                <div
                  key={n.id}
                  onClick={() => n.link && navigate(n.link)}
                  className={cn(
                    'flex items-start gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 transition-all shadow-sm',
                    n.read ? '' : 'border-l-4 border-l-blue-500 bg-blue-50/30',
                    n.link ? 'cursor-pointer' : ''
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', TYPE_COLORS[n.type] || 'bg-gray-100 text-gray-700')}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">{n.title}</p>
                        <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!n.read && (
                          <button onClick={() => markAsRead(n.id)} title="Mark as read" className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                            <Check size={14} />
                          </button>
                        )}
                        <button onClick={() => deleteNotification(n.id)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(n.createdAt)}</p>
                  </div>
                </div>
              );
            })}
            <button onClick={clearAll} className="w-full py-3 text-sm text-red-500 font-medium border border-gray-100 rounded-xl hover:bg-red-50 transition-colors cursor-pointer mt-4">
              Clear all notifications
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}