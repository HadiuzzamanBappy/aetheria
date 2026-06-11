import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '@/store/useCartStore';
import { useCheckoutMutation } from '@/features/checkout/hooks/useCheckout';
import { Button, Input } from '@/components/ui';
import { formatCurrency } from '@/utils/format';
import { CheckCircle, ArrowLeft, CreditCard, Lock } from 'lucide-react';
import CardForm from '@/components/checkout/CardForm';
import type { CardDetails } from '@/components/checkout/CardForm';
import { useOrderStore } from '@/store/useOrderStore';
import { useUser } from '@clerk/react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items: cartItems, discountedTotal } = useCartStore();
  const { user, isLoaded } = useUser();

  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    addressLine1: '',
    city: '',
    postalCode: '',
    country: '',
  });

  useEffect(() => {
    if (isLoaded && user && !shippingForm.fullName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShippingForm((prev) => ({
        ...prev,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoaded]);

  // Coupon promo states
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  const [lastOrder, setLastOrder] = useState<any>(null);
  const [cardDetails, setCardDetails] = useState<CardDetails>({ cardNumber: '', expiry: '', cvc: '' });
  const [isCardValid, setIsCardValid] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const addOrder = useOrderStore((state) => state.addOrder);

  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponInput.trim().toUpperCase();
    if (code === 'AETHER20') {
      setAppliedCoupon('AETHER20');
      setCouponDiscount(0.20);
      setCouponInput('');
    } else if (code === 'WELCOME10') {
      setAppliedCoupon('WELCOME10');
      setCouponDiscount(0.10);
      setCouponInput('');
    } else {
      setCouponError('Invalid promo code. Please check spelling.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError('');
  };

  const couponSavings = discountedTotal * couponDiscount;
  const finalTotalAmount = Math.round((discountedTotal - couponSavings) * 100) / 100;

  const checkoutMutation = useCheckoutMutation({
    onSuccess: (data) => {
      const orderRecord = {
        ...data,
        message: appliedCoupon ? `Promo code ${appliedCoupon} applied. ${data.message}` : data.message,
        details: {
          ...data.details,
          totalAmount: finalTotalAmount,
        }
      };
      addOrder(orderRecord);
      setLastOrder(orderRecord);
    },
  });

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');
    const isFormFilled = Object.values(shippingForm).every((val) => val.trim() !== '');
    if (!isFormFilled || !isCardValid) return;

    const cleanCard = cardDetails.cardNumber.replace(/\s+/g, '');
    if (cleanCard.endsWith('4444')) {
      setPaymentError('Your card was declined. Please try another card.');
      return;
    }

    checkoutMutation.mutate({
      items: cartItems,
      shippingAddress: shippingForm,
      paymentMethod: 'Credit Card',
      totalAmount: finalTotalAmount,
    });
  };

  // If order was successfully completed
  if (lastOrder) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="glass border border-purple-900/30 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          <div className="h-16 w-16 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/5 animate-bounce">
            <CheckCircle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-2xl text-white">Order Confirmed!</h3>
            <p className="text-xs text-purple-300">
              Order ID: <span className="font-mono text-white font-semibold">{lastOrder.orderId}</span>
            </p>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed">
            Congratulations! Your transaction has completed successfully. A billing receipt has been logged.
          </p>

          <div className="border-t border-purple-900/15 pt-4 text-left space-y-2">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Delivering To:</h5>
            <p className="text-xs text-gray-400 leading-normal">
              {lastOrder.details.shippingAddress.fullName} <br />
              {lastOrder.details.shippingAddress.addressLine1} <br />
              {lastOrder.details.shippingAddress.city}, {lastOrder.details.shippingAddress.postalCode} <br />
              {lastOrder.details.shippingAddress.country}
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full py-3 rounded-xl font-semibold mt-4"
            onClick={() => {
              setLastOrder(null);
              navigate('/');
            }}
          >
            Return to Store
          </Button>
        </div>
      </div>
    );
  }

  // If cart is empty and checkout hasn't occurred yet
  if (cartItems.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-white font-semibold text-lg">Your checkout session is empty</p>
        <p className="text-gray-400 text-sm">Add products to your cart before proceeding here.</p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Return to Catalog
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Store
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form: Delivery info */}
        <div className="lg:col-span-2 space-y-6 glass p-6 md:p-8 rounded-3xl border border-purple-900/15">
          <div className="border-b border-purple-900/20 pb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary-400" /> Delivery Specifications
            </h2>
            <span className="text-xs text-purple-300 flex items-center gap-1.5">
              <Lock className="h-3 w-3" /> Secure 256-bit Connection
            </span>
          </div>

          <form onSubmit={handleCheckoutSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              required
              value={shippingForm.fullName}
              onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
            />
            <Input
              label="Address Line 1"
              placeholder="123 Nebula Way"
              required
              value={shippingForm.addressLine1}
              onChange={(e) => setShippingForm({ ...shippingForm, addressLine1: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                placeholder="San Francisco"
                required
                value={shippingForm.city}
                onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
              />
              <Input
                label="Postal Code"
                placeholder="94102"
                required
                value={shippingForm.postalCode}
                onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
              />
            </div>
            <Input
              label="Country"
              placeholder="United States"
              required
              value={shippingForm.country}
              onChange={(e) => setShippingForm({ ...shippingForm, country: e.target.value })}
            />

            <div className="pt-2">
              <CardForm
                onChange={(details, isValid) => {
                  setCardDetails(details);
                  setIsCardValid(isValid);
                }}
                error={paymentError}
              />
            </div>

            {paymentError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-medium">
                {paymentError}
              </div>
            )}

            <Button
              variant="primary"
              type="submit"
              disabled={!isCardValid}
              isLoading={checkoutMutation.isPending}
              className="w-full py-3.5 mt-6 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirm Checkout & Place Order
            </Button>
          </form>
        </div>

        {/* Right Panel: Order Summary */}
        <div className="space-y-6 lg:col-span-1">
          <div className="glass p-6 rounded-3xl border border-purple-900/15 space-y-6">
            <h3 className="font-bold text-lg text-white border-b border-purple-900/15 pb-4">
              Order Summary
            </h3>
            
            {/* Items display */}
            <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-2 text-sm">
                  <span className="text-gray-400 line-clamp-1 flex-1">
                    {item.title} <strong className="text-white">x {item.quantity}</strong>
                  </span>
                  <span className="font-semibold text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo / Coupon Box */}
            <div className="pt-4 border-t border-purple-900/15 space-y-2">
              <label className="text-[10px] text-gray-500 uppercase block font-semibold">Promo Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. AETHER20"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  disabled={!!appliedCoupon}
                  className="bg-purple-950/10 border border-purple-900/30 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-primary-500/50 flex-1 uppercase disabled:opacity-50 text-slate-950"
                />
                {appliedCoupon ? (
                  <button
                    onClick={handleRemoveCoupon}
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all cursor-pointer"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleApplyCoupon}
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow transition-all cursor-pointer"
                  >
                    Apply
                  </button>
                )}
              </div>
              {couponError && (
                <div className="text-[10px] text-red-400 font-semibold">{couponError}</div>
              )}
              {appliedCoupon && (
                <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                  Code <span className="font-mono bg-emerald-500/10 px-1 rounded">{appliedCoupon}</span> Applied ({Math.round(couponDiscount * 100)}% Off!)
                </div>
              )}
            </div>

            {/* Calculations math */}
            <div className="pt-4 border-t border-purple-900/15 space-y-3 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{formatCurrency(discountedTotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-500 font-medium">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(couponSavings)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span className="text-emerald-400 font-semibold">Free</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-purple-900/10">
                <span>Total Amount</span>
                <span>{formatCurrency(finalTotalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
