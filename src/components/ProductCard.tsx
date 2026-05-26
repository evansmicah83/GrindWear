import { Heart, ShoppingCart, Star, CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import type { Product } from '../types';
import { formatPrice } from '../../lib/utils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useCart } from '../contexts/CartContext';

interface CartToastProps {
  product: Product;
  size: string;
  color: string;
  toastId: string | number;
}

function CartToast({ product, size, color, toastId }: CartToastProps) {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-start gap-3 bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 w-[340px] animate-in slide-in-from-right-5 fade-in duration-300"
      style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.13)' }}
    >
      {/* Product image */}
      <div className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-green-500/80 rounded-xl">
          <CheckCircle2 size={28} className="text-white drop-shadow" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-green-600 mb-0.5">Added to cart</p>
        <p className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">{product.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {size} &nbsp;·&nbsp; {color}
        </p>
        <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(product.price)}</p>

        <button
          onClick={() => { toast.dismiss(toastId); navigate('/cart'); }}
          className="mt-2 w-full flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors"
        >
          <ShoppingCart size={13} />
          View Cart
        </button>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => toast.dismiss(toastId)}
        className="shrink-0 text-gray-400 hover:text-gray-700 transition-colors mt-0.5"
      >
        <X size={16} />
      </button>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    const size = product.sizes[0];
    const color = product.colors[0];
    addItem(product, size, color, 1);

    toast.custom(
      (t) => (
        <CartToast
          product={product}
          size={size}
          color={color}
          toastId={t}
        />
      ),
      { duration: 4000, position: 'top-right' }
    );

    setIsAdding(false);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div
      className="group bg-white border border-grind-border rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-200" />
        )}
        <img
          src={product.images[0]}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />

        {discount > 0 && (
          <Badge
            variant="danger"
            className="absolute top-3 left-3"
          >
            -{discount}%
          </Badge>
        )}

        {product.trending && (
          <Badge
            variant="info"
            className="absolute top-3 right-3"
          >
            Trending
          </Badge>
        )}

        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
            product.trending ? 'top-14' : ''
          } ${
            isWishlisted
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-600 hover:bg-white'
          }`}
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            fullWidth
            onClick={handleAddToCart}
            loading={isAdding}
            className="bg-white text-grind-black hover:bg-white/90"
          >
            {!isAdding && <ShoppingCart size={16} />}
            {isAdding ? 'Adding...' : 'Quick Add'}
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1 mb-2">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-sm text-gray-500">({product.reviewCount})</span>
        </div>

        <h3 className="font-semibold text-grind-black mb-1 line-clamp-2 group-hover:text-grind-blue transition-colors">
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-1">
          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-grind-black">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {product.stock < 10 && product.stock > 0 && (
          <p className="text-xs text-grind-warning mt-2">
            Only {product.stock} left in stock
          </p>
        )}

        {product.stock === 0 && (
          <p className="text-xs text-grind-danger mt-2 font-medium">
            Out of stock
          </p>
        )}
      </div>
    </div>
  );
}
