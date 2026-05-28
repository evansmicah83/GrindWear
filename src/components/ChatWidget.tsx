import { useEffect, useRef, useState } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { io } from 'socket.io-client';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  content: string;
  createdAt: string;
}

interface Props {
  onClose: () => void;
}

export function ChatWidget({ onClose }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    api.getMessages().then(setMessages).catch(() => {});

    socketRef.current = io('http://localhost:3001');
    socketRef.current.emit('join', user?.id);
    socketRef.current.on('chat-message', (msg: Message) => {
      setMessages(prev => [...prev.filter(m => m.id !== msg.id), msg]);
    });

    return () => socketRef.current?.disconnect();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const msg = await api.sendMessage(input.trim());
      setMessages(prev => [...prev, msg]);
      setInput('');
    } catch {
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed z-50 flex flex-col overflow-hidden bg-white shadow-2xl border border-gray-100
      inset-0 rounded-none
      sm:inset-auto sm:bottom-6 sm:right-6 sm:w-80 sm:rounded-2xl sm:h-[460px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} />
          <span className="font-semibold text-sm">Support Chat</span>
          <span className="w-2 h-2 rounded-full bg-green-400 ml-1" />
        </div>
        <button onClick={onClose} className="hover:opacity-70 cursor-pointer transition-opacity"><X size={18} /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-center text-xs text-gray-400 mt-8">Send a message to start chatting with support</p>
        )}
        {messages.map(msg => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${isMe ? 'bg-gray-900 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'}`}>
                {!isMe && <p className="text-[10px] font-semibold text-blue-600 mb-0.5">{msg.senderName}</p>}
                <p>{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-gray-400' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-100 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400"
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          className="p-2 bg-gray-900 text-white rounded-xl hover:bg-gray-700 disabled:opacity-40 cursor-pointer transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
