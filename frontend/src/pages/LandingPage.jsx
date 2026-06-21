import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Sparkles, ArrowRight, Check } from 'lucide-react';
import { setProducts, toggleWishlist } from '../store/productSlice';
import { addToCartLocal } from '../store/cartSlice';
import GlassCard from '../components/GlassCard';
import ScrollReveal from '../components/ScrollReveal';
import axios from 'axios';

export default function LandingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { list: products, searchResults, selectedCategory } = useSelector((state) => state.products);
  const { wishlist } = useSelector((state) => state.products);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [recs, setRecs] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [successMsg, setSuccessMsg] = useState(null);

  // Load Products from Spring Boot Backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
        dispatch(setProducts(res.data));
      } catch (err) {
        console.error("Failed fetching products", err);
      }
    };
    fetchProducts();
  }, [dispatch]);

  // Load Recommendations from FastAPI
  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const payload = { user_id: isAuthenticated ? user.id : null };
        const res = await axios.post(`${import.meta.env.VITE_AI_URL}/recommend`, payload);
        setRecs(res.data.recommendations);
      } catch (err) {
        console.error("Failed fetching recommendations", err);
      }
    };
    fetchRecs();
  }, [isAuthenticated, user]);

  const categories = ['All', 'Organic Masalas', 'Health Mixes', 'Traditional Snacks'];

  // Handle category filtering
  const displayedProducts = selectedCategory === 'Search Results'
    ? searchResults
    : activeTab === 'All'
      ? products
      : products.filter((p) => p.category === activeTab);

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Add locally (offline cart support)
    dispatch(addToCartLocal({ product, quantity: 1 }));
    
    // Add to DB since authenticated
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/cart`, {
        productId: product.id,
        quantity: 1
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('miv_access_token')}` }
      });
    } catch (err) {
      console.error("Failed syncing item to online cart", err);
    }

    setSuccessMsg(`Added ${product.name} to cart!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleToggleWishlist = (product) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(toggleWishlist(product));
  };

  const isInWishlist = (id) => wishlist.some((p) => p.id === id);

  return (
    <div className="relative min-h-screen pb-16 overflow-hidden bg-slate-50 dark:bg-black">
      
      {/* Generative Glow Spots */}
      <div className="blur-spot blur-emerald top-20 left-10" />
      <div className="blur-spot blur-teal top-80 right-20" />
      <div className="blur-spot blur-brand bottom-40 left-1/3" />

      {/* Success Banner */}
      {successMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-full shadow-lg font-semibold text-sm animate-bounce">
          <Check size={16} /> {successMsg}
        </div>
      )}

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 text-center relative z-10">
        <ScrollReveal direction="down" delay={0.1}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-400 text-xs font-semibold mb-6">
            <Sparkles size={14} className="animate-spin" /> Authentic Traditional Flavors
          </div>
        </ScrollReveal>
        
        <ScrollReveal direction="up" delay={0.2}>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-slate-800 dark:text-slate-100">
            Traditional Taste, <br/>
            <span className="gradient-text">Healthy Living</span>
          </h1>
        </ScrollReveal>
        
        <ScrollReveal direction="up" delay={0.3}>
          <p className="max-w-2xl mx-auto text-sm md:text-base text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            Sourced from wood-pressed oil fields, stone-milled grains, and traditional family recipes. 
            Chemical-free, preservative-free, and prepared with care for your health.
          </p>
        </ScrollReveal>
        
        <ScrollReveal direction="up" delay={0.4}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#shop"
              className="flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white bg-brand hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 active:scale-95"
            >
              Shop Now <ArrowRight size={16} />
            </a>
            <Link
              to="/contact"
              className="px-8 py-3.5 rounded-full font-bold text-sm bg-white/60 dark:bg-emerald-950/20 border border-slate-200 dark:border-emerald-900/30 hover:bg-slate-100 transition-all text-slate-800 dark:text-slate-300"
            >
              Contact Us
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* AI Recommendation Section */}
      {recs.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 mb-16 relative z-10">
          <ScrollReveal direction="left" delay={0.1}>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={18} className="text-brand dark:text-brand-light" />
              <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-200">Recommended For You (AI Picked)</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recs.map((rec, idx) => (
              <ScrollReveal key={rec.id} direction="up" delay={idx * 0.1} scale={0.9}>
                <GlassCard className="p-4 flex flex-col items-center justify-between text-center relative group h-full" hover={true}>
                  <img src={rec.image_url} alt={rec.name} className="w-24 h-24 object-cover rounded-2xl mb-3 shadow-md group-hover:scale-105 transition-transform duration-300" />
                  <span className="text-[10px] uppercase font-bold text-slate-400">{rec.category}</span>
                  <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200 mt-1 line-clamp-1">{rec.name}</h3>
                  <span className="text-sm font-extrabold text-brand mt-1">₹{rec.offer_price}</span>
                  <button
                    onClick={() => handleAddToCart(rec)}
                    className="mt-3 w-full py-1.5 rounded-full text-[10px] font-bold text-white bg-brand hover:bg-brand-dark active:scale-95 transition-all"
                  >
                    Quick Add
                  </button>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* Main Catalog Shop Grid */}
      <section id="shop" className="max-w-7xl mx-auto px-6 relative z-10 scroll-mt-24">
        
        {/* Navigation Category Tabs */}
        <ScrollReveal direction="right" delay={0.1}>
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200/40 dark:border-emerald-950/20 pb-6 mb-8">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {selectedCategory === 'Search Results' ? 'Smart Search Results' : 'Explore Our Catalog'}
            </h2>
            {selectedCategory !== 'Search Results' && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setActiveTab(c)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      activeTab === c
                        ? 'bg-brand text-white shadow-md'
                        : 'bg-white/40 dark:bg-emerald-950/20 border border-slate-200/50 dark:border-emerald-900/30 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Product Grid */}
        {displayedProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-sm">No products found matching your filter rules.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {displayedProducts.map((p, idx) => {
              const discountPercentage = Math.round(((p.originalPrice - p.offerPrice) / p.originalPrice) * 100);
              return (
                <ScrollReveal key={p.id} direction="up" delay={(idx % 4) * 0.08} scale={0.95}>
                  <GlassCard className="relative flex flex-col justify-between h-full" hover={true}>
                    
                    {/* Heart Wishlist button */}
                    <button
                      onClick={() => handleToggleWishlist(p)}
                      className="absolute top-4 right-4 p-2 rounded-full backdrop-blur-md bg-white/80 dark:bg-black/50 border border-slate-200/20 hover:scale-110 transition-all text-slate-500 z-10"
                    >
                      <Heart size={16} className={isInWishlist(p.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-600 dark:text-slate-300'} />
                    </button>

                    {/* Product Image */}
                    <div className="w-full h-44 overflow-hidden rounded-2xl mb-4 relative shadow-inner">
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                      {discountPercentage > 0 && (
                        <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-extrabold text-white bg-emerald-600 shadow-md">
                          {discountPercentage}% OFF
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{p.category}</span>
                      <Link to={`/product/${p.id}`} className="block mt-1 group">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-brand transition-colors text-base line-clamp-1">
                          {p.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    {/* Prices & Action Button */}
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-neutral-800/40 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-extrabold text-brand dark:text-brand-light">₹{p.offerPrice}</span>
                          {p.originalPrice > p.offerPrice && (
                            <span className="text-xs text-slate-400 line-through">₹{p.originalPrice}</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">Pack size: 250g</p>
                      </div>

                      <button
                        onClick={() => handleAddToCart(p)}
                        className="p-3 rounded-full bg-brand hover:bg-brand-dark text-white shadow-md active:scale-95 transition-all"
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>

                  </GlassCard>
                </ScrollReveal>
              );
            })}
          </div>
        )}

      </section>

    </div>
  );
}
