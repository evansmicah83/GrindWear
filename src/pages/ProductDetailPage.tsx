import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, ShoppingCart, Heart, Star, Minus, Plus, Check } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useCart } from '../contexts/CartContext';
import { api } from '../services/api';
import { formatPrice } from '../../lib/utils';
import { toast } from 'sonner';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.getProduct(id)
      .then(p => { setProduct(p); setSelectedSize(p.sizes[0]); setSelectedColor(p.colors[0]); })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) return toast.error('Please select size and color');
    setAdding(true);
    await new Promise(r => setTimeout(r, 300));
    addItem(product, selectedSize, selectedColor, quantity);
    toast.success(`${product.name} added to cart!`, { description: `${selectedSize} · ${selectedColor}` });
    setAdding(false);
  };

  const discount = product?.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  if (loading) return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />)}
          </div>
        </div>
      </div>
    </MainLayout>
  );

  if (!product) return null;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 cursor-pointer transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${activeImage === i ? 'border-gray-900' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-blue-600 uppercase tracking-widest">{product.category}</span>
                {product.trending && <Badge variant="info">Trending</Badge>}
                {discount > 0 && <Badge variant="danger">-{discount}%</Badge>}
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-3">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                  ))}
                </div>
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-gray-500">({product.reviewCount} reviews)</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-gray-900">{formatPrice(product.price)}</span>
                {product.compareAtPrice && (
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.compareAtPrice)}</span>
                )}
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            {/* Size */}
            <div>
              <p className="text-sm font-semibold mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium cursor-pointer transition-all ${selectedSize === s ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 hover:border-gray-400'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <p className="text-sm font-semibold mb-2">Color: <span className="font-normal text-gray-600">{selectedColor}</span></p>
              <div className="flex gap-2">
                {product.colors.map((c: string) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    title={c}
                    className={`px-3 py-1.5 rounded-lg border-2 text-xs font-medium cursor-pointer transition-all ${selectedColor === c ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 hover:border-gray-400'}`}
                  >
                    {selectedColor === c && <Check size={12} className="inline mr-1" />}{c}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="text-sm font-semibold mb-2">Quantity</p>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl w-fit">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 hover:bg-gray-100 rounded-l-xl cursor-pointer transition-colors"><Minus size={16} /></button>
                <span className="w-10 text-center font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="p-3 hover:bg-gray-100 rounded-r-xl cursor-pointer transition-colors"><Plus size={16} /></button>
              </div>
              {product.stock < 10 && <p className="text-xs text-orange-500 mt-1">Only {product.stock} left!</p>}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button size="lg" className="flex-1 cursor-pointer" onClick={handleAddToCart} loading={adding}>
                {!adding && <ShoppingCart size={18} />}
                {adding ? 'Adding...' : 'Add to Cart'}
              </Button>
              <button
                onClick={() => { setWishlisted(w => !w); toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist', { icon: <Heart size={16} className={!wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'} /> }); }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${wishlisted ? 'border-red-500 bg-red-50 text-red-500' : 'border-gray-200 hover:border-gray-400'}`}
              >
                <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
