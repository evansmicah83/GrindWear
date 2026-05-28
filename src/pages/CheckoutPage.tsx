import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Check, CreditCard, Smartphone, Banknote, MapPin, Loader2, CheckCircle2, Package } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

const KENYA_COUNTIES = [
  'Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Malindi','Kitale','Garissa','Kakamega',
  'Nyeri','Meru','Embu','Machakos','Kilifi','Kwale','Lamu','Tana River','Isiolo','Marsabit',
  'Mandera','Wajir','Turkana','West Pokot','Samburu','Trans Nzoia','Uasin Gishu','Elgeyo-Marakwet',
  'Nandi','Baringo','Laikipia','Nyahururu','Nyandarua','Kirinyaga','Murang\'a','Kiambu','Kajiado',
  'Makueni','Kitui','Tharaka-Nithi','Meru','Isiolo','Siaya','Kisumu','Homa Bay','Migori','Kisii',
  'Nyamira','Bomet','Kericho','Narok','Vihiga','Bungoma','Busia','Kakamega','Lugari',
];

type Step = 'shipping' | 'delivery' | 'payment' | 'confirmation';
type PaymentMethod = 'mpesa' | 'card' | 'cash';
type DeliveryMethod = 'standard' | 'express' | 'pickup';

const DELIVERY_OPTIONS = [
  { id: 'standard' as DeliveryMethod, label: 'Standard Delivery', desc: '3–5 business days', price: (sub: number) => sub >= 2500 ? 0 : 300, badge: sub => sub >= 2500 ? 'FREE' : 'KES 300' },
  { id: 'express' as DeliveryMethod, label: 'Express Delivery', desc: '1–2 business days', price: () => 600, badge: () => 'KES 600' },
  { id: 'pickup' as DeliveryMethod, label: 'Nairobi CBD Pickup', desc: 'Tom Mboya Street, Nairobi', price: () => 0, badge: () => 'FREE' },
];

