import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Notification } from '../types';
import { api } from '../services/api';
import { socketService } from '../services/socketService';
import { useAuth } from './AuthContext';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

function mapNotification(n: any): Notification {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    read: n.read,
    createdAt: n.createdAt || n.created_at,
    link: n.link,
  };
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      return;
    }

    // Load from DB
    setIsLoading(true);
    api.getNotifications()
      .then(r => setNotifications(r.data.map(mapNotification)))
      .catch(() => {})
      .finally(() => setIsLoading(false));

    // Join socket room for real-time
    socketService.joinRoom(user.id);

    const handleNew = (n: any) => {
      setNotifications(prev => [mapNotification(n), ...prev]);
    };
    socketService.on('notification', handleNew);

    return () => { socketService.off('notification', handleNew); };
  }, [isAuthenticated, user?.id]);

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    api.markNotificationRead(id).catch(() => {});
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    api.markAllNotificationsRead().catch(() => {});
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    api.deleteNotification(id).catch(() => {});
  };

  const clearAll = async () => {
    setNotifications([]);
    api.clearNotifications().catch(() => {});
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification, clearAll }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider');
  return ctx;
}
