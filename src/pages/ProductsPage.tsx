import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { SlidersHorizontal, X, ChevronDown, Search, PackageSearch } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MainLayout } from '../layouts/MainLayout';
import { ProductCard } from '../components/ProductCard';
import { mockApi } from '../services/mockApi';
import { api } from '../services/api';
import type { Product } from '../types';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Gray', hex: '#9CA3AF' },
  { name: 'Navy', hex: '#1E3A5F' },
  { name: 'Beige', hex: '#D4B896' },
  { name: 'Olive', hex: '#6B7C4A' },
  { name: 'Khaki', hex: '#C3A882' },
  { name: 'Blue', hex: '#2563EB' },
];
const SORT_OPTIONS = [
  { value: '', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low–High' },
  { value: 'price-desc', label: 'Price: High–Low' },
  { value: 'rating', label: 'Best Selling' },
];
const PAGE_SIZE = 12;

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
      <div className="aspect-square bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3" />
      </div>
    </div>
  );
}

export function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive filter state from URL
  const selectedCategories = searchParams.getAll('category');
  const selectedSizes = searchParams.getAll('size');
  const selectedColors = searchParams.getAll('color');
  const minPrice = Number(searchParams.get('minPrice') || 0);
  const maxPrice = Number(searchParams.get('maxPrice') || 100000);
  const sortBy = searchParams.get('sort') || '';
  const searchQuery = searchParams.get('search') || '';

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);

  useEffect(() => {
    api.getCategories()
      .then(r => setCategories(r.data.map((c: any) => ({ slug: c.slug, name: c.name }))))
      .catch(() => {});
  }, []);

  const updateParam = (key: string, values: string[]) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    values.forEach(v => next.append(key, v));
    next.delete('page');
    setSearchParams(next);
    setPage(1);
  };

  const toggleCategory = (cat: string) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter(c => c !== cat)
      : [...selectedCategories, cat];
    updateParam('category', next);
  };

  const toggleSize = (size: string) => {
    const next = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size];
    updateParam('size', next);
  };

  const toggleColor = (color: string) => {
    const next = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color];
    updateParam('color', next);
  };

  const setPriceRange = (min: number, max: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('minPrice', String(min));
    next.set('maxPrice', String(max));
    setSearchParams(next);
  };

  const clearAll = () => {
    setSearchParams({});
    setLocalSearch('');
    setPage(1);
  };

  const activeFilterCount =
    selectedCategories.length + selectedSizes.length + selectedColors.length +
    (minPrice > 0 || maxPrice < 100000 ? 1 : 0);

  useEffect(() => {
    setLoading(true);
    mockApi.getProducts({
      category: selectedCategories[0],
      search: searchQuery,
      sort: sortBy,
    }).then(data => {
      // Client-side filter for multi-select
      let filtered = data;
      if (selectedCategories.length > 0) {
        filtered = filtered.filter(p => selectedCategories.includes(p.category));
      }
      if (selectedSizes.length > 0) {
        filtered = filtered.filter(p => p.sizes.some(s => selectedSizes.includes(s)));
      }
      if (selectedColors.length > 0) {
        filtered = filtered.filter(p => p.colors.some(c => selectedColors.includes(c)));
      }
      filtered = filtered.filter(p => p.price >= minPrice && (maxPrice >= 100000 || p.price <= maxPrice));
      setAllProducts(filtered);
    }).finally(() => setLoading(false));
  }, [searchParams.toString()]);

  const displayed = allProducts.slice(0, page * PAGE_SIZE);
  const hasMore = displayed.length < allProducts.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (localSearch.trim()) next.set('search', localSearch.trim());
    else next.delete('search');
    setSearchParams(next);
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">Category</h3>
        <div className="space-y-2">
          {categories.map(cat => (
            <label key={cat.slug} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.slug)}
                onChange={() => toggleCategory(cat.slug)}
                className="w-4 h-4 rounded border-gray-300 text-grind-blue focus:ring-grind-blue cursor-pointer"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900 capitalize">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map(size => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border-2 transition-all ${
                selectedSizes.includes(size)
                  ? 'border-grind-black bg-grind-black text-white'
                  : 'border-gray-200 text-gray-700 hover:border-gray-400'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">Color</h3>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(color => (
            <button
              key={color.name}
              onClick={() => toggleColor(color.name)}
              title={color.name}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                selectedColors.includes(color.name)
                  ? 'border-grind-blue scale-110 shadow-md'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">Price Range</h3>
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={100000}
            step={500}
            value={maxPrice}
            onChange={e => setPriceRange(minPrice, Number(e.target.value))}
            className="w-full accent-grind-blue"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>KES {minPrice.toLocaleString()}</span>
            <span>{maxPrice >= 100000 ? 'Any' : `KES ${maxPrice.toLocaleString()}`}</span>
          </div>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearAll}
          className="w-full py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
        >
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-black text-grind-black mb-1">All Products</h1>
          <p className="text-gray-500">Discover our complete collection of premium streetwear</p>
        </div>

        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="search"
              placeholder="Search products..."
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-grind-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue bg-white"
            />
          </form>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={e => { const next = new URLSearchParams(searchParams); next.set('sort', e.target.value); setSearchParams(next); }}
              className="px-4 py-2.5 border border-grind-border rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-grind-border rounded-xl bg-white text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-grind-blue text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedCategories.map(c => (
              <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium capitalize">
                {c}
                <button onClick={() => toggleCategory(c)} className="text-gray-400 hover:text-gray-700"><X size={13} /></button>
              </span>
            ))}
            {selectedSizes.map(s => (
              <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium">
                Size: {s}
                <button onClick={() => toggleSize(s)} className="text-gray-400 hover:text-gray-700"><X size={13} /></button>
              </span>
            ))}
            {selectedColors.map(c => (
              <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium">
                {c}
                <button onClick={() => toggleColor(c)} className="text-gray-400 hover:text-gray-700"><X size={13} /></button>
              </span>
            ))}
            {(minPrice > 0 || maxPrice < 100000) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium">
                KES {minPrice.toLocaleString()}–{maxPrice >= 100000 ? 'Any' : maxPrice.toLocaleString()}
                <button onClick={() => setPriceRange(0, 100000)} className="text-gray-400 hover:text-gray-700"><X size={13} /></button>
              </span>
            )}
            <button onClick={clearAll} className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 font-medium">
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24 bg-white border border-grind-border rounded-2xl p-5">
              <h2 className="font-bold text-gray-900 mb-5">Filters</h2>
              <FilterPanel />
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 mb-4">
              {loading ? 'Loading...' : `${allProducts.length} product${allProducts.length !== 1 ? 's' : ''} found`}
            </p>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : allProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <PackageSearch size={64} className="text-gray-200 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your filters or search term</p>
                <button
                  onClick={clearAll}
                  className="px-6 py-3 bg-grind-black text-white rounded-xl font-semibold hover:bg-grind-black/90 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {displayed.map(p => (
                    <ProductCard key={p.id} product={p} onClick={() => navigate(`/products/${p.id}`)} />
                  ))}
                </div>
                {hasMore && (
                  <div className="text-center mt-10">
                    <button
                      onClick={() => setPage(p => p + 1)}
                      className="px-8 py-3 border-2 border-grind-black text-grind-black font-semibold rounded-xl hover:bg-grind-black hover:text-white transition-all"
                    >
                      Load More ({allProducts.length - displayed.length} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter bottom sheet */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 max-h-[85vh] overflow-y-auto lg:hidden"
            >
              <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-grind-border">
                <h2 className="font-bold text-gray-900">Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</h2>
                <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>
              <div className="p-5">
                <FilterPanel />
              </div>
              <div className="sticky bottom-0 bg-white border-t border-grind-border p-4">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-full py-3 bg-grind-black text-white rounded-xl font-semibold"
                >
                  Show {allProducts.length} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
