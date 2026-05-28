import { useState, useEffect } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'motion/react';

export function FloatingCart() {
  const { items, itemCount, total } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);
  const [addedProduct, setAddedProduct] = useState<any>(null);

  useEffect(() => {
    const lastItem = items[items.length - 1];
    if (lastItem && !addedProduct) {
      setAddedProduct(lastItem);
      setTimeout(() => setAddedProduct(null), 3000);
    }
  }, [itemCount]);

  if (itemCount === 0) return null;

  return (
    <>
      {/* Toast Notification on Product Add */}
      <AnimatePresence>
        {addedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: '100px',
              right: '20px',
              zIndex: 60,
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              maxWidth: '320px'
            }}
          >
            <div style={{ display: 'flex', gap: '12px', padding: '16px' }}>
              <img
                src={addedProduct.product.images[0]}
                alt={addedProduct.product.name}
                style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                  ✓ Added to Cart
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111' }}>
                  {addedProduct.product.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                  {addedProduct.size} / {addedProduct.color} × {addedProduct.quantity}
                </div>
              </div>
            </div>
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 3, ease: 'linear' }}
              style={{ height: '3px', backgroundColor: '#2563eb' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Cart Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-20 right-6 z-50 sm:bottom-6"
      >
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full p-4 shadow-2xl hover:shadow-blue-500/50 transition-shadow"
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            boxShadow: '0 10px 30px rgba(37, 99, 235, 0.4)'
          }}
        >
          <ShoppingCart size={24} />
          <motion.span
            key={itemCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              minWidth: '28px',
              height: '28px',
              backgroundColor: '#ef4444',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
            }}
          >
            {itemCount > 9 ? '9+' : itemCount}
          </motion.span>
        </motion.button>
      </motion.div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsExpanded(false)}
            />

            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
                <h3 className="text-xl font-bold text-gray-900">
                  Your Cart ({itemCount})
                </h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {item.size} / {item.color} × {item.quantity}
                      </p>
                      <p className="font-bold text-sm mt-2 text-blue-600">
                        KES {(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-6 border-t border-gray-200 bg-gradient-to-t from-gray-50 to-white">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold text-gray-700">Total</span>
                  <span className="font-bold text-2xl text-blue-600">
                    KES {total.toLocaleString()}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/checkout'}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
                >
                  Checkout Now
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/cart'}
                  className="w-full border-2 border-blue-200 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors mt-2"
                >
                  View Full Cart
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
