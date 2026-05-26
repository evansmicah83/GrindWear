import { useState } from 'react';
import { ArrowLeft, CreditCard, Smartphone, Banknote, Check, Loader2 } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../../lib/utils';
import { backendEmulator } from '../services/backendEmulator';
import { toast } from 'sonner';
import type { Address } from '../types';

type PaymentMethod = 'mpesa' | 'card' | 'cash';

export function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<'shipping' | 'payment' | 'processing'>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [processing, setProcessing] = useState(false);

  const [shippingData, setShippingData] = useState({
    fullName: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Kenya'
  });

  const [paymentData, setPaymentData] = useState({
    mpesaPhone: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    cardName: ''
  });

  const deliveryFee = total > 5000 ? 0 : 300;
  const tax = total * 0.16;
  const finalTotal = total + deliveryFee + tax;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setStep('processing');

    try {
      const shippingAddress: Address = {
        id: Date.now().toString(),
        fullName: shippingData.fullName,
        phone: shippingData.phone,
        street: shippingData.street,
        city: shippingData.city,
        state: shippingData.state,
        zipCode: shippingData.zipCode,
        country: shippingData.country,
        isDefault: false
      };

      const paymentDetails = {
        method: paymentMethod,
        phoneNumber: paymentMethod === 'mpesa' ? paymentData.mpesaPhone : undefined,
        cardNumber: paymentMethod === 'card' ? paymentData.cardNumber : undefined,
        cardExpiry: paymentMethod === 'card' ? paymentData.cardExpiry : undefined,
        cardCVV: paymentMethod === 'card' ? paymentData.cardCVV : undefined
      };

      const result = await backendEmulator.createOrder({
        items,
        total: finalTotal,
        shippingAddress,
        paymentDetails
      });

      if (result.success && result.order) {
        toast.success('Order placed successfully!', {
          description: `Order ID: ${result.order.id}`,
          duration: 5000
        });

        clearCart();

        setTimeout(() => {
          window.location.href = `/order-confirmation?orderId=${result.order!.id}`;
        }, 1500);
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error: any) {
      toast.error('Payment failed', {
        description: error.message || 'Please try again'
      });
      setStep('payment');
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button onClick={() => window.location.href = '/products'}>
            Continue Shopping
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => window.location.href = '/cart'}
          className="flex items-center gap-2 text-gray-600 hover:text-grind-black mb-6"
        >
          <ArrowLeft size={20} />
          Back to Cart
        </button>

        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-grind-blue' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step !== 'shipping' ? 'bg-green-500 text-white' : 'bg-grind-blue text-white'}`}>
                {step !== 'shipping' ? <Check size={16} /> : '1'}
              </div>
              <span className="font-medium hidden sm:inline">Shipping</span>
            </div>
            <div className="h-px w-16 bg-gray-300" />
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-grind-blue' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'processing' ? 'bg-green-500 text-white' : step === 'payment' ? 'bg-grind-blue text-white' : 'bg-gray-300'}`}>
                {step === 'processing' ? <Check size={16} /> : '2'}
              </div>
              <span className="font-medium hidden sm:inline">Payment</span>
            </div>
            <div className="h-px w-16 bg-gray-300" />
            <div className={`flex items-center gap-2 ${step === 'processing' ? 'text-grind-blue' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'processing' ? 'bg-grind-blue text-white' : 'bg-gray-300'}`}>
                3
              </div>
              <span className="font-medium hidden sm:inline">Confirm</span>
            </div>
          </div>
        </div>

        {step === 'shipping' && (
          <Card padding="lg">
            <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <Input
                label="Full Name"
                value={shippingData.fullName}
                onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="0712345678"
                value={shippingData.phone}
                onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                required
              />
              <Input
                label="Street Address"
                value={shippingData.street}
                onChange={(e) => setShippingData({ ...shippingData, street: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={shippingData.city}
                  onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                  required
                />
                <Input
                  label="State/County"
                  value={shippingData.state}
                  onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Postal Code"
                  value={shippingData.zipCode}
                  onChange={(e) => setShippingData({ ...shippingData, zipCode: e.target.value })}
                  required
                />
                <Input
                  label="Country"
                  value={shippingData.country}
                  onChange={(e) => setShippingData({ ...shippingData, country: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" fullWidth size="lg">
                Continue to Payment
              </Button>
            </form>
          </Card>
        )}

        {step === 'payment' && (
          <div className="space-y-6">
            <Card padding="lg">
              <h2 className="text-2xl font-bold mb-6">Payment Method</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'mpesa'
                      ? 'border-grind-blue bg-blue-50'
                      : 'border-grind-border hover:border-gray-400'
                  }`}
                >
                  <Smartphone className="mx-auto mb-2 text-green-600" size={32} />
                  <p className="font-medium">M-Pesa</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'card'
                      ? 'border-grind-blue bg-blue-50'
                      : 'border-grind-border hover:border-gray-400'
                  }`}
                >
                  <CreditCard className="mx-auto mb-2 text-grind-blue" size={32} />
                  <p className="font-medium">Card</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-grind-blue bg-blue-50'
                      : 'border-grind-border hover:border-gray-400'
                  }`}
                >
                  <Banknote className="mx-auto mb-2 text-grind-warning" size={32} />
                  <p className="font-medium">Cash on Delivery</p>
                </button>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                {paymentMethod === 'mpesa' && (
                  <Input
                    label="M-Pesa Phone Number"
                    type="tel"
                    placeholder="254712345678"
                    value={paymentData.mpesaPhone}
                    onChange={(e) => setPaymentData({ ...paymentData, mpesaPhone: e.target.value })}
                    required
                  />
                )}

                {paymentMethod === 'card' && (
                  <>
                    <Input
                      label="Card Holder Name"
                      value={paymentData.cardName}
                      onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                      required
                    />
                    <Input
                      label="Card Number"
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Expiry Date"
                        placeholder="MM/YY"
                        value={paymentData.cardExpiry}
                        onChange={(e) => setPaymentData({ ...paymentData, cardExpiry: e.target.value })}
                        required
                      />
                      <Input
                        label="CVV"
                        placeholder="123"
                        value={paymentData.cardCVV}
                        onChange={(e) => setPaymentData({ ...paymentData, cardCVV: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}

                {paymentMethod === 'cash' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Cash on Delivery:</strong> Pay when your order arrives. Please have the exact amount ready.
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('shipping')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" size="lg">
                    Place Order - {formatPrice(finalTotal)}
                  </Button>
                </div>
              </form>
            </Card>

            <Card padding="lg">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span>{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (16%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {step === 'processing' && (
          <Card padding="lg">
            <div className="text-center py-12">
              <Loader2 className="animate-spin mx-auto mb-4 text-grind-blue" size={48} />
              <h2 className="text-2xl font-bold mb-2">Processing your order...</h2>
              <p className="text-gray-600">
                {paymentMethod === 'mpesa' && 'Please complete the M-Pesa prompt on your phone'}
                {paymentMethod === 'card' && 'Processing your card payment...'}
                {paymentMethod === 'cash' && 'Confirming your order...'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
