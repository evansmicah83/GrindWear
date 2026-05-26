import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Notification } from '../types';
import { mockApi } from '../services/mockApi';
import { socketService } from '../services/socketService';

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

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    setupSocketListeners();

    return () => {
      socketService.off('notification', handleNewNotification);
    };
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await mockApi.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const setupSocketListeners = () => {
    socketService.on('notification', handleNewNotification);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
