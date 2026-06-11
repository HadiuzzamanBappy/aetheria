import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductQuery } from '@/features/products/hooks/useProducts';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui';
import { formatCurrency } from '@/utils/format';
import { Star, ChevronLeft, ShoppingCart, ShieldCheck, Truck, RefreshCw, Heart } from 'lucide-react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useUser } from '@clerk/react';
import { productApi } from '@/features/products/services/productApi';

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useProductQuery(Number(id));

  const { addToCart, items: cartItems } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const cartItem = product ? cartItems.find((item) => item.id === product.id) : undefined;
  const isMaxStockReached = product && cartItem ? cartItem.quantity >= product.stock : false;

  // Active picture gallery state
  const [activeImage, setActiveImage] = useState('');

  // Reviews list and write-review states
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ reviewerName: '', rating: 5, comment: '' });
  const [reviewSuccess, setReviewSuccess] = useState('');
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (product) {
      setActiveImage(product.thumbnail);
      // Fetch persistent reviews from database
      productApi.getProductReviews(product.id)
        .then((data) => {
          if (data && data.length > 0) {
            setReviews(data);
          } else {
            // Fallback for demo catalog visual completeness
            setReviews([
              {
                reviewerName: 'Sophia Carter',
                rating: 5,
                comment: `Absolutely love this! The design is extremely sleek and the premium build quality is immediately noticeable. Highly recommend to anyone looking to level up their desktop setup.`,
                date: '2026-06-01T12:00:00.000Z',
                helpfulCount: 24,
              },
              {
                reviewerName: 'Marcus Vance',
                rating: 4,
                comment: `Great device with exceptional response times. Build feels premium. The only drawback is that the power cable could be slightly longer. Overall, very satisfied!`,
                date: '2026-05-28T14:30:00.000Z',
                helpfulCount: 15,
              },
              {
                reviewerName: 'Elena Rostova',
                rating: 5,
                comment: `Aetheria has outdone themselves. Speed, aesthetics, and reliability are top-notch. It fits perfectly into my minimalist work studio!`,
                date: '2026-05-20T09:15:00.000Z',
                helpfulCount: 8,
              }
            ]);
          }
        })
        .catch((err) => {
          console.error('Failed to retrieve product reviews from Neon:', err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const reviewsStats = React.useMemo(() => {
    const totalReviews = reviews.length;
    if (totalReviews === 0) {
      return {
        average: product?.rating || 0,
        total: 0,
        stars: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }
    const sum = reviews.reduce((s, r) => s + r.rating, 0);
    const average = Math.round((sum / totalReviews) * 10) / 10;
    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating))) as 5|4|3|2|1;
      starCounts[star] += 1;
    });

    return {
      average,
      total: totalReviews,
      stars: starCounts,
    };
  }, [reviews, product]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment) return;
    if (!isSignedIn) {
      alert('Please log in using the header to submit a review.');
      return;
    }
    try {
      const submitted = await productApi.createProductReview({
        productId: Number(id),
        rating: newReview.rating,
        comment: newReview.comment,
      });
      setReviews([submitted, ...reviews]);
      setNewReview((prev) => ({ ...prev, comment: '' }));
      setReviewSuccess('Your review has been successfully submitted! Thank you.');
      setTimeout(() => setReviewSuccess(''), 5000);
    } catch (err: any) {
      console.error('Failed to submit review to database:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
        <p className="text-purple-300 text-sm">Retrieving product catalog details...</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-red-400 font-semibold text-lg">Product unavailable</p>
        <p className="text-gray-400 text-sm">{error?.message || 'The requested product could not be found.'}</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/')}>
          Back to Store
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Catalog
      </button>

      {/* Main Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 glass p-8 md:p-12 rounded-3xl border border-purple-900/15">
        {/* Left: Product Images */}
        <div className="space-y-6">
          <div className="bg-purple-950/10 border border-purple-900/10 rounded-2xl p-8 h-[400px] flex items-center justify-center overflow-hidden">
            <img
              src={activeImage || product.thumbnail}
              alt={product.title}
              className="object-contain max-h-full max-w-full hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Mock thumbnail gallery */}
          <div className="grid grid-cols-4 gap-4">
            {product.images?.slice(0, 4).map((img, idx) => (
              <div
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`bg-purple-950/20 border rounded-xl p-2 h-20 flex items-center justify-center overflow-hidden cursor-pointer transition-colors ${
                  (activeImage || product.thumbnail) === img
                    ? 'border-primary-500 bg-primary-500/5 shadow'
                    : 'border-purple-900/10 hover:border-primary-500/40'
                }`}
              >
                <img src={img} alt={`${product.title}-${idx}`} className="object-contain max-h-full max-w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Technical specifications and checkout parameters */}
        <div className="flex flex-col justify-between space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-xs text-primary-300 font-medium tracking-wide capitalize">
              {product.category.replace('-', ' ')}
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {product.title}
            </h1>

            {/* Rating and Meta */}
            <div className="flex items-center gap-4 py-2 border-y border-purple-900/10">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" />
                <span className="text-sm font-semibold text-amber-200">{reviewsStats.average}</span>
              </div>
              <span className="text-gray-600">|</span>
              <span className="text-sm text-gray-400">Brand: <strong className="text-white">{product.brand}</strong></span>
              <span className="text-gray-600">|</span>
              {product.stock <= 5 ? (
                <span className="text-sm text-red-500 font-bold animate-pulse">Only {product.stock} units left in stock!</span>
              ) : (
                <span className="text-sm text-emerald-400 font-medium">{product.stock} Units left in stock</span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-400 text-sm md:text-base leading-relaxed pt-2">
              {product.description}
            </p>
          </div>

          <div className="space-y-6">
            {/* Pricing Section */}
            <div className="bg-purple-950/10 border border-purple-900/10 rounded-2xl p-6 flex justify-between items-center">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Pricing</span>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-black text-white">{formatCurrency(product.price)}</span>
                  {product.discountPercentage > 0 && (
                    <>
                      <span className="text-sm text-gray-500 line-through">
                        {formatCurrency(product.price * (1 + product.discountPercentage / 100))}
                      </span>
                      <span className="text-xs font-bold text-red-400">
                        -{Math.round(product.discountPercentage)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 items-center">
                {product.stock <= 5 && !isMaxStockReached && (
                  <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-wide animate-pulse hidden xl:inline">
                    Low Stock!
                  </span>
                )}
                <Button
                  variant={isMaxStockReached ? 'outline' : 'primary'}
                  size="lg"
                  disabled={isMaxStockReached}
                  onClick={() => addToCart(product)}
                  className="rounded-xl px-6 flex items-center gap-2 shadow-lg shadow-primary-500/20"
                >
                  <ShoppingCart className="h-5 w-5" /> {isMaxStockReached ? 'Limit Reached' : 'Add to Cart'}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => toggleWishlist(product)}
                  className="rounded-xl px-4 flex items-center justify-center"
                  title="Add to Wishlist"
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </Button>
              </div>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center p-3 bg-white/2 rounded-xl border border-purple-900/5">
                <Truck className="h-5 w-5 text-purple-400 mb-2" />
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-white/2 rounded-xl border border-purple-900/5">
                <ShieldCheck className="h-5 w-5 text-purple-400 mb-2" />
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">1 Year Warranty</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-white/2 rounded-xl border border-purple-900/5">
                <RefreshCw className="h-5 w-5 text-purple-400 mb-2" />
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">30 Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings & Reviews Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 glass p-8 md:p-12 rounded-3xl border border-purple-900/15 text-left">
        {/* Left column: Star distribution stats */}
        <div className="md:col-span-1 space-y-6">
          <h3 className="font-extrabold text-xl text-white">Customer Feedback</h3>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black text-white">{reviewsStats.average}</span>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4.5 w-4.5 ${
                      i < Math.round(reviewsStats.average)
                        ? 'fill-amber-400 stroke-amber-400'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400 block">Based on {reviewsStats.total} verified reviews</span>
            </div>
          </div>

          {/* Star progress bars */}
          <div className="space-y-3 pt-2">
            {([5, 4, 3, 2, 1] as const).map((starNum) => {
              const count = reviewsStats.stars[starNum] || 0;
              const pct = reviewsStats.total > 0 ? (count / reviewsStats.total) * 100 : 0;
              return (
                <div key={starNum} className="flex items-center gap-3 text-xs">
                  <span className="w-12 text-gray-400 font-semibold">{starNum} Stars</span>
                  <div className="flex-1 h-2 bg-purple-950/40 rounded-full overflow-hidden border border-purple-900/10">
                    <div
                      className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-gray-400 font-mono">{Math.round(pct)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle column: Reviews Feed list */}
        <div className="md:col-span-2 space-y-6 md:border-l md:border-purple-900/10 md:pl-8">
          <h3 className="font-extrabold text-xl text-white">Product Reviews</h3>
          
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
            {reviews.map((rev, index) => (
              <div key={index} className="space-y-2 border-b border-purple-900/10 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-white">{rev.reviewerName}</h5>
                    <span className="text-[10px] text-gray-500 font-medium">Verified Buyer • {new Date(rev.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < rev.rating ? 'fill-amber-400 stroke-amber-400' : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed font-light">
                  {rev.comment}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500">
                  <span>Was this review helpful?</span>
                  <button 
                    onClick={() => {
                      const updated = [...reviews];
                      updated[index].helpfulCount = (updated[index].helpfulCount || 0) + 1;
                      setReviews(updated);
                    }}
                    type="button"
                    className="px-2 py-0.5 rounded bg-purple-950/20 hover:bg-purple-950/40 text-primary-400 border border-purple-800/10 transition-colors"
                  >
                    Helpful ({rev.helpfulCount || 0})
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Write a review Form */}
          {!isSignedIn ? (
            <div className="p-6 bg-purple-950/20 border border-purple-900/10 rounded-2xl text-xs text-gray-400 text-center space-y-2 mt-6">
              <p>You must be signed in to submit a rating and comment.</p>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4 pt-6 border-t border-purple-900/15">
              <h4 className="font-bold text-sm text-white">Share Your Experience</h4>
              
              {reviewSuccess && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 text-xs rounded-xl font-medium">
                  {reviewSuccess}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase block mb-1 font-semibold">Your Name</label>
                  <input
                    type="text"
                    disabled
                    value={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'Anonymous User'}
                    className="w-full bg-purple-950/10 border border-purple-900/30 rounded-xl px-3 py-2 text-xs outline-none opacity-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase block mb-1 font-semibold">Score Rating</label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                    className="w-full bg-purple-950/10 border border-purple-900/30 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary-500/50 border-purple-800/40 text-slate-950"
                  >
                    <option value="5" className="text-slate-950">5 - Exceptional</option>
                    <option value="4" className="text-slate-950">4 - Good</option>
                    <option value="3" className="text-slate-950">3 - Average</option>
                    <option value="2" className="text-slate-950">2 - Poor</option>
                    <option value="1" className="text-slate-950">1 - Terrible</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 uppercase block mb-1 font-semibold">Comments</label>
                <textarea
                  required
                  rows={3}
                  placeholder="What did you like or dislike about this device?"
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full bg-purple-950/10 border border-purple-900/30 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary-500/50 resize-none"
                />
              </div>

              <Button variant="primary" type="submit" size="sm" className="w-full py-2.5">
                Submit Review Feedback
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
