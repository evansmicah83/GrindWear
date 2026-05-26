import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, LayoutGrid, List, X } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ui/skeleton';
import { motion, AnimatePresence } from 'motion/react';
import type { Product } from '../types';
import { mockApi } from '../services/mockApi';

const CATEGORIES = ['All', 'Hoodies', 'T-Shirts', 'Pants', 'Jackets', 'Accessories'];
const SORT_OPTIONS = [
  { value: '', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
];

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  useEffect(() => {
    loadProducts();
  }, [search, sortBy, activeCategory]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await mockApi.getProducts({
        search,
        sort: sortBy,
        category: activeCategory === 'All' ? '' : activeCategory.toLowerCase(),
      });
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const activeFilters = [
    activeCategory !== 'All' && activeCategory,
    sortBy && SORT_OPTIONS.find((o) => o.value === sortBy)?.label,
    priceRange.min && `Min KES ${priceRange.min}`,
    priceRange.max && `Max KES ${priceRange.max}`,
  ].filter(Boolean) as string[];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-grind-blue text-sm font-semibold uppercase tracking-widest mb-1">Catalogue</p>
          <h1 className="text-3xl lg:text-4xl font-black text-grind-black">All Products</h1>
          {!loading && (
            <p className="text-gray-500 text-sm mt-1">{products.length} items found</p>
          )}
        </div>

        {/* Search + Sort + View */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue bg-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue font-medium"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
                showFilters ? 'bg-grind-black text-white border-grind-black' : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            <div className="hidden sm:flex border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-grind-black text-white' : 'bg-white hover:bg-gray-50'}`}
              >
                <LayoutGrid size={17} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-grind-black text-white' : 'bg-white hover:bg-gray-50'}`}
              >
                <List size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-grind-black text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-grind-black hover:text-grind-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-sm mb-4 text-grind-black">Price Range (KES)</h3>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange((p) => ({ ...p, min: e.target.value }))}
                    className="w-32 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue"
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange((p) => ({ ...p, max: e.target.value }))}
                    className="w-32 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue"
                  />
                  <button
                    onClick={loadProducts}
                    className="px-4 py-2 bg-grind-black text-white rounded-xl text-sm font-semibold hover:bg-grind-black/85 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {activeFilters.map((f) => (
              <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1 bg-grind-black/5 text-grind-black text-xs font-semibold rounded-full">
                {f}
                <button onClick={() => {
                  if (f === activeCategory) setActiveCategory('All');
                  else if (f === SORT_OPTIONS.find((o) => o.value === sortBy)?.label) setSortBy('');
                  else setPriceRange({ min: '', max: '' });
                }}>
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              onClick={() => { setActiveCategory('All'); setSortBy(''); setPriceRange({ min: '', max: '' }); }}
              className="text-xs text-gray-500 hover:text-red-500 font-medium transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-grind-black mb-2">No products found</h3>
            <p className="text-gray-500 text-sm mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('All'); setSortBy(''); }}
              className="px-6 py-2.5 bg-grind-black text-white rounded-xl text-sm font-semibold hover:bg-grind-black/85 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => (window.location.href = `/product/${product.id}`)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
