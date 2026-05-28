import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Heart, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { useAuth } from '../contexts/AuthContext';
import { useWishlistStore } from '../stores/wishlistStore';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export function WishlistPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { items, removeItem, toggle } = useWishlistStore();
  const { addItem } = useCart();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: '/wishlist' } });
    }
  }, [isAuthenticated, authLoading]);

  const handleAddToCart = (product: any) => {
    const size = product.sizes?.[0] || '';
    const color = product.colors?.[0] || '';
    addItem(product, size, color, 1);
    toast.success('Added to cart', { description: product.name });
  };

  if (authLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-black text-gray-900">
            Wishlist <span className="text-gray-400 font-normal text-xl">({items.length})</span>
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
            <Heart size={56} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-400 mb-6">Save items you love to your wishlist</p>
            <button onClick={() => navigate('/products')} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors">
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(({ product }) => (
              <div key={product.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden group">
                <div
                  className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={e => { e.stopPropagation(); removeItem(product.id); toast('Removed from wishlist'); }}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="p-3">
                  <p
                    className="font-semibold text-sm text-gray-900 line-clamp-1 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    {product.name}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="font-black text-gray-900 text-sm">{formatPrice(product.price)}</p>
                      {product.compareAtPrice && (
                        <p className="text-xs text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <ShoppingCart size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}