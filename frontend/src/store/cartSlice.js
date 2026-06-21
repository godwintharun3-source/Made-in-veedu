import { createSlice } from '@reduxjs/toolkit';

const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem('miv_cart');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCartFromStorage(),
    appliedCoupon: null,
    discountPercentage: 0,
    referralDiscount: 0, // Referral system bonus (flat ₹50 off for referral)
  },
  reducers: {
    setCartItems: (state, action) => {
      state.items = action.payload;
      localStorage.setItem('miv_cart', JSON.stringify(state.items));
    },
    addToCartLocal: (state, action) => {
      const { product, quantity } = action.payload;
      const existing = state.items.find((item) => item.product.id === product.id);
      const price = parseFloat(product.offerPrice ?? product.offer_price ?? 0);
      const qty = parseInt(quantity ?? 1, 10);

      if (existing) {
        existing.quantity += qty;
        existing.subtotal = parseFloat((price * existing.quantity).toFixed(2));
      } else {
        state.items.push({
          product,
          quantity: qty,
          subtotal: parseFloat((price * qty).toFixed(2)),
        });
      }
      localStorage.setItem('miv_cart', JSON.stringify(state.items));
    },
    updateQuantityLocal: (state, action) => {
      const { productId, quantity } = action.payload;
      const existing = state.items.find((item) => item.product.id === productId);
      if (existing) {
        const price = parseFloat(existing.product.offerPrice ?? existing.product.offer_price ?? 0);
        const qty = parseInt(quantity ?? 1, 10);
        existing.quantity = qty;
        existing.subtotal = parseFloat((price * qty).toFixed(2));
      }
      localStorage.setItem('miv_cart', JSON.stringify(state.items));
    },
    removeFromCartLocal: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.product.id !== productId);
      localStorage.setItem('miv_cart', JSON.stringify(state.items));
    },
    clearCartLocal: (state) => {
      state.items = [];
      state.appliedCoupon = null;
      state.discountPercentage = 0;
      state.referralDiscount = 0;
      localStorage.removeItem('miv_cart');
    },
    applyCouponLocal: (state, action) => {
      const { code, discountPercentage } = action.payload;
      state.appliedCoupon = code;
      state.discountPercentage = discountPercentage;
    },
    applyReferralLocal: (state, action) => {
      state.referralDiscount = action.payload ? 50 : 0; // Flat ₹50 discount if referred
    },
  },
});

export const {
  setCartItems,
  addToCartLocal,
  updateQuantityLocal,
  removeFromCartLocal,
  clearCartLocal,
  applyCouponLocal,
  applyReferralLocal,
} = cartSlice.actions;

export default cartSlice.reducer;
