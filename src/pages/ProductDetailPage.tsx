import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, ShoppingCart, Heart, Star, Minus, Plus, Check, Ruler, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MainLayout } from '../layouts/MainLayout';
import { ProductCard } from '../components/ProductCard';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { Badge } from '../components/ui/badge';
import { useCart } from '../contexts/CartContext';
import { useWishlistStore } from '../stores/wishlistStore';
import { api } from '../services/api';
import { mockApi } from '../services/mockApi';
import { formatPrice, formatDate } from '@/lib/utils';
import Swal from 'sweetalert2';
import type { Product, Review } from '../types';

const SIZE_GUIDE = [
  { size: 'XS', chest: '84–89', waist: '66–71', hips: '89–94' },
  { size: 'S',  chest: '89–94', waist: '71–76', hips: '94–99' },
  { size: 'M',  chest: '94–99', waist: '76–81', hips: '99–104' },
  { size: 'L',  chest: '99–104', waist: '81–86', hips: '104–109' },
  { size: 'XL', chest: '104–109', waist: '86–91', hips: '109–114' },
  { size: 'XXL', chest: '109–119', waist: '91–101', hips: '114–124' },
];

const RECENTLY_VIEWED_KEY = 'grind-recently-viewed';

function getRecentlyViewed(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]'); } catch { return []; }
}