function StepIndicator({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: 'shipping', label: 'Shipping' },
    { id: 'delivery', label: 'Delivery' },
    { id: 'payment', label: 'Payment' },
    { id: 'confirmation', label: 'Confirm' },
  ];
  const idx = steps.findIndex(s => s.id === current);

  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-2">
          <div className={`flex items-center gap-2 ${i <= idx ? 'text-grind-black' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              i < idx ? 'bg-green-500 text-white' : i === idx ? 'bg-grind-black text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {i < idx ? <Check size={14} /> : i + 1}
            </div>
            <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-px w-8 sm:w-12 transition-colors ${i < idx ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, discount, clearCart } = useCart();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Guard: redirect unauthenticated users unless guest checkout is enabled
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      api.getSettings().then(r => {
        if (r.data?.allow_guest_checkout === 'true') return; // allow through
        Swal.fire({
          icon: 'info',
          title: 'Sign in to checkout',
          html: `
          <p style="color:#6b7280;font-size:14px;margin-bottom:4px">
            Your cart items are saved. Sign in or create a free account to complete your order.
          </p>`,
          showCancelButton: true,
          confirmButtonText: '🔐 Sign In',
          cancelButtonText: 'Continue Browsing',
          confirmButtonColor: '#111827',
          cancelButtonColor: '#6b7280',
          customClass: { popup: 'rounded-2xl shadow-2xl font-sans' },
        }).then(result => {
          if (result.isConfirmed) navigate('/login', { state: { from: '/checkout' } });
          else navigate('/cart');
        });
      }).catch(() => {
        navigate('/login', { state: { from: '/checkout' } });
      });
    }
  }, [isAuthenticated, isLoading]);

  const [step, setStep] = useState<Step>('shipping');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [processing, setProcessing] = useState(false);
  const [mpesaPollCount, setMpesaPollCount] = useState(0);
  const [orderId, setOrderId] = useState('');

  const [shipping, setShipping] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    county: 'Nairobi',
    postalCode: '',
  });

  const [payment, setPayment] = useState({
    mpesaPhone: user?.phone || '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
  });

  const deliveryFee = DELIVERY_OPTIONS.find(d => d.id === deliveryMethod)?.price(subtotal) ?? 300;
  const orderTotal = subtotal - discount + deliveryFee;

  // M-Pesa polling simulation
  useEffect(() => {
    if (step !== 'payment' || paymentMethod !== 'mpesa' || !processing) return;
    if (mpesaPollCount >= 20) {
      toast.error('M-Pesa payment timed out. Please try again.');
      setProcessing(false);
      setMpesaPollCount(0);
      return;
    }
    const timer = setTimeout(() => setMpesaPollCount(c => c + 1), 3000);
    return () => clearTimeout(timer);
  }, [processing, mpesaPollCount, step, paymentMethod]);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('delivery');
  };

  const handleDeliverySubmit = () => setStep('payment');

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    if (paymentMethod === 'mpesa') {
      setMpesaPollCount(1);
      // Simulate STK push + polling — resolve after ~6s
      await new Promise(r => setTimeout(r, 6000));
    } else {
      await new Promise(r => setTimeout(r, 2000));
    }

    try {
      const res = await api.createOrder({
        items: items.map(i => ({
          id: i.id,
          productId: i.product.id,
          productName: i.product.name,
          productImage: i.product.images[0],
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          price: i.product.price,
        })),
        subtotal,
        discount_amount: discount,
        shipping_cost: deliveryFee,
        total: orderTotal,
        shippingAddress: { ...shipping, country: 'Kenya', isDefault: false, id: Date.now().toString() },
        deliveryMethod,
        paymentMethod,
      });
      const order = (res as any)?.data ?? res;
      setOrderId(order.order_number || order.id || 'N/A');
      clearCart();
      setStep('confirmation');
    } catch (err: any) {
      toast.error('Payment failed', { description: err.message || 'Please try again' });
    } finally {
      setProcessing(false);
      setMpesaPollCount(0);
    }
  };

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <button onClick={() => navigate('/products')} className="px-6 py-3 bg-grind-black text-white rounded-xl font-semibold">
            Continue Shopping
          </button>
        </div>
      </MainLayout>
    );
  }

  // Order summary sidebar
  const OrderSummary = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className={`bg-gray-50 rounded-2xl p-5 ${collapsed ? '' : 'sticky top-24'}`}>
      <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
      <div className="space-y-3 mb-4">
        {items.map(item => (
          <div key={item.id} className="flex gap-3">
            <div className="relative">
              <ImageWithFallback src={item.product.images[0]} alt={item.product.name} className="w-14 h-14 object-cover rounded-lg" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.product.name}</p>
              <p className="text-xs text-gray-500">{item.size} · {item.color}</p>
            </div>
            <p className="text-sm font-bold">{formatPrice(item.product.price * item.quantity)}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-grind-border pt-3 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
        {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
        <div className="flex justify-between text-gray-600">
          <span>Delivery</span>
          <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
        </div>
        <div className="flex justify-between font-black text-base pt-2 border-t border-grind-border">
          <span>Total</span><span>{formatPrice(orderTotal)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout hideFooter>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={() => step === 'shipping' ? navigate('/cart') : setStep(s => s === 'delivery' ? 'shipping' : s === 'payment' ? 'delivery' : 'shipping')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft size={18} /> Back
        </button>

        <StepIndicator current={step} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">

            {/* ── STEP 1: SHIPPING ── */}
            {step === 'shipping' && (
              <div className="bg-white border border-grind-border rounded-2xl p-6">
                <h2 className="text-2xl font-black mb-6">Contact & Shipping</h2>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">Full Name</label>
                      <input required value={shipping.fullName} onChange={e => setShipping(s => ({ ...s, fullName: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-grind-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">Email</label>
                      <input type="email" required value={shipping.email} onChange={e => setShipping(s => ({ ...s, email: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-grind-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Phone Number</label>
                    <input type="tel" required placeholder="0712345678" value={shipping.phone} onChange={e => setShipping(s => ({ ...s, phone: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-grind-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Street Address</label>
                    <input required value={shipping.street} onChange={e => setShipping(s => ({ ...s, street: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-grind-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">City</label>
                      <input required value={shipping.city} onChange={e => setShipping(s => ({ ...s, city: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-grind-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">County</label>
                      <select required value={shipping.county} onChange={e => setShipping(s => ({ ...s, county: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-grind-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue bg-white">
                        {KENYA_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5">Postal Code</label>
                    <input value={shipping.postalCode} onChange={e => setShipping(s => ({ ...s, postalCode: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-grind-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue" />
                  </div>
                  <button type="submit" className="w-full py-4 bg-grind-black text-white font-bold rounded-xl hover:bg-grind-black/90 transition-colors mt-2">
                    Continue to Delivery
                  </button>
                </form>
              </div>
            )}

            {/* ── STEP 2: DELIVERY ── */}
            {step === 'delivery' && (
              <div className="bg-white border border-grind-border rounded-2xl p-6">
                <h2 className="text-2xl font-black mb-6">Delivery Method</h2>
                <div className="space-y-3 mb-6">
                  {DELIVERY_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDeliveryMethod(opt.id)}
                      className={`w-full flex items-center justify-between p-4 border-2 rounded-xl transition-all text-left ${
                        deliveryMethod === opt.id ? 'border-grind-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          deliveryMethod === opt.id ? 'border-grind-black' : 'border-gray-300'
                        }`}>
                          {deliveryMethod === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-grind-black" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{opt.label}</p>
                          <p className="text-sm text-gray-500">{opt.desc}</p>
                          {opt.id === 'pickup' && deliveryMethod === 'pickup' && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-grind-blue">
                              <MapPin size={12} /> Tom Mboya Street, Nairobi CBD
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${opt.price(subtotal) === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {opt.badge(subtotal)}
                      </span>
                    </button>
                  ))}
                </div>
                <button onClick={handleDeliverySubmit} className="w-full py-4 bg-grind-black text-white font-bold rounded-xl hover:bg-grind-black/90 transition-colors">
                  Continue to Payment
                </button>
              </div>
            )}

            {/* ── STEP 3: PAYMENT ── */}
            {step === 'payment' && (
              <div className="bg-white border border-grind-border rounded-2xl p-6">
                <h2 className="text-2xl font-black mb-6">Payment</h2>

                {/* Method selector */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {([
                    { id: 'mpesa', label: 'M-Pesa', icon: '📱', color: 'text-green-600' },
                    { id: 'card', label: 'Card', icon: '💳', color: 'text-grind-blue' },
                    { id: 'cash', label: 'Cash on Delivery', icon: '💵', color: 'text-yellow-600' },
                  ] as const).map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-4 border-2 rounded-xl transition-all text-center ${
                        paymentMethod === m.id ? 'border-grind-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{m.icon}</div>
                      <p className="text-xs font-semibold text-gray-700">{m.label}</p>
                    </button>
                  ))}
                </div>

                {/* M-Pesa polling UI */}
                {processing && paymentMethod === 'mpesa' && (
                  <div className="mb-6 p-5 bg-green-50 border border-green-200 rounded-xl text-center">
                    <Loader2 className="animate-spin mx-auto mb-3 text-green-600" size={32} />
                    <p className="font-bold text-green-800 mb-1">STK Push Sent!</p>
                    <p className="text-sm text-green-700">Check your phone and enter your M-Pesa PIN</p>
                    <div className="mt-3 flex justify-center gap-1">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className={`h-1 w-3 rounded-full transition-all ${i < mpesaPollCount ? 'bg-green-500' : 'bg-green-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-green-600 mt-2">Waiting for confirmation... ({mpesaPollCount * 3}s)</p>
                  </div>
                )}

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  {paymentMethod === 'mpesa' && !processing && (
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">M-Pesa Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="254712345678"
                        value={payment.mpesaPhone}
                        onChange={e => setPayment(p => ({ ...p, mpesaPhone: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-grind-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue"
                      />
                      <p className="text-xs text-gray-400 mt-1">Format: 254XXXXXXXXX</p>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold mb-1.5">Cardholder Name</label>
                        <input required value={payment.cardName} onChange={e => setPayment(p => ({ ...p, cardName: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-grind-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1.5">Card Number</label>
                        <input required placeholder="1234 5678 9012 3456" value={payment.cardNumber} onChange={e => setPayment(p => ({ ...p, cardNumber: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-grind-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1.5">Expiry</label>
                          <input required placeholder="MM/YY" value={payment.cardExpiry} onChange={e => setPayment(p => ({ ...p, cardExpiry: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-grind-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1.5">CVV</label>
                          <input required placeholder="123" value={payment.cardCVV} onChange={e => setPayment(p => ({ ...p, cardCVV: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-grind-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-grind-blue" />
                        </div>
                      </div>
                    </>
                  )}

                  {paymentMethod === 'cash' && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <p className="text-sm text-gray-700">
                        <strong>Cash on Delivery:</strong> Pay when your order arrives. Please have the exact amount of <strong>{formatPrice(orderTotal)}</strong> ready.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Available for select counties only.</p>
                    </div>
                  )}

                  {!processing && (
                    <button
                      type="submit"
                      className="w-full py-4 bg-grind-black text-white font-bold rounded-xl hover:bg-grind-black/90 transition-colors flex items-center justify-center gap-2"
                    >
                      {paymentMethod === 'mpesa' ? `Send M-Pesa Request · ${formatPrice(orderTotal)}` :
                       paymentMethod === 'card' ? `Pay ${formatPrice(orderTotal)}` :
                       `Place Order · ${formatPrice(orderTotal)}`}
                    </button>
                  )}
                </form>
              </div>
            )}

            {/* ── STEP 4: CONFIRMATION ── */}
            {step === 'confirmation' && (
              <div className="bg-white border border-grind-border rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 size={40} className="text-green-500" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Order Confirmed! 🎉</h2>
                <p className="text-gray-500 mb-2">Thank you for your purchase</p>
                <p className="text-sm font-semibold text-grind-blue mb-6">Order #{orderId}</p>

                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <Package size={18} className="text-grind-blue" />
                    <span className="font-semibold text-gray-900">Estimated Delivery</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {deliveryMethod === 'express' ? '1–2 business days' :
                     deliveryMethod === 'pickup' ? 'Ready for pickup today' :
                     '3–5 business days'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">A confirmation email has been sent to {shipping.email}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate('/account/orders')}
                    className="flex-1 py-3 border-2 border-grind-black text-grind-black font-bold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Track Order
                  </button>
                  <button
                    onClick={() => navigate('/products')}
                    className="flex-1 py-3 bg-grind-black text-white font-bold rounded-xl hover:bg-grind-black/90 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          {step !== 'confirmation' && (
            <div className="lg:col-span-2">
              <OrderSummary />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
