import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, ShoppingCart, Heart, ArrowLeft, MessageSquare, Sparkles } from 'lucide-react';
import { addToCartLocal } from '../store/cartSlice';
import { toggleWishlist } from '../store/productSlice';
import GlassCard from '../components/GlassCard';
import ScrollReveal from '../components/ScrollReveal';
import axios from 'axios';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { wishlist } = useSelector((state) => state.products);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review submission state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProductAndReviews = async () => {
      try {
        const prodRes = await axios.get(`http://localhost:8080/api/products/${id}`);
        setProduct(prodRes.data);

        const revsRes = await axios.get(`http://localhost:8080/api/reviews/product/${id}`);
        setReviews(revsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProductAndReviews();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Add locally (offline cart support)
    dispatch(addToCartLocal({ product, quantity }));
    
    // Sync to backend since authenticated
    try {
      await axios.post('http://localhost:8080/api/cart', {
        productId: product.id,
        quantity: quantity
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('miv_access_token')}` }
      });
    } catch (err) {
      console.error(err);
    }
    navigate('/cart');
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(addToCartLocal({ product, quantity }));
    navigate('/checkout');
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(toggleWishlist(product));
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    setReviewSuccess('');

    try {
      const res = await axios.post('http://localhost:8080/api/reviews', {
        productId: product.id,
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('miv_access_token')}` }
      });
      setReviews((prev) => [res.data, ...prev]);
      setComment('');
      setReviewSuccess('Review posted successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const isWish = product && wishlist.some((p) => p.id === product.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-400 text-sm">Loading details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-rose-500 font-semibold">Product not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-brand text-xs font-bold">Back to Home</button>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 'No ratings yet';

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand transition-colors mb-8"
      >
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        
        {/* Left Side: Product Image Card */}
        <ScrollReveal direction="left" delay={0.1} className="relative">
          <GlassCard className="p-4" hover={false}>
            <div className="w-full h-[360px] md:h-[450px] rounded-2xl overflow-hidden relative shadow-inner">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </GlassCard>
        </ScrollReveal>

        {/* Right Side: Product Details */}
        <ScrollReveal direction="right" delay={0.2} className="flex flex-col justify-between py-2">
          
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                {product.category}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">Pack size: 250g</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 mb-4">{product.name}</h1>
            
            {/* Reviews Summary */}
            <div className="flex items-center gap-1.5 mb-6">
              <div className="flex text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className={s <= Math.round(Number(averageRating)) ? 'fill-amber-500' : 'text-slate-300'} />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">({averageRating})</span>
              <span className="text-xs text-slate-400">• {reviews.length} reviews</span>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3 mb-6 p-4 rounded-2xl bg-slate-100/50 dark:bg-emerald-950/10 border border-slate-200/20">
              <span className="text-3xl font-extrabold text-brand dark:text-brand-light">₹{product.offerPrice}</span>
              {product.originalPrice > product.offerPrice && (
                <span className="text-sm text-slate-400 line-through">Original: ₹{product.originalPrice}</span>
              )}
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
              {product.description}
            </p>
          </div>

          <div>
            {/* Stock Alerts */}
            {product.availableQuantity === 0 ? (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold mb-6">
                ⚠️ Out of Stock. This traditional masala is currently sold out. We are preparing a fresh batch!
              </div>
            ) : product.availableQuantity < 10 ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-bold mb-6">
                ⚠️ Low Stock! Only {product.availableQuantity} packets left in our storage!
              </div>
            ) : null}

            {/* Quantity Selector */}
            {product.availableQuantity > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Quantity:</span>
                <div className="flex items-center rounded-xl bg-slate-100 dark:bg-neutral-800 p-1 border border-slate-200/50 dark:border-neutral-700/50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm hover:bg-white dark:hover:bg-neutral-700"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-xs font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.availableQuantity, quantity + 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm hover:bg-white dark:hover:bg-neutral-700"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Checkout / Cart Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                disabled={product.availableQuantity === 0}
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 transition-all shadow-md active:scale-95 disabled:bg-slate-200 disabled:text-slate-400"
              >
                <ShoppingCart size={16} /> Add to Cart
              </button>
              <button
                disabled={product.availableQuantity === 0}
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-xs text-white bg-brand hover:bg-brand-dark transition-all shadow-md active:scale-95 disabled:bg-slate-200 disabled:text-slate-400"
              >
                Buy It Now
              </button>
              <button
                onClick={handleToggleWishlist}
                className="p-4 rounded-2xl border border-slate-200 dark:border-emerald-900/30 hover:bg-slate-100 dark:hover:bg-emerald-950/20 transition-all text-slate-500"
              >
                <Heart size={18} className={isWish ? 'fill-rose-500 text-rose-500' : 'text-slate-600 dark:text-slate-300'} />
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Reviews Section */}
      <section className="border-t border-slate-200/40 dark:border-emerald-950/20 pt-12">
        <ScrollReveal direction="up" delay={0.1}>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-2">
            <MessageSquare size={20} className="text-brand" /> Customer Reviews ({reviews.length})
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Review Form */}
          <ScrollReveal direction="up" delay={0.2} className="md:col-span-1">
            {isAuthenticated ? (
              <GlassCard className="p-6">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-4">Write a Review</h3>
                
                {reviewSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs rounded-xl mb-4 font-semibold">
                    {reviewSuccess}
                  </div>
                )}

                <form onSubmit={handleAddReview} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className="text-slate-300 hover:scale-110 transition-transform"
                        >
                          <Star size={24} className={s <= rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Comment</label>
                    <textarea
                      required
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts about this product..."
                      className="w-full px-3 py-2.5 rounded-xl text-xs outline-none bg-slate-100 dark:bg-emerald-950/10 border border-slate-200/50 dark:border-emerald-900/30 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold text-xs text-white bg-brand hover:bg-brand-dark active:scale-95 transition-all"
                  >
                    Submit Review
                  </button>
                </form>
              </GlassCard>
            ) : (
              <GlassCard className="p-6 text-center">
                <p className="text-xs text-slate-400 mb-4">Please login to write reviews for our organic food catalog.</p>
                <Link
                  to="/login"
                  className="inline-block px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-brand hover:bg-brand-dark transition-all"
                >
                  Sign In
                </Link>
              </GlassCard>
            )}
          </ScrollReveal>

          {/* Right Column: Reviews List */}
          <div className="md:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <ScrollReveal direction="up" delay={0.2}>
                <p className="text-slate-400 text-xs py-8">Be the first to review this organic masala!</p>
              </ScrollReveal>
            ) : (
              reviews.map((rev, idx) => (
                <ScrollReveal key={rev.id} direction="up" delay={idx * 0.06} scale={0.98}>
                  <GlassCard className="p-5" hover={false}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-[#122212] flex items-center justify-center font-bold text-xs text-slate-600 dark:text-emerald-400">
                          {rev.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{rev.user.name}</h4>
                          <p className="text-[10px] text-slate-400">Verified Buyer</p>
                        </div>
                      </div>

                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={12} className={s <= rev.rating ? 'fill-amber-500' : 'text-slate-200'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {rev.comment}
                    </p>
                  </GlassCard>
                </ScrollReveal>
              ))
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
