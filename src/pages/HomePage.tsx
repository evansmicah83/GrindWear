import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, ChevronDown, Star, Quote, Instagram } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MainLayout } from '../layouts/MainLayout';
import { ProductCard } from '../components/ProductCard';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { mockApi } from '../services/mockApi';
import grindBg from '../assets/Grind.png';
import type { Product, Category } from '../types';
import { toast } from 'sonner';

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

const TESTIMONIALS = [
  { name: 'Amara Odhiambo', location: 'Nairobi, Kenya', rating: 5, text: 'The quality is unreal for the price. My hoodie has survived two years of heavy wear and still looks brand new. GRIND BYTE is the real deal.' },
  { name: 'Brian Kamau', location: 'Mombasa, Kenya', rating: 5, text: 'Finally a Kenyan brand that competes with the big international names. The fit, the fabric, the packaging — everything is premium.' },
  { name: 'Cynthia Wanjiku', location: 'Kisumu, Kenya', rating: 5, text: 'Ordered on Monday, delivered Wednesday. The cargo pants are exactly as pictured. I\'ve already recommended GRIND BYTE to all my friends.' },
  { name: 'David Mwangi', location: 'Nakuru, Kenya', rating: 5, text: 'The oversized sweatshirt is my go-to piece. Soft, well-stitched, and the colorway is fire. Will definitely be ordering more.' },
];

const UGC_IMAGES = [
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
];

