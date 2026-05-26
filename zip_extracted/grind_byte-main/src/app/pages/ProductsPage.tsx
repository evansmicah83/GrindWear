import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { ProductGrid } from '../components/ProductGrid';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import type { Product } from '../types';
import { mockApi } from '../services/mockApi';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [search, sortBy]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await mockApi.getProducts({ search, sort: sortBy });
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-grind-black mb-4">
            All Products
          </h1>
          <p className="text-gray-600">
            Discover our complete collection of premium streetwear
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={18} />}
            />
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-grind-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-grind-blue"
            >
              <option value="">Sort by</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden"
            >
              <SlidersHorizontal size={18} />
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white border border-grind-border rounded-lg p-6 mb-8">
            <h3 className="font-semibold mb-4">Filters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <div className="space-y-2">
                  {['Hoodies', 'T-Shirts', 'Pants', 'Jackets'].map((cat) => (
                    <label key={cat} className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-grind-border rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-grind-border rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <ProductGrid
          products={products}
          loading={loading}
          onProductClick={(product) => window.location.href = `/product/${product.id}`}
        />
      </div>
    </MainLayout>
  );
}
