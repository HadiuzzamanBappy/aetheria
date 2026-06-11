import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useUIStore } from '@/store/useUIStore';
import { useCartStore } from '@/store/useCartStore';
import { useUser, useAuth, useClerk } from '@clerk/react';
import { Button, Input } from '@/components/ui';
import OfflineAlert from '@/components/ui/OfflineAlert';
import { formatCurrency } from '@/utils/format';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  X,
  User,
  LogOut,
  Sparkles,
  Heart,
  Search,
  Mail,
} from 'lucide-react';
import { useWishlistStore } from '@/store/useWishlistStore';


export default function MainLayout() {
  const navigate = useNavigate();
  const { isCartOpen, setCartOpen } = useUIStore();
  const {
    items: cartItems,
    totalQuantity,
    discountedTotal,
    updateQuantity,
    removeFromCart,
    addToCart,
  } = useCartStore();

  const {
    items: wishlistItems,
    isWishlistOpen,
    setWishlistOpen,
    toggleWishlist,
  } = useWishlistStore();

  const { user } = useUser();
  const { isSignedIn, signOut } = useAuth();
  const { openSignIn } = useClerk();

  // Search state
  const [headerSearch, setHeaderSearch] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const { setSearchQuery } = useUIStore();
  const searchRef = useRef<HTMLDivElement>(null);

  // User Dropdown Menu state
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSuccess('Success! Use coupon WELCOME10 for 10% off your checkout order.');
    setNewsletterEmail('');
  };

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      setSearchQuery(headerSearch.trim());
      setShowSuggestions(false);
      navigate('/');
    }
  };

  const handleSuggestionClick = (productId: number) => {
    setHeaderSearch('');
    setShowSuggestions(false);
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    if (headerSearch.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingSuggestions(true);
      try {
        const response = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(headerSearch)}&limit=5`);
        const data = await response.json();
        setSuggestions(data.products || []);
      } catch (err) {
        console.error('Failed to fetch suggestions', err);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [headerSearch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  return (
    <div className="min-h-screen relative text-gray-200 flex flex-col justify-between">
      {/* Dynamic Ambient Background Lights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none -z-10" />

      {/* Global Navigation Bar */}
      <nav className="sticky top-0 z-40 glass border-b border-purple-900/20 py-4 w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between w-full">
          <Link to="/" className="flex items-center gap-3 cursor-pointer flex-shrink-0">
          <div className="bg-primary-600 p-2.5 rounded-xl shadow-lg shadow-primary-500/20 animate-pulse-slow">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-purple-200 to-primary-400 bg-clip-text text-transparent">
            AETHERIA
          </span>
        </Link>

        {/* Global Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative" ref={searchRef}>
          <div className="relative w-full">
            <Input
              type="text"
              placeholder="Search catalog... (e.g. phone, watch)"
              value={headerSearch}
              onChange={(e) => {
                setHeaderSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="pr-10 w-full"
            />
            <button
              onClick={handleHeaderSearchSubmit}
              type="button"
              className="absolute right-3 top-3 text-slate-400 hover:text-primary-500 transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          {/* Suggestions Dropdown Popover */}
          {showSuggestions && headerSearch.trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 glass border border-purple-900/15 rounded-2xl shadow-2xl overflow-hidden z-50 text-left bg-white/95 max-h-[300px] overflow-y-auto">
              {isSearchingSuggestions ? (
                <div className="p-4 text-xs text-slate-500 text-center flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-500"></div>
                  Searching...
                </div>
              ) : suggestions.length === 0 ? (
                <div className="p-4 text-xs text-slate-500 text-center">No products match your search</div>
              ) : (
                <div className="py-2 divide-y divide-slate-100">
                  {suggestions.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSuggestionClick(product.id)}
                      className="px-4 py-3 hover:bg-slate-50 flex items-center gap-3 cursor-pointer transition-colors"
                    >
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="h-10 w-10 object-contain rounded bg-slate-100 p-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">{product.title}</span>
                        <span className="text-[10px] text-primary-600 font-semibold uppercase tracking-wider block mt-0.5">
                          {product.category.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-bold text-slate-950">{formatCurrency(product.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Cart Icon trigger */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2.5 bg-purple-950/20 border border-purple-900/30 rounded-xl hover:border-primary-500/50 hover:bg-purple-900/20 text-purple-200 transition-all active:scale-95"
            title="Open Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalQuantity > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary-600 text-white font-bold text-[10px] h-5 w-5 rounded-full flex items-center justify-center border-2 border-purple-950 shadow-lg animate-bounce">
                {totalQuantity}
              </span>
            )}
          </button>

          {/* User Section (Account Menu) */}
          {isSignedIn ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1 focus:outline-none cursor-pointer group animate-pulse-slow"
                title="Account Menu"
              >
                <img
                  src={user?.imageUrl || 'https://robohash.org/placeholder'}
                  alt={user?.username || 'user'}
                  className="h-9 w-9 rounded-xl border border-purple-500/30 bg-purple-950/40 object-cover group-hover:border-primary-500/50 transition-all active:scale-95 shadow-sm"
                />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 glass border border-purple-900/15 rounded-2xl shadow-2xl overflow-hidden z-50 text-left bg-white/95 py-2">
                  <div className="px-4 py-2 border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-[10px] text-primary-600 font-semibold block truncate">
                      @{user?.username || user?.primaryEmailAddress?.emailAddress.split('@')[0]}
                    </span>
                    <span className="text-[9px] text-slate-400 block truncate mt-0.5">
                      {user?.primaryEmailAddress?.emailAddress}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors font-medium"
                    >
                      <User className="h-3.5 w-3.5 text-slate-500" />
                      My Account / Profile
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        setWishlistOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors font-medium cursor-pointer"
                    >
                      <Heart className="h-3.5 w-3.5 text-slate-500" />
                      My Wishlist
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut();
                        navigate('/');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors font-semibold cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openSignIn()}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              <span>Login</span>
            </Button>
          )}
        </div>
      </div>
    </nav>

      {/* Main Content Render */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8 flex-grow w-full">
        <Outlet />
      </main>

      {/* Modern Premium Footer */}
      <footer className="glass border-t border-purple-900/20 mt-20 bg-purple-950/5 w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 p-2 rounded-xl">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                AETHERIA
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Crafting premium hardware setups and next-generation workspace tools. Elevate your productivity experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Shop Directory</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><Link to="/" className="hover:text-primary-500 transition-colors">Catalog Products</Link></li>
              <li><Link to="/profile" className="hover:text-primary-500 transition-colors">My Profile</Link></li>
              <li><Link to="/checkout" className="hover:text-primary-500 transition-colors">Checkout Session</Link></li>
            </ul>
          </div>

          {/* Support & Trust */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Support & Trust</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="#" className="hover:text-primary-500 transition-colors">Secure Payment Policy</a></li>
              <li><a href="#" className="hover:text-primary-500 transition-colors">Shipping & Delivery Rates</a></li>
              <li><a href="#" className="hover:text-primary-500 transition-colors">Returns & Exchanges Policy</a></li>
              <li><a href="#" className="hover:text-primary-500 transition-colors">Frequently Asked Questions</a></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Newsletter Signup</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Subscribe to get release updates and an instant 10% off checkout discount!
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="name@domain.com"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="py-2 text-xs flex-1 bg-white/5 border border-purple-800/10 text-slate-950"
                />
                <Button variant="primary" type="submit" size="sm" className="px-3">
                  <Mail className="h-4 w-4 text-white" />
                </Button>
              </div>
              {newsletterSuccess && (
                <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 text-[10px] font-bold rounded-lg leading-relaxed animate-pulse">
                  {newsletterSuccess}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-purple-900/10 py-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Aetheria E-Commerce Platform. All Rights Reserved. Demo Sandbox Environment.
        </div>
      </footer>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md glass border-l border-purple-900/20 flex flex-col justify-between shadow-2xl">
              
              {/* Header */}
              <div className="px-6 py-5 border-b border-purple-900/20 flex items-center justify-between bg-purple-950/10">
                <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                  <ShoppingBag className="h-5 w-5 text-primary-400" /> Shopping Cart
                </h2>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <ShoppingBag className="h-10 w-10 text-purple-700 animate-bounce" />
                    <p className="text-white font-semibold">Your cart is empty</p>
                    <p className="text-xs text-gray-400 max-w-[200px]">
                      Discover items from the store catalog to add products here.
                    </p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 pb-4 border-b border-purple-900/10"
                    >
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="h-16 w-16 object-contain bg-purple-950/20 rounded-xl border border-purple-900/15"
                      />
                      <div className="flex-1 text-left min-w-0">
                        <h4 className="font-bold text-sm text-white truncate">{item.title}</h4>
                        <p className="text-xs text-primary-300 font-medium mt-1">
                          {formatCurrency(item.price)}
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded bg-purple-950/30 hover:bg-purple-900/30 text-purple-300 border border-purple-800/20 transition-all"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-xs font-bold text-white w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= (item.stock || 99)}
                            className="p-1 rounded bg-purple-950/30 hover:bg-purple-900/30 text-purple-300 border border-purple-800/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            title={item.quantity >= (item.stock || 99) ? 'Maximum stock reached' : undefined}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <span className="font-bold text-sm text-white">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-gray-500 hover:text-red-400 rounded hover:bg-red-500/5 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer / Summary */}
              {cartItems.length > 0 && (
                <div className="p-6 border-t border-purple-900/20 space-y-4 bg-purple-950/15">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(discountedTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Shipping</span>
                    <span className="text-emerald-400 font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-purple-900/10">
                    <span>Total</span>
                    <span>{formatCurrency(discountedTotal)}</span>
                  </div>
                  
                  <Button
                    variant="primary"
                    className="w-full py-3.5 rounded-xl font-semibold mt-4 shadow-lg shadow-primary-500/10"
                    onClick={() => {
                      setCartOpen(false);
                      if (!isSignedIn) {
                        openSignIn();
                      } else {
                        navigate('/checkout');
                      }
                    }}
                  >
                    {!isSignedIn ? 'Login to Checkout' : 'Proceed to Checkout'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Wishlist Drawer */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setWishlistOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md glass border-l border-purple-900/20 flex flex-col justify-between shadow-2xl">
              
              {/* Header */}
              <div className="px-6 py-5 border-b border-purple-900/20 flex items-center justify-between bg-purple-950/10">
                <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                  <Heart className="h-5 w-5 text-red-500 fill-red-500 animate-pulse" /> Wishlist / Bookmarks
                </h2>
                <button
                  onClick={() => setWishlistOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {wishlistItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <Heart className="h-10 w-10 text-gray-400" />
                    <p className="text-white font-semibold">Your wishlist is empty</p>
                    <p className="text-xs text-gray-400 max-w-[200px]">
                      Bookmark items from the catalog to save them here.
                    </p>
                  </div>
                ) : (
                  wishlistItems.map((item) => {
                    const isLowStock = item.stock <= 5;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 pb-4 border-b border-purple-900/10"
                      >
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="h-16 w-16 object-contain bg-purple-950/20 rounded-xl border border-purple-900/15 cursor-pointer"
                          onClick={() => {
                            setWishlistOpen(false);
                            navigate(`/product/${item.id}`);
                          }}
                        />
                        <div className="flex-1 text-left min-w-0">
                          <h4 
                            onClick={() => {
                              setWishlistOpen(false);
                              navigate(`/product/${item.id}`);
                            }}
                            className="font-bold text-sm text-white truncate cursor-pointer hover:text-primary-300"
                          >
                            {item.title}
                          </h4>
                          <p className="text-xs text-primary-300 font-medium mt-1">
                            {formatCurrency(item.price)}
                          </p>
                          {isLowStock && (
                            <span className="inline-block mt-2 text-[9px] bg-red-500/15 border border-red-500/30 text-red-500 font-bold px-1.5 py-0.5 rounded">
                              Only {item.stock} left in stock!
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={item.stock <= 0}
                            onClick={() => addToCart(item)}
                            className="text-xs py-1.5 px-3 rounded-lg"
                          >
                            Add to Cart
                          </Button>
                          <button
                            onClick={() => toggleWishlist(item)}
                            className="p-1 text-gray-500 hover:text-red-500 rounded hover:bg-red-500/5 transition-all text-xs flex items-center gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer / Summary */}
              {wishlistItems.length > 0 && (
                <div className="p-6 border-t border-purple-900/20 space-y-4 bg-purple-950/15">
                  <Button
                    variant="outline"
                    className="w-full py-3 rounded-xl font-semibold"
                    onClick={() => {
                      setWishlistOpen(false);
                      navigate('/');
                    }}
                  >
                    Continue Shopping
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      <OfflineAlert />
    </div>
  );
}
