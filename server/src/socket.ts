import { Server, Socket } from 'socket.io';
import { db } from './db';

export function setupSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('[Socket] Client connected:', socket.id);

    socket.on('join', (userId: string) => {
      socket.join(userId);
      socket.join('admin-room');
    });

    socket.on('chat-message', (data: { senderId: string; senderName: string; senderRole: 'user' | 'admin'; content: string }) => {
      const msg = db.createMessage({
        senderId: data.senderId,
        senderName: data.senderName,
        senderRole: data.senderRole,
        content: data.content,
        read: false
      });
      // Broadcast to admin room and back to sender
      io.to('admin-room').emit('chat-message', msg);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Client disconnected:', socket.id);
    });
  });
}
