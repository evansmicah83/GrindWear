import { io, Socket } from 'socket.io-client';
import type { Message, Notification } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private mockMode = true;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(url: string = 'ws://localhost:3001') {
    if (this.mockMode) {
      console.log('[Socket] Mock mode enabled - simulating real-time events');
      this.simulateMockEvents();
      return;
    }

    this.socket = io(url, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected');
    });

    this.socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('[Socket] Error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    if (this.socket && !this.mockMode) {
      this.socket.on(event, callback as any);
    }
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }

    if (this.socket && !this.mockMode) {
      this.socket.off(event, callback as any);
    }
  }

  emit(event: string, data: any) {
    if (this.socket && !this.mockMode) {
      this.socket.emit(event, data);
    } else {
      console.log(`[Socket Mock] Emitting ${event}:`, data);
    }
  }

  private simulateMockEvents() {
    setTimeout(() => {
      this.trigger('notification', {
        id: Date.now().toString(),
        type: 'system',
        title: 'Welcome!',
        message: 'Connected to GRIND BYTE platform',
        read: false,
        createdAt: new Date().toISOString()
      });
    }, 2000);

    setTimeout(() => {
      this.trigger('user-online', { userId: 'admin-1', online: true });
    }, 3000);

    setInterval(() => {
      if (Math.random() > 0.7) {
        this.trigger('typing', {
          userId: 'admin-1',
          conversationId: 'conv-1',
          isTyping: true
        });

        setTimeout(() => {
          this.trigger('typing', {
            userId: 'admin-1',
            conversationId: 'conv-1',
            isTyping: false
          });
        }, 2000);
      }
    }, 10000);
  }

  private trigger(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  sendMessage(message: Message) {
    this.emit('chat-message', message);

    setTimeout(() => {
      const autoReply: Message = {
        id: Date.now().toString(),
        senderId: 'admin-1',
        senderName: 'Support Team',
        receiverId: message.senderId,
        content: 'Thank you for your message! Our team will respond shortly.',
        read: false,
        createdAt: new Date().toISOString()
      };
      this.trigger('chat-message', autoReply);
    }, 2000);
  }

  markMessageAsRead(messageId: string) {
    this.emit('message-read', { messageId });
  }

  joinConversation(conversationId: string) {
    this.emit('join-conversation', { conversationId });
  }

  leaveConversation(conversationId: string) {
    this.emit('leave-conversation', { conversationId });
  }

  startTyping(conversationId: string) {
    this.emit('typing', { conversationId, isTyping: true });
  }

  stopTyping(conversationId: string) {
    this.emit('typing', { conversationId, isTyping: false });
  }
}

export const socketService = new SocketService();
