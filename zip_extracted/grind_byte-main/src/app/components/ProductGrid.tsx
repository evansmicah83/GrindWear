import type { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ui/skeleton';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onProductClick?: (product: Product) => void;
}

export function ProductGrid({ products, loading = false, onProductClick }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🛍️</div>
        <h3 className="text-2xl font-semibold text-grind-black mb-2">
          No products found
        </h3>
        <p className="text-gray-600">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onProductClick?.(product)}
        />
      ))}
    </div>
  );
}
