import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, TrendingUp, Sparkles, Zap, Shield, Truck, RotateCcw } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { ProductCard } from '../components/ProductCard';
import type { Product, Category } from '../types';
import { mockApi } from '../services/mockApi';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
      <div className="aspect-square bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3" />
      </div>
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      mockApi.getFeaturedProducts(),
      mockApi.getTrendingProducts(),
      mockApi.getCategories()
    ]).then(([featured, trending, cats]) => {
      setFeaturedProducts(featured);
      setTrendingProducts(trending);
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, []);

  const perks = [
    { icon: Truck, title: 'Same-Day Delivery', desc: 'Within Nairobi' },
    { icon: Shield, title: 'Secure Payments', desc: 'M-Pesa & Cards' },
    { icon: RotateCcw, title: '30-Day Returns', desc: 'Hassle-free' },
    { icon: Zap, title: 'Authentic Only', desc: '100% Original' },
  ];

  return (
    <MainLayout>
      {/* ── HERO ── */}
      <section className="hero-section min-h-[92vh] flex items-center">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles size={14} className="text-blue-400" />
              <span className="text-white/90 text-sm font-medium tracking-wide">New Collection 2026 — Now Live</span>
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tight mb-6">
              Elevate<br />
              <span className="gradient-text">Your Look</span>
            </h1>

            <p className="text-lg text-white/70 mb-10 leading-relaxed max-w-lg">
              Premium Kenyan streetwear designed for the modern generation.
              Quality meets culture in every piece.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Shop Now <ArrowRight size={18} />
              </a>
              <a
                href="/products?sale=true"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
              >
                View Sale
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-14 pt-10 border-t border-white/10">
              {[['12K+', 'Happy Customers'], ['500+', 'Products'], ['4.9★', 'Avg Rating']].map(([val, label]) => (
                <div key={label}>
                  <p className="text-3xl font-black text-white">{val}</p>
                  <p className="text-white/50 text-sm mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ── PERKS BAR ── */}
      <section className="bg-gray-900 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-800">
            {perks.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 px-6 py-5">
                <div className="p-2 bg-blue-600/20 rounded-lg flex-shrink-0">
                  <Icon size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-gray-400 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">Browse</p>
            <h2 className="text-4xl font-black text-gray-900">Shop by Category</h2>
          </div>
          <a href="/products" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            All products <ArrowRight size={16} />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse" />
              ))
            : categories.map((cat) => (
                <a
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden block"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-bold text-base">{cat.name}</p>
                    <p className="text-white/60 text-xs mt-0.5">{cat.productCount} items</p>
                  </div>
                </a>
              ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">Curated</p>
              <h2 className="text-4xl font-black text-gray-900">Featured Products</h2>
            </div>
            <a href="/products" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              View all <ArrowRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : featuredProducts.slice(0, 4).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => navigate(`/products/${product.id}`)}
                  />
                ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl">
              <TrendingUp size={24} className="text-orange-500" />
            </div>
            <div>
              <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest">Hot right now</p>
              <h2 className="text-4xl font-black text-gray-900">Trending Now</h2>
            </div>
          </div>
          <a href="/products?sort=trending" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            See all <ArrowRight size={16} />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : trendingProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => navigate(`/products/${product.id}`)}
                />
              ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="hero-section py-24">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full mb-6">
              <Sparkles size={14} className="text-blue-400" />
              <span className="text-white/90 text-sm font-medium">Exclusive Perks</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
              Join the <span className="gradient-text">GRIND BYTE</span> Community
            </h2>
            <p className="text-white/60 mb-8 text-lg">
              Early access to drops, exclusive discounts, and style alerts.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-4 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg text-sm"
              />
              <button className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg whitespace-nowrap text-sm">
                Subscribe
              </button>
            </div>
            <p className="text-white/30 text-xs mt-4">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      </section>
    </MainLayout>
  );
}
