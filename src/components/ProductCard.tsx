import { Heart, ShoppingCart, Star, CheckCircle2, X, Eye } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import Swal from 'sweetalert2';
import type { Product } from '../types';
import { formatPrice, normalizeImageSource } from '@/lib/utils';
import { ImageWithFallback } from './ImageWithFallback';
import { Badge } from './ui/badge';
import { useCart } from '../contexts/CartContext';
import { useWishlistStore } from '../stores/wishlistStore';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();
  const { toggle, isInWishlist } = useWishlistStore();
  const wishlisted = isInWishlist(product.id);
  const primaryImage = normalizeImageSource(product.images?.[0]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    await new Promise(r => setTimeout(r, 300));
    const size = product.sizes?.[0] ?? '';
    const color = product.colors?.[0] ?? '';
    addItem(product, size, color, 1);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Added to cart!',
      text: `${product.name} · ${size}`,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      background: '#111',
      color: '#fff',
      iconColor: '#3b82f6',
      customClass: { popup: 'rounded-xl shadow-2xl' },
    });
    setIsAdding(false);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle(product);
    const next = !wishlisted;
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: next ? 'success' : 'info',
      title: next ? 'Saved to wishlist ❤️' : 'Removed from wishlist',
      text: product.name,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      background: '#111',
      color: '#fff',
      iconColor: next ? '#ef4444' : '#6b7280',
      customClass: { popup: 'rounded-xl shadow-2xl' },
    });
  };

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div
      className="group bg-white border border-grind-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={onClick ?? (() => navigate(`/products/${product.slug || product.id}`))}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <ImageWithFallback
          src={primaryImage}
          alt={product.name}
          className="w-full h-full group-hover:scale-110 transition-transform duration-500"
        />

        {discount > 0 && (
          <Badge variant="danger" className="absolute top-3 left-3" size="sm">-{discount}%</Badge>
        )}

        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 cursor-pointer ${
            wishlisted ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
          }`}
        >
          <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white text-grind-black text-xs font-bold rounded-lg hover:bg-white/90 transition-colors disabled:opacity-70 cursor-pointer"
            >
              {isAdding ? (
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : <ShoppingCart size={13} />}
              {isAdding ? 'Adding...' : 'Quick Add'}
            </button>
            <Link
              to={`/products/${product.slug || product.id}`}
              onClick={e => e.stopPropagation()}
              className="p-2 bg-white/90 hover:bg-white text-grind-black rounded-lg transition-colors cursor-pointer flex items-center"
            >
              <Eye size={13} />
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1 mb-1.5">
          <Star size={13} className="fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-semibold">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.reviewCount})</span>
        </div>

        <h3 className="font-bold text-gray-900 mb-0.5 line-clamp-1 text-sm group-hover:text-grind-blue transition-colors">
          {product.name}
        </h3>

        <p className="text-xs text-gray-500 mb-2 capitalize">{product.category}</p>

        <div className="flex items-center gap-2">
          <span className="font-black text-gray-900">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>

        {product.stock < 10 && product.stock > 0 && (
          <p className="text-xs text-orange-500 mt-1.5">Only {product.stock} left</p>
        )}
        {product.stock === 0 && (
          <p className="text-xs text-red-500 mt-1.5 font-medium">Out of stock</p>
        )}
      </div>
    </div>
  );
}
