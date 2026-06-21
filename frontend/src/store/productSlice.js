import { createSlice } from '@reduxjs/toolkit';

const loadWishlistFromStorage = () => {
  try {
    const saved = localStorage.getItem('miv_wishlist');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const productSlice = createSlice({
  name: 'products',
  initialState: {
    list: [],
    searchResults: [],
    selectedCategory: 'All',
    wishlist: loadWishlistFromStorage(),
    isLoading: false,
    error: null,
  },
  reducers: {
    setProducts: (state, action) => {
      state.list = action.payload;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    setCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const exists = state.wishlist.find((p) => p.id === product.id);
      if (exists) {
        state.wishlist = state.wishlist.filter((p) => p.id !== product.id);
      } else {
        state.wishlist.push(product);
      }
      localStorage.setItem('miv_wishlist', JSON.stringify(state.wishlist));
    },
    setLoadingState: (state, action) => {
      state.isLoading = action.payload;
    },
    setErrorState: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setProducts,
  setSearchResults,
  setCategory,
  toggleWishlist,
  setLoadingState,
  setErrorState,
} = productSlice.actions;

export default productSlice.reducer;
