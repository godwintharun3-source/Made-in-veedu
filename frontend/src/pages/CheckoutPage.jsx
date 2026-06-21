import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, ShoppingCart, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { clearCartLocal } from '../store/cartSlice';
import GlassCard from '../components/GlassCard';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import confetti from 'canvas-confetti';
import { logout } from '../store/authSlice';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, appliedCoupon, discountPercentage, referralDiscount } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [address, setAddress] = useState({
    state: '',
    district: '',
    city: '',
    village: '',
    addressLine: '',
    pincode: '',
  });

  const [isPaying, setIsPaying] = useState(false);
  const [payingStatus, setPayingStatus] = useState('');
  const [payingError, setPayingError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Prefill with user's encrypted address details decrypted on load by backend
    if (user) {
      setAddress({
        state: user.state || '',
        district: user.district || '',
        city: user.city || '',
        village: user.village || '',
        addressLine: user.addressLine || '',
        pincode: user.pincode || '',
      });
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((acc, curr) => {
      const price = parseFloat(curr.product?.offerPrice ?? curr.product?.offer_price ?? 0);
      const qty = parseInt(curr.quantity ?? 1, 10);
      return acc + (price * qty);
    }, 0);
    const grandTotal = subtotal;
    return { subtotal, grandTotal };
  };

  const { subtotal, grandTotal } = calculateTotals();

  const handlePlaceOrder = async () => {
    setIsPaying(true);
    setPayingError('');
    setPayingStatus('Processing Order...');

    const formattedAddress = `${address.addressLine}, ${address.village ? address.village + ', ' : ''}${address.city}, ${address.district}, ${address.state} - ${address.pincode}`;

    try {
      await finalizeOrder(formattedAddress);
    } catch (err) {
      console.error(err);
      setPayingError('Failed to initialize order.');
      setIsPaying(false);
    }
  };

  const finalizeOrder = async (fullAddress) => {
    try {
      const payload = {
        paymentMethod: 'Direct',
        shippingAddress: fullAddress,
        couponCode: null
      };

      const res = await axios.post('http://localhost:8080/api/orders', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('miv_access_token')}` }
      });

      // Celebrate success!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      const baseEmailParams = {
        customer_name: user?.name || 'Customer',
        customer_email: user?.email || 'N/A',
        customer_phone: user?.phoneNumber || 'N/A',
        shipping_address: fullAddress,
        order_total: grandTotal.toFixed(2),
        order_items: items.map(i => `${i.product?.name} (x${i.quantity})`).join(', ')
      };

      try {
        // Send to Admin
        await emailjs.send('service_rzpebcj', 'template_1wwa7gb', { ...baseEmailParams, to_email: '727725eucy607@skcet.ac.in' }, 'wuq-LNDgrfnhp2N48');
        
        // Send to Customer
        if (user?.email) {
          await emailjs.send('service_rzpebcj', 'template_1wwa7gb', { ...baseEmailParams, to_email: user.email }, 'wuq-LNDgrfnhp2N48');
        }
      } catch (emailErr) {
        console.error("EmailJS Error: ", emailErr);
      }

      dispatch(clearCartLocal());
      setIsPaying(false);

      // Navigate directly to Tracking Page with order details
      navigate(`/tracking/${res.data.id}`);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        dispatch(logout());
        navigate('/login');
        return;
      }
      setPayingError(err.response?.data?.message || 'Error executing order creation on backend.');
      setIsPaying(false);
    }
  };



  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-2">
        <ShieldCheck className="text-brand" /> Checkout &amp; Pay
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Delivery Details & Payments */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Shipping address form */}
          <GlassCard className="p-6">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-neutral-800 pb-2">
              <MapPin size={18} className="text-brand" /> Delivery Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Address Line</label>
                <input
                  type="text"
                  required
                  name="addressLine"
                  value={address.addressLine}
                  onChange={handleInputChange}
                  placeholder="Door No, Street name"
                  className="w-full px-4 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Village / Suburb</label>
                <input
                  type="text"
                  name="village"
                  value={address.village}
                  onChange={handleInputChange}
                  placeholder="e.g. Veedu Village"
                  className="w-full px-4 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">City</label>
                <input
                  type="text"
                  required
                  name="city"
                  value={address.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="w-full px-4 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">District</label>
                <input
                  type="text"
                  required
                  name="district"
                  value={address.district}
                  onChange={handleInputChange}
                  placeholder="District"
                  className="w-full px-4 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">State</label>
                <input
                  type="text"
                  required
                  name="state"
                  value={address.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  className="w-full px-4 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pincode</label>
                <input
                  type="text"
                  required
                  name="pincode"
                  value={address.pincode}
                  onChange={handleInputChange}
                  placeholder="6-digit Pin"
                  className="w-full px-4 py-3 rounded-2xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>
          </GlassCard>



        </div>

        {/* Right Column: Checkout summary */}
        <div className="lg:col-span-1 space-y-4">
          
          <GlassCard className="p-6">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-neutral-800 pb-2 flex items-center gap-1.5">
              <ShoppingCart size={16} className="text-brand" /> Checkout Summary
            </h3>

            {/* Item listing */}
            <div className="divide-y divide-slate-100 dark:divide-neutral-800 mb-6 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => {
                const offerPrice = parseFloat(item.product?.offerPrice ?? item.product?.offer_price ?? 0);
                const quantity = parseInt(item.quantity ?? 1, 10);
                return (
                  <div key={item.product?.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{item.product?.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Qty: {quantity}</p>
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">₹{(offerPrice * quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            {/* Calculations details */}
            <div className="space-y-3 text-xs border-t border-slate-100 dark:border-neutral-800 pt-4">
              <div className="flex justify-between text-slate-500">
                <span>Cart Subtotal:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">₹{subtotal.toFixed(2)}</span>
              </div>


              <div className="border-t border-slate-100 dark:border-neutral-800 pt-3 mt-3 flex justify-between text-sm font-extrabold">
                <span className="text-slate-800 dark:text-slate-100">Grand Total:</span>
                <span className="text-brand dark:text-brand-light">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {payingError && (
              <p className="text-[10px] font-bold text-rose-500 mt-4 text-center">{payingError}</p>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={isPaying}
              className="mt-6 w-full py-4 rounded-2xl font-bold text-xs text-white bg-brand hover:bg-brand-dark transition-all shadow-md active:scale-95 disabled:bg-slate-200 disabled:text-slate-400"
            >
              {isPaying ? payingStatus : 'Place Order'}
            </button>
          </GlassCard>

        </div>

      </div>


    </div>
  );
}