export function HomePage() {
  const navigate = useNavigate();
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Promise.all([
      mockApi.getFeaturedProducts(),
      mockApi.getTrendingProducts(),
      mockApi.getCategories(),
    ]).then(([featured, trending, cats]) => {
      setNewArrivals(featured);
      setBestSellers(trending);
      setCategories(cats);
    }).catch(() => {
      // silently fail — show empty state instead of crashing
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length);
    }, 4500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('You\'re in! 🎉', { description: 'Welcome to the GRIND BYTE community.' });
    setEmail('');
    setSubscribing(false);
  };

  return (
    <MainLayout>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-grind-black">
        {/* Background */}
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.12 }}
          transition={{ duration: 20, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${grindBg})` }}
        />
        <div className="absolute inset-0 bg-black/65" />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-full"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-medium tracking-wide">New Collection 2026 — Now Live</span>
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tight mb-6">
              WEAR THE<br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">GRIND</span>
            </h1>

            <p className="text-lg text-white/70 mb-10 leading-relaxed max-w-lg mx-auto">
              Premium Kenyan streetwear designed for the modern generation. Quality meets culture in every piece.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:-translate-y-0.5 no-underline"
              >
                Shop Now <ArrowRight size={18} />
              </a>
              <a
                href="/products?filter=new"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm no-underline"
              >
                New Arrivals
              </a>
            </div>

            <div className="flex flex-wrap gap-8 mt-14 pt-10 border-t border-white/10 justify-center">
              {[['12K+', 'Happy Customers'], ['500+', 'Products'], ['4.9★', 'Avg Rating']].map(([val, label]) => (
                <div key={label}>
                  <p className="text-3xl font-black text-white">{val}</p>
                  <p className="text-white/50 text-sm mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40"
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown size={18} />
        </motion.div>
      </section>

      {/* ── FEATURED CATEGORIES ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-grind-blue font-semibold text-xs uppercase tracking-widest mb-2">Browse</p>
            <h2 className="text-4xl font-black text-gray-900">Shop by Category</h2>
          </div>
          <a href="/products" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors no-underline">
            All products <ArrowRight size={16} />
          </a>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-3 lg:grid-cols-5 scrollbar-hide">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-40 sm:w-auto aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse" />
              ))
            : categories.map(cat => (
                <a
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group relative flex-shrink-0 w-40 sm:w-auto aspect-[3/4] rounded-2xl overflow-hidden block no-underline"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex items-end justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-xs font-bold text-white bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">Explore →</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-bold text-base">{cat.name}</p>
                    <p className="text-white/60 text-xs mt-0.5">{cat.productCount} items</p>
                  </div>
                </a>
              ))}
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-grind-blue font-semibold text-xs uppercase tracking-widest mb-2">Just Dropped</p>
              <h2 className="text-4xl font-black text-gray-900">New Arrivals</h2>
            </div>
            <a href="/products?filter=new" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors no-underline">
              View All <ArrowRight size={16} />
            </a>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : newArrivals.slice(0, 4).map(p => (
                  <ProductCard key={p.id} product={p} onClick={() => navigate(`/products/${p.id}`)} />
                ))}
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-orange-500 font-semibold text-xs uppercase tracking-widest mb-2">Most Loved</p>
            <h2 className="text-4xl font-black text-gray-900">Best Sellers</h2>
          </div>
          <a href="/products?sort=bestsellers" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors no-underline">
            See All <ArrowRight size={16} />
          </a>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : bestSellers.slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} onClick={() => navigate(`/products/${p.id}`)} />
              ))}
        </div>
      </section>

      {/* ── BRAND STORY BANNER ── */}
      <section className="relative py-28 overflow-hidden bg-grind-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1600)', opacity: 0.15 }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-grind-blue font-semibold text-xs uppercase tracking-widest mb-4">Our Story</p>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
            MADE IN KENYA.<br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">WORN WORLDWIDE.</span>
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Born on the streets of Nairobi, built for the world. Every stitch tells a story of hustle, culture, and pride.
          </p>
          <a
            href="/about"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all no-underline"
          >
            Our Story <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-grind-blue font-semibold text-xs uppercase tracking-widest mb-2">Reviews</p>
            <h2 className="text-4xl font-black text-gray-900">What Our Customers Say</h2>
          </div>

          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIdx}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-gray-100 text-center"
              >
                <Quote size={32} className="text-grind-blue/30 mx-auto mb-4" />
                <div className="flex justify-center gap-1 mb-4">
                  {Array.from({ length: TESTIMONIALS[testimonialIdx].rating }).map((_, i) => (
                    <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg leading-relaxed mb-6 max-w-2xl mx-auto">
                  "{TESTIMONIALS[testimonialIdx].text}"
                </p>
                <p className="font-bold text-gray-900">{TESTIMONIALS[testimonialIdx].name}</p>
                <p className="text-sm text-gray-500">{TESTIMONIALS[testimonialIdx].location}</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-6">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === testimonialIdx ? 'bg-grind-blue w-6' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── UGC / INSTAGRAM GRID ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-10">
          <p className="text-grind-blue font-semibold text-xs uppercase tracking-widest mb-2">Community</p>
          <h2 className="text-4xl font-black text-gray-900">@grindwear_ke</h2>
          <p className="text-gray-500 mt-2">Tag us to be featured</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {UGC_IMAGES.map((src, i) => (
            <a
              key={i}
              href="https://instagram.com/grindwear_ke"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-xl overflow-hidden block"
            >
              <ImageWithFallback
                src={src}
                alt="Community"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <Instagram size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </a>
          ))}
        </div>
        <div className="text-center mt-8">
          <a
            href="https://instagram.com/grindwear_ke"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border border-grind-border rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors no-underline"
          >
            <Instagram size={16} /> Follow on Instagram
          </a>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="relative py-24 overflow-hidden bg-grind-black">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-grind-blue font-semibold text-xs uppercase tracking-widest mb-3">Newsletter</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Join the <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">GRIND</span> Community
          </h2>
          <p className="text-white/60 mb-8 text-lg">
            Early access to drops, exclusive discounts, and style alerts.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="flex-1 px-5 py-4 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-grind-blue shadow-lg text-sm"
            />
            <button
              type="submit"
              disabled={subscribing}
              className="px-6 py-4 bg-grind-blue hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg whitespace-nowrap text-sm disabled:opacity-60"
            >
              {subscribing ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          <p className="text-white/30 text-xs mt-4">No spam. Unsubscribe anytime.</p>
        </div>
      </section>
    </MainLayout>
  );
}
