import { Server, Socket } from 'socket.io';

export function setupSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('[Socket] Client connected:', socket.id);

    // Client sends their userId after connecting so we can route notifications
    socket.on('join', (userId: string) => {
      socket.join(userId);
      socket.join('admin-room');
      console.log(`[Socket] User ${userId} joined rooms`);
    });

    socket.on('chat-message', (data: { senderId: string; senderName: string; content: string }) => {
      io.to('admin-room').emit('chat-message', {
        id: Date.now().toString(),
        senderId: data.senderId,
        senderName: data.senderName,
        content: data.content,
        read: false,
        createdAt: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Client disconnected:', socket.id);
    });
  });
}
