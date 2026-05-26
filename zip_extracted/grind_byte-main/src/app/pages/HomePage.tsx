import { useEffect, useState } from 'react';
import { ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { ProductCardSkeleton } from '../components/ui/skeleton';
import type { Product, Category } from '../types';
import { mockApi } from '../services/mockApi';

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [featured, trending, cats] = await Promise.all([
        mockApi.getFeaturedProducts(),
        mockApi.getTrendingProducts(),
        mockApi.getCategories()
      ]);
      setFeaturedProducts(featured);
      setTrendingProducts(trending);
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <section className="relative bg-gradient-to-br from-grind-black via-gray-900 to-grind-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558769132-cb1aea3c8a7e?w=1200')] bg-cover bg-center opacity-10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles size={16} className="text-grind-blue" />
              <span className="text-sm font-medium">New Collection 2026</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Elevate Your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-grind-blue to-grind-purple">
                Street Style
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl">
              Discover premium streetwear designed for the modern generation. Quality meets innovation in every piece.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="primary" className="bg-white text-grind-black hover:bg-gray-100">
                Shop New Arrivals
                <ArrowRight size={20} />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-grind-black">
                Explore Collection
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-grind-black mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 text-lg">
            Find your perfect style across our curated collections
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
            ))
          ) : (
            categories.map((category) => (
              <a
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group relative aspect-square rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-300">{category.productCount} items</p>
                </div>
              </a>
            ))
          )}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-grind-black mb-2">
                Featured Products
              </h2>
              <p className="text-gray-600">
                Handpicked favorites from our latest collection
              </p>
            </div>
            <Button variant="ghost" className="hidden md:flex">
              View All
              <ArrowRight size={18} />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : (
              featuredProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => window.location.href = `/product/${product.id}`}
                />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="text-grind-blue" size={32} />
          <div>
            <h2 className="text-3xl font-bold text-grind-black">
              Trending Now
            </h2>
            <p className="text-gray-600">
              What everyone's loving this week
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : (
            trendingProducts.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => window.location.href = `/product/${product.id}`}
              />
            ))
          )}
        </div>
      </section>

      <section className="bg-gradient-to-br from-grind-black via-gray-900 to-grind-black text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(37,99,235,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(124,58,237,0.1),transparent_50%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Sparkles size={16} className="text-grind-blue" />
                <span className="text-sm font-medium">Exclusive Perks</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight">
                Join the GRIND BYTE
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-grind-blue to-grind-purple"> Community</span>
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Get exclusive access to new drops, special offers, early sales, and style inspiration delivered straight to your inbox.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <span className="text-gray-300">Early access to new collections</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <span className="text-gray-300">Exclusive member discounts</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                  <span className="text-gray-300">Style tips & trend alerts</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-5 py-4 rounded-xl text-grind-black focus:outline-none focus:ring-2 focus:ring-grind-blue shadow-lg"
                />
                <Button size="lg" className="bg-gradient-to-r from-grind-blue to-grind-purple hover:opacity-90 shadow-lg px-8">
                  Subscribe Now
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                By subscribing, you agree to our Privacy Policy and consent to receive updates.
              </p>
            </div>

            <div className="hidden md:block relative">
              <div className="absolute -top-8 -right-8 w-72 h-72 bg-grind-blue/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-72 h-72 bg-grind-purple/20 rounded-full blur-3xl" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-grind-blue to-grind-purple" />
                    <div className="flex-1">
                      <div className="h-3 bg-white/20 rounded w-32 mb-2" />
                      <div className="h-2 bg-white/10 rounded w-24" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-grind-purple to-pink-500" />
                    <div className="flex-1">
                      <div className="h-3 bg-white/20 rounded w-28 mb-2" />
                      <div className="h-2 bg-white/10 rounded w-20" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-grind-blue to-cyan-500" />
                    <div className="flex-1">
                      <div className="h-3 bg-white/20 rounded w-36 mb-2" />
                      <div className="h-2 bg-white/10 rounded w-28" />
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">12,000+ Members</span>
                    <span className="text-sm font-semibold text-green-400">+250 this week</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-grind-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-grind-black mb-3">
              Why Choose GRIND BYTE?
            </h2>
            <p className="text-gray-600">
              Premium quality meets authentic Kenyan streetwear culture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🚚', title: 'Fast Delivery', desc: 'Same-day delivery in Nairobi' },
              { icon: '💯', title: 'Authentic', desc: '100% original products' },
              { icon: '🔒', title: 'Secure Payment', desc: 'M-Pesa & card payments' },
              { icon: '♻️', title: 'Easy Returns', desc: '30-day return policy' }
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow border border-grind-border">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-grind-black mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