function addRecentlyViewed(id: string) {
  const prev = getRecentlyViewed().filter(i => i !== id);
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify([id, ...prev].slice(0, 8)));
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggle, isInWishlist } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'shipping' | 'reviews'>('description');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const imageList = product?.images ?? [];

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      mockApi.getProduct(id),
      mockApi.getProducts(),
    ]).then(async ([p, all]) => {
      if (!p) { navigate('/products'); return; }
      setProduct(p);
      setSelectedSize(p.sizes[0] || '');
      setSelectedColor(p.colors[0] || '');
      setRelated(all.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4));
      addRecentlyViewed(p.id);
      const recentIds = getRecentlyViewed().filter(rid => rid !== p.id);
      setRecentProducts(all.filter(x => recentIds.includes(x.id)).slice(0, 4));
      // Fetch reviews using the real UUID
      mockApi.getProductReviews(p.id).then(setReviews).catch(() => setReviews([]));
    }).catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!selectedSize) {
      Swal.fire({
        toast: true, position: 'top-end', icon: 'warning',
        title: 'Please select a size',
        showConfirmButton: false, timer: 2000, timerProgressBar: true,
        background: '#111', color: '#fff', iconColor: '#f59e0b',
        customClass: { popup: 'rounded-xl shadow-2xl' },
      });
      return;
    }
    if (!selectedColor) {
      Swal.fire({
        toast: true, position: 'top-end', icon: 'warning',
        title: 'Please select a color',
        showConfirmButton: false, timer: 2000, timerProgressBar: true,
        background: '#111', color: '#fff', iconColor: '#f59e0b',
        customClass: { popup: 'rounded-xl shadow-2xl' },
      });
      return;
    }
    setAdding(true);
    await new Promise(r => setTimeout(r, 300));
    addItem(product, selectedSize, selectedColor, quantity);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Added to cart!',
      html: `<span style="font-size:13px;opacity:.85">${product.name} · ${selectedSize} · ${selectedColor} × ${quantity}</span>`,
      showConfirmButton: false,
      timer: 2800,
      timerProgressBar: true,
      background: '#111',
      color: '#fff',
      iconColor: '#3b82f6',
      customClass: { popup: 'rounded-xl shadow-2xl' },
    });
    setAdding(false);
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/checkout');
  };

  const handleWishlist = () => {
    if (!product) return;
    toggle(product);
    const inWl = isInWishlist(product.id);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: inWl ? 'info' : 'success',
      title: inWl ? 'Removed from wishlist' : 'Saved to wishlist ❤️',
      text: product.name,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      background: '#111',
      color: '#fff',
      iconColor: inWl ? '#6b7280' : '#ef4444',
      customClass: { popup: 'rounded-xl shadow-2xl' },
    });
  };

  const discount = product?.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : product?.rating || 0;

  if (loading) return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
            <div className="flex gap-3">
              {[...Array(3)].map((_, i) => <div key={i} className="w-20 h-20 bg-gray-200 rounded-xl animate-pulse" />)}
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" style={{ width: `${[60, 80, 40, 70, 50, 90][i]}%` }} />)}
          </div>
        </div>
      </div>
    </MainLayout>
  );

  if (!product) return null;

  const wishlisted = isInWishlist(product.id);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ── IMAGE GALLERY ── */}
          <div className="space-y-4">
            {/* Main image */}
            <div
              className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 cursor-zoom-in"
              onClick={() => setZoomed(true)}
            >
              <ImageWithFallback
                src={imageList[activeImage] ?? ''}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              {imageList.length > 1 && (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); setActiveImage(i => (i - 1 + imageList.length) % imageList.length); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow hover:bg-white transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setActiveImage(i => (i + 1) % imageList.length); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow hover:bg-white transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
              {discount > 0 && (
                <div className="absolute top-4 left-4">
                  <Badge variant="danger">-{discount}%</Badge>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {imageList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {imageList.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === i ? 'border-grind-black' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <ImageWithFallback src={img} alt={`${product.name} thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── PRODUCT INFO ── */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-semibold text-grind-blue uppercase tracking-widest">{product.category}</span>
                {product.trending && <Badge variant="info" size="sm">Trending</Badge>}
                {product.isNew && <Badge variant="success" size="sm">New</Badge>}
                {product.stock < 5 && product.stock > 0 && (
                  <Badge variant="warning" size="sm">Low Stock</Badge>
                )}
                {product.stock === 0 && <Badge variant="danger" size="sm">Out of Stock</Badge>}
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-3">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < Math.floor(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                  ))}
                </div>
                <span className="text-sm font-semibold">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-gray-400">({product.reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-gray-900">{formatPrice(product.price)}</span>
                {product.compareAtPrice && (
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
                )}
                {discount > 0 && (
                  <span className="text-sm font-bold text-green-600">Save {discount}%</span>
                )}
              </div>
            </div>

            {/* Size selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold">Size</p>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="flex items-center gap-1 text-xs text-grind-blue hover:underline"
                >
                  <Ruler size={13} /> Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                      selectedSize === s
                        ? 'border-grind-black bg-grind-black text-white'
                        : 'border-gray-200 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Color selector */}
            <div>
              <p className="text-sm font-bold mb-2">
                Color: <span className="font-normal text-gray-600">{selectedColor}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1.5 rounded-xl border-2 text-xs font-semibold transition-all ${
                      selectedColor === c
                        ? 'border-grind-black bg-grind-black text-white'
                        : 'border-gray-200 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    {selectedColor === c && <Check size={11} className="inline mr-1" />}{c}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="text-sm font-bold mb-2">Quantity</p>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl w-fit">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-3 hover:bg-gray-100 rounded-l-xl transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
                  className="p-3 hover:bg-gray-100 rounded-r-xl transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              {product.stock > 0 && product.stock < 10 && (
                <p className="text-xs text-orange-500 mt-1.5">Only {product.stock} left in stock!</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-grind-black text-white font-bold rounded-xl hover:bg-grind-black/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : <ShoppingCart size={18} />}
                {adding ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={handleWishlist}
                className={`p-4 rounded-xl border-2 transition-all ${
                  wishlisted ? 'border-red-500 bg-red-50 text-red-500' : 'border-gray-200 hover:border-gray-400 text-gray-600'
                }`}
              >
                <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="w-full py-4 bg-grind-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Buy Now
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[['🚚', 'Free shipping', 'over KES 2,500'], ['🔄', '30-day returns', 'Hassle-free'], ['🔒', 'Secure payment', 'M-Pesa & Cards']].map(([icon, title, sub]) => (
                <div key={title} className="text-center p-3 bg-gray-50 rounded-xl">
                  <div className="text-xl mb-1">{icon}</div>
                  <p className="text-xs font-semibold text-gray-700">{title}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="mt-16">
          <div className="flex border-b border-grind-border overflow-x-auto">
            {(['description', 'details', 'shipping', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-semibold capitalize whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-grind-black text-grind-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'reviews' ? `Reviews (${reviews.length})` : tab === 'details' ? 'Details & Care' : tab === 'shipping' ? 'Shipping Info' : 'Description'}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="max-w-2xl">
                <p className="text-gray-700 leading-relaxed text-base">{product.description}</p>
              </div>
            )}
            {activeTab === 'details' && (
              <div className="max-w-2xl space-y-4">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Product Details</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 100% Premium Cotton</li>
                    <li>• Heavyweight 380gsm fabric</li>
                    <li>• Ribbed cuffs and hem</li>
                    <li>• Embroidered GRIND BYTE logo</li>
                    <li>• Unisex fit</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Care Instructions</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Machine wash cold (30°C)</li>
                    <li>• Do not bleach</li>
                    <li>• Tumble dry low</li>
                    <li>• Iron on low heat</li>
                    <li>• Do not dry clean</li>
                  </ul>
                </div>
              </div>
            )}
            {activeTab === 'shipping' && (
              <div className="max-w-2xl space-y-4">
                {[
                  { title: 'Standard Delivery', desc: '3–5 business days · KES 300 (Free over KES 2,500)' },
                  { title: 'Express Delivery', desc: '1–2 business days · KES 600' },
                  { title: 'Nairobi CBD Pickup', desc: 'Same day · Free · Tom Mboya Street, Nairobi' },
                ].map(item => (
                  <div key={item.title} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="text-2xl">🚚</div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="max-w-3xl">
                {/* Rating summary */}
                <div className="flex items-center gap-6 mb-8 p-6 bg-gray-50 rounded-2xl">
                  <div className="text-center">
                    <p className="text-5xl font-black text-gray-900">{avgRating.toFixed(1)}</p>
                    <div className="flex justify-center gap-0.5 my-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < Math.floor(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">{product.reviewCount} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = reviews.filter(r => r.rating === star).length;
                      const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="w-4 text-gray-500">{star}</span>
                          <Star size={11} className="fill-yellow-400 text-yellow-400" />
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-6 text-gray-400">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review list */}
                <div className="space-y-5">
                  {reviews.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No reviews yet. Be the first!</p>
                  ) : reviews.map(review => (
                    <div key={review.id} className="border-b border-grind-border pb-5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-grind-blue text-white flex items-center justify-center text-sm font-bold">
                            {review.userName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{review.userName}</p>
                            <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={13} className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                          ))}
                        </div>
                      </div>
                      <p className="font-semibold text-sm text-gray-800 mb-1">{review.title}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RECENTLY VIEWED ── */}
        {recentProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Recently Viewed</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
              {recentProducts.map(p => (
                <ProductCard key={p.id} product={p} onClick={() => navigate(`/products/${p.slug || p.id}`)} />
              ))}
            </div>
          </section>
        )}

        {/* ── YOU MIGHT ALSO LIKE ── */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-black text-gray-900 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
              {related.map(p => (
                <ProductCard key={p.id} product={p} onClick={() => navigate(`/products/${p.slug || p.id}`)} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── SIZE GUIDE MODAL ── */}
      <AnimatePresence>
        {sizeGuideOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setSizeGuideOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-white rounded-2xl z-50 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-black">Size Guide</h3>
                <button onClick={() => setSizeGuideOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">All measurements in centimetres (CM)</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-grind-border">
                      <th className="text-left py-2 font-bold text-gray-700">Size</th>
                      <th className="text-center py-2 font-bold text-gray-700">Chest</th>
                      <th className="text-center py-2 font-bold text-gray-700">Waist</th>
                      <th className="text-center py-2 font-bold text-gray-700">Hips</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_GUIDE.map(row => (
                      <tr key={row.size} className={`border-b border-gray-100 ${selectedSize === row.size ? 'bg-blue-50' : ''}`}>
                        <td className="py-2.5 font-semibold">{row.size}</td>
                        <td className="py-2.5 text-center text-gray-600">{row.chest}</td>
                        <td className="py-2.5 text-center text-gray-600">{row.waist}</td>
                        <td className="py-2.5 text-center text-gray-600">{row.hips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── IMAGE ZOOM MODAL ── */}
      <AnimatePresence>
        {zoomed && product && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setZoomed(false)}
          >
            <button className="absolute top-4 right-4 p-2 text-white hover:text-gray-300">
              <X size={28} />
            </button>
            <img
              src={imageList[activeImage]}
              alt={product.name}
              className="max-w-full max-h-full object-contain rounded-xl"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
