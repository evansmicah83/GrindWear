import { useEffect, useState } from 'react';
import { ArrowRight, TrendingUp, Sparkles, Zap, Shield, RotateCcw, Truck } from 'lucide-react';
import grindBg from '../../assets/Grind.png';
import { MainLayout } from '../layouts/MainLayout';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/ui/skeleton';
import { motion, AnimatePresence } from 'motion/react';
import type { Product, Category } from '../types';
import { mockApi } from '../services/mockApi';

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  show: (i = 0) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { delay: i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroWord, setHeroWord] = useState(0);

  const heroWords = ['Your Look', 'The Culture', 'Every Drop', 'Street Style'];

  useEffect(() => {
    const interval = setInterval(() => setHeroWord((w) => (w + 1) % heroWords.length), 3800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Promise.all([
      mockApi.getFeaturedProducts(),
      mockApi.getTrendingProducts(),
      mockApi.getCategories(),
    ]).then(([featured, trending, cats]) => {
      setFeaturedProducts(featured);
      setTrendingProducts(trending);
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      {/* ── HERO ── */}
      <section
        style={{
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #0f172a 50%, #0a0a0a 100%)',
        }}
      >
        {/* Background image - full visibility */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${grindBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          opacity: 0.75,
          pointerEvents: 'none',
        }} />
        {/* Subtle overlay just enough to keep text readable */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.55) 100%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: '500px', height: '500px', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '400px', height: '400px', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          >
            <Sparkles size={14} style={{ color: '#60a5fa' }} />
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.02em' }}>
              New Collection 2026 — Now Live
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} initial="hidden" animate="show" custom={1}
            className="font-black tracking-tight mb-6"
            style={{ fontSize: 'clamp(3.5rem, 10vw, 7rem)', color: '#fff', lineHeight: 1.05 }}
          >
            Elevate<br />
            <span style={{ display: 'inline-block', position: 'relative', minWidth: '2ch' }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={heroWords[heroWord]}
                  initial={{ opacity: 0, y: 12, filter: 'blur(6px)', scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(6px)', scale: 0.98 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {heroWords[heroWord]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} initial="hidden" animate="show" custom={2}
            style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.125rem', maxWidth: '560px', lineHeight: 1.7, marginBottom: '2.5rem', textAlign: 'center' }}
          >
            Premium Kenyan streetwear designed for the modern generation.
            Quality meets culture in every piece.
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}
            className="flex flex-wrap gap-4"
            style={{ justifyContent: 'center' }}
          >
            <a href="/products"
              className="inline-flex items-center gap-2 font-bold rounded-2xl transition-all hover:scale-105"
              style={{ padding: '14px 28px', backgroundColor: '#fff', color: '#111', fontSize: '0.9375rem', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', textDecoration: 'none' }}
            >
              Shop Now <ArrowRight size={18} />
            </a>
            <a href="/products?sale=true"
              className="inline-flex items-center gap-2 font-bold rounded-2xl transition-all"
              style={{ padding: '14px 28px', border: '2px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.9375rem', backdropFilter: 'blur(8px)', textDecoration: 'none' }}
            >
              <Zap size={16} style={{ color: '#fbbf24' }} /> View Sale
            </a>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}
            className="flex flex-wrap gap-10 mt-16 pt-10"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)', justifyContent: 'center' }}
          >
            {[['12K+', 'Happy Customers'], ['500+', 'Products'], ['4.9★', 'Avg Rating'], ['24h', 'Nairobi Delivery']].map(([val, label]) => (
              <div key={label}>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff' }}>{val}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section style={{ backgroundColor: '#1e40af', color: '#fff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center sm:justify-between gap-4 py-4">
            {[
              [Truck, 'Free shipping over KES 5,000'],
              [RotateCcw, '30-day easy returns'],
              [Shield, 'Secure M-Pesa & card payments'],
            ].map(([Icon, text]: any) => (
              <div key={text} className="flex items-center gap-2" style={{ fontSize: '0.8125rem', fontWeight: 500, opacity: 0.92 }}>
                <Icon size={15} /> {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p style={{ color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Collections</p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#111', lineHeight: 1.1 }}>Shop by Category</h2>
          </div>
          <a href="/products" className="hidden sm:flex items-center gap-1"
            style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>
            All products <ArrowRight size={16} />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl animate-pulse" style={{ backgroundColor: '#e5e7eb' }} />
              ))
            : categories.map((cat, i) => (
                <motion.a
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden block"
                  style={{ textDecoration: 'none' }}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '0.9375rem' }}>{cat.name}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', marginTop: '2px' }}>{cat.productCount} items</p>
                  </div>
                </motion.a>
              ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section style={{ backgroundColor: '#f8fafc' }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p style={{ color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Handpicked</p>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#111', lineHeight: 1.1 }}>Featured Products</h2>
            </div>
            <a href="/products" className="hidden sm:flex items-center gap-1"
              style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>
              View all <ArrowRight size={16} />
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featuredProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} onClick={() => (window.location.href = `/products`)} />
                ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(37,99,235,0.1)' }}>
              <TrendingUp size={22} style={{ color: '#2563eb' }} />
            </div>
            <div>
              <p style={{ color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>This Week</p>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#111', lineHeight: 1.1 }}>Trending Now</h2>
            </div>
          </div>
          <a href="/products?sort=trending" className="hidden sm:flex items-center gap-1"
            style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>
            See all <ArrowRight size={16} />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : trendingProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} onClick={() => (window.location.href = `/products`)} />
              ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="mx-4 sm:mx-6 lg:mx-8 mb-20 rounded-3xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1e1b4b 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(37,99,235,0.3) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at bottom left, rgba(124,58,237,0.2) 0%, transparent 60%)' }} />

        <div className="relative max-w-7xl mx-auto px-8 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
              <Sparkles size={12} style={{ color: '#fbbf24' }} /> Limited Time Offer
            </div>
            <h2 className="font-black leading-tight mb-3" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', color: '#fff' }}>
              Get 20% Off<br />
              <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Your First Order</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', maxWidth: '380px' }}>
              Join the GRIND BYTE community. Use code{' '}
              <strong style={{ color: '#fff' }}>WELCOME20</strong> at checkout.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-5 py-3.5 rounded-2xl text-sm focus:outline-none"
              style={{ color: '#111', backgroundColor: '#fff', width: '100%', minWidth: '220px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
            />
            <button
              className="px-6 py-3.5 rounded-2xl font-bold text-sm text-white transition-opacity hover:opacity-90 whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 4px 16px rgba(37,99,235,0.4)' }}
            >
              Claim Offer
            </button>
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section style={{ backgroundColor: '#f8fafc' }} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 style={{ fontSize: '1.875rem', fontWeight: 900, color: '#111', marginBottom: '8px' }}>Why GRIND BYTE?</h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Premium quality meets authentic Kenyan streetwear culture</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '🚚', title: 'Fast Delivery', desc: 'Same-day delivery in Nairobi' },
              { icon: '💯', title: 'Authentic', desc: '100% original products' },
              { icon: '🔒', title: 'Secure Payment', desc: 'M-Pesa & card payments' },
              { icon: '♻️', title: 'Easy Returns', desc: '30-day return policy' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-shadow group"
                style={{ border: '1px solid #f3f4f6' }}
              >
                <div className="text-4xl mb-4 inline-block group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 style={{ fontWeight: 700, color: '#111', marginBottom: '4px', fontSize: '0.9375rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: '#6b7280' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
