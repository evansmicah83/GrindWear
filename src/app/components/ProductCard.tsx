import { Heart, ShoppingCart, Star, Check, Eye } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import type { Product } from '../types';
import { formatPrice } from '../../lib/utils';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const { addItem } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    await new Promise((r) => setTimeout(r, 300));
    addItem(product, selectedSize, product.colors[0], 1);
    toast.success(`Added to cart!`, {
      description: `${product.name} · ${selectedSize}`,
      icon: <Check className="text-green-500" size={16} />,
    });
    setIsAdding(false);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️');
  };

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
        {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-gray-100" />}
        <img
          src={product.images[0]}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.trending && (
            <span className="bg-grind-black text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              🔥 Hot
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 shadow-sm ${
            isWishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-500 hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Hover overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
            {/* Size selector */}
            {product.sizes.length > 0 && (
              <div className="flex gap-1.5 mb-2.5 flex-wrap">
                {product.sizes.slice(0, 5).map((size) => (
                  <button
                    key={size}
                    onClick={(e) => { e.stopPropagation(); setSelectedSize(size); }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                      selectedSize === size
                        ? 'bg-grind-black text-white border-grind-black'
                        : 'border-gray-200 text-gray-600 hover:border-grind-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || product.stock === 0}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-grind-black text-white text-xs font-bold rounded-lg hover:bg-grind-black/85 transition-colors disabled:opacity-50"
              >
                {isAdding ? (
                  <span className="animate-pulse">Adding...</span>
                ) : (
                  <><ShoppingCart size={13} /> Add to Cart</>
                )}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); window.location.href = `/product/${product.id}`; }}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye size={14} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-1 mb-1.5">
          <Star size={12} className="fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-semibold text-gray-700">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.reviewCount})</span>
          <span className="ml-auto text-xs text-gray-400 capitalize">{product.category}</span>
        </div>

        <h3 className="font-bold text-sm text-grind-black mb-2 line-clamp-2 group-hover:text-grind-blue transition-colors leading-snug">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-grind-black">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>
          {product.stock < 10 && product.stock > 0 && (
            <span className="text-[11px] text-orange-500 font-semibold">{product.stock} left</span>
          )}
          {product.stock === 0 && (
            <span className="text-[11px] text-red-500 font-semibold">Sold out</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
