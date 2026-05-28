import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

async function generateAIResponse(userMessage: string): Promise<string> {
  const responses: Record<string, string[]> = {
    hello: [
      'Hello! 👋 Welcome to GRIND BYTE. How can I help you today?',
      'Hi there! 😊 What can I assist you with?',
      'Hey! Welcome! What brings you here?'
    ],
    order: [
      "I can help you track your order! Please reply with your order number and I'll get you the status. 📦",
      "Need help with an order? Share your order ID and I'll look it up for you! 🔍",
      "Want to check your order? Just send me your order number!"
    ],
    product: [
      "We have amazing products! Browse our collection at /products or tell me what you're looking for! 🛍️",
      "I can help you find the perfect item! What style are you interested in? 👕👖"
    ],
    price: [
      "All prices include VAT. We offer free shipping on orders over KES 5,000! 🎁",
      "Great deals on everything! Free shipping available for orders above 5,000 KES. 💰"
    ],
    shipping: [
      "We offer same-day delivery in Nairobi! Orders over KES 5,000 get free shipping. 🚚",
      "Fast delivery to Nairobi - same day available! 📍"
    ],
    return: [
      "We have a 30-day easy return policy! You can return items for any reason within 30 days. ↩️",
      "Easy returns within 30 days of purchase - hassle-free! 😊"
    ],
    payment: [
      "We accept M-Pesa and card payments securely. 💳 All transactions are encrypted.",
      "Payment options: M-Pesa & Cards. Safe, secure, and instant! 🔒"
    ],
    custom: 'Thank you for reaching out! 💬 Our team will get back to you soon. Is there anything else I can help with in the meantime?'
  };

  const lower = userMessage.toLowerCase();

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return responses.hello[Math.floor(Math.random() * responses.hello.length)];
  }
  if (lower.includes('order') || lower.includes('track')) {
    return responses.order[Math.floor(Math.random() * responses.order.length)];
  }
  if (lower.includes('product') || lower.includes('item') || lower.includes('what do you have')) {
    return responses.product[Math.floor(Math.random() * responses.product.length)];
  }
  if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
    return responses.price[Math.floor(Math.random() * responses.price.length)];
  }
  if (lower.includes('shipping') || lower.includes('delivery') || lower.includes('how long')) {
    return responses.shipping[Math.floor(Math.random() * responses.shipping.length)];
  }
  if (lower.includes('return') || lower.includes('refund') || lower.includes('exchange')) {
    return responses.return[Math.floor(Math.random() * responses.return.length)];
  }
  if (lower.includes('payment') || lower.includes('pay') || lower.includes('card')) {
    return responses.payment[Math.floor(Math.random() * responses.payment.length)];
  }

  return responses.custom;
}

export function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      text: 'Hey! 👋 Welcome to GRIND BYTE! How can we help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('254700000000');

  useEffect(() => {
    fetchWhatsappNumber();
  }, []);

  const fetchWhatsappNumber = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/whatsapp-number`);
      if (res.ok) {
        const data = await res.json();
        setWhatsappNumber(data.number || '254700000000');
      }
    } catch (error) {
      console.error('Failed to fetch WhatsApp number:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    setTimeout(async () => {
      const botResponse = await generateAIResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 600);
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent('Hi! I have a question about GRIND BYTE products.');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            style={{
              position: 'fixed',
              bottom: '100px',
              right: '20px',
              zIndex: 50,
              backgroundColor: '#25D366',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
              transition: 'all 0.3s ease'
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(37, 211, 102, 0.6)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.4)';
            }}
          >
            <MessageCircle size={28} fill="#fff" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                zIndex: 40
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden sm:inset-auto sm:bottom-[100px] sm:right-5 sm:w-[380px] sm:h-[500px] sm:rounded-2xl sm:shadow-2xl"
            >
              {/* Header */}
              <div style={{
                backgroundColor: '#25D366',
                color: '#fff',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>GRIND BYTE Support</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '2px' }}>Usually replies instantly</div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                backgroundColor: '#f5f5f5'
              }}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      display: 'flex',
                      justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '80%',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        backgroundColor: msg.type === 'user' ? '#25D366' : '#fff',
                        color: msg.type === 'user' ? '#fff' : '#111',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        boxShadow: msg.type === 'bot' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                        wordBreak: 'break-word'
                      }}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ display: 'flex', gap: '4px', padding: '10px 14px' }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#999', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#999', animation: 'pulse 1.5s ease-in-out 0.3s infinite' }} />
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#999', animation: 'pulse 1.5s ease-in-out 0.6s infinite' }} />
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button
                    onClick={openWhatsApp}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: '#25D366',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = '#20ba5a'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = '#25D366'}
                  >
                    Chat on WhatsApp
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => (e.currentTarget as HTMLElement).style.borderColor = '#25D366'}
                    onBlur={(e) => (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: isLoading || !inputValue.trim() ? '#d1d5db' : '#25D366',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {isLoading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
