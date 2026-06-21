import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Tag, Gift, Percent } from 'lucide-react';
import { updateQuantityLocal, removeFromCartLocal, applyCouponLocal, applyReferralLocal } from '../store/cartSlice';
import GlassCard from '../components/GlassCard';
import axios from 'axios';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, appliedCoupon, discountPercentage, referralDiscount } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [couponCode, setCouponCode] = useState(appliedCoupon || '');
  const [couponMsg, setCouponMsg] = useState('');
  const [couponError, setCouponError] = useState(false);
  const [hasReferral, setHasReferral] = useState(referralDiscount > 0);

  const handleQtyChange = async (productId, currentQty, amount, cartItemId) => {
    const newQty = currentQty + amount;
    if (newQty < 1) return;

    dispatch(updateQuantityLocal({ productId, quantity: newQty }));

    if (isAuthenticated && cartItemId) {
      try {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/cart/${cartItemId}`, {
          quantity: newQty
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('miv_access_token')}` }
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRemove = async (productId, cartItemId) => {
    dispatch(removeFromCartLocal(productId));

    if (isAuthenticated && cartItemId) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/cart/${cartItemId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('miv_access_token')}` }
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Calculations
  const subtotal = items.reduce((acc, curr) => {
    const price = parseFloat(curr.product?.offerPrice ?? curr.product?.offer_price ?? 0);
    const qty = parseInt(curr.quantity ?? 1, 10);
    return acc + (price * qty);
  }, 0);
  const grandTotal = subtotal;

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center flex flex-col items-center">
        <div className="p-6 rounded-full bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/20 mb-6 text-slate-400">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Your Cart is Empty</h2>
        <p className="text-xs text-slate-400 mb-8 max-w-xs leading-relaxed">
          Looks like you haven't added any organic masalas, health mixes, or traditional snacks yet.
        </p>
        <Link
          to="/"
          className="px-8 py-3.5 rounded-full font-bold text-xs text-white bg-brand hover:bg-brand-dark transition-all shadow-md active:scale-95"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-2">
        <ShoppingBag className="text-brand" /> Your Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Cart Items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const offerPrice = parseFloat(item.product?.offerPrice ?? item.product?.offer_price ?? 0);
            const originalPrice = parseFloat(item.product?.originalPrice ?? item.product?.original_price ?? 0);
            const imageUrl = item.product?.imageUrl ?? item.product?.image_url ?? '';
            return (
              <GlassCard key={item.product?.id} className="p-4 flex flex-col sm:flex-row items-center gap-4 justify-between" hover={false}>
                
                {/* Product Info */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img src={imageUrl} alt={item.product?.name} className="w-16 h-16 object-cover rounded-xl shadow-sm" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-1">{item.product?.name}</h3>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{item.product?.category}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-extrabold text-brand">₹{offerPrice}</span>
                      {originalPrice > offerPrice && (
                        <span className="text-[10px] text-slate-400 line-through">₹{originalPrice}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Adjust Qty and Totals */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0">
                  
                  {/* Qty controls */}
                  <div className="flex items-center rounded-xl bg-slate-100 dark:bg-neutral-800 p-1 border border-slate-200/50 dark:border-neutral-700/50">
                    <button
                      onClick={() => handleQtyChange(item.product?.id, item.quantity, -1, item.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs hover:bg-white dark:hover:bg-neutral-700"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => handleQtyChange(item.product?.id, item.quantity, 1, item.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs hover:bg-white dark:hover:bg-neutral-700"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[70px]">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">₹{(offerPrice * item.quantity).toFixed(2)}</span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleRemove(item.product?.id, item.id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </GlassCard>
            );
          })}
        </div>

        {/* Right Side: Order Summary Card */}
        <div className="lg:col-span-1 space-y-4">
          <GlassCard className="p-6">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-neutral-800 pb-2">Order Summary</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">₹{subtotal.toFixed(2)}</span>
              </div>


              <div className="border-t border-slate-100 dark:border-neutral-800 pt-3 mt-3 flex justify-between text-sm font-extrabold">
                <span className="text-slate-800 dark:text-slate-100">Estimated Total:</span>
                <span className="text-brand dark:text-brand-light">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-xs text-white bg-brand hover:bg-brand-dark transition-all shadow-md active:scale-95"
            >
              Proceed to Checkout <ArrowRight size={14} />
            </button>
          </GlassCard>

        </div>

      </div>
    </div>
  );
}
