import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/store/useUIStore';
import { useCartStore } from '@/store/useCartStore';
import {
  useProductsQuery,
  useCategoriesQuery,
} from '@/features/products/hooks/useProducts';
import { Button, Input } from '@/components/ui';
import { formatCurrency } from '@/utils/format';
import {
  Search,
  Filter,
  X,
  ChevronRight,
  Star,
  Sparkles,
  ShoppingBag,
  Heart,
} from 'lucide-react';
import { useWishlistStore } from '@/store/useWishlistStore';

export default function CatalogPage() {
  const navigate = useNavigate();
  const {
    isFilterOpen,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    resetFilters,
  } = useUIStore();

  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [searchInput, setSearchInput] = useState('');
  const [sortKey, setSortKey] = useState('featured');

  React.useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Queries
  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
  } = useProductsQuery({
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
  });

  const sortedProducts = React.useMemo(() => {
    if (!productsData?.products) return [];
    const items = [...productsData.products];
    if (sortKey === 'price-asc') {
      return items.sort((a, b) => a.price - b.price);
    } else if (sortKey === 'price-desc') {
      return items.sort((a, b) => b.price - a.price);
    } else if (sortKey === 'rating-desc') {
      return items.sort((a, b) => b.rating - a.rating);
    }
    return items;
  }, [productsData, sortKey]);

  const { data: categories } = useCategoriesQuery();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? '' : category);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Filters Panel */}
      <aside
        className={`${
          isFilterOpen ? 'block' : 'hidden'
        } lg:block lg:col-span-1 space-y-6 glass p-6 rounded-2xl border border-purple-900/15 h-fit`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-purple-900/20">
          <span className="font-bold text-lg text-white flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary-400" /> Catalog Filters
          </span>
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs text-purple-300">
            Reset
          </Button>
        </div>

        {/* Search box for responsive layout */}
        <div className="block md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="absolute right-4 top-3.5 text-purple-300">
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Categories select list */}
        <div>
          <h4 className="font-semibold text-xs text-purple-300/55 uppercase tracking-widest mb-4">Categories</h4>
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-2">
            {categories?.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 capitalize flex items-center justify-between group ${
                  selectedCategory === cat
                    ? 'bg-primary-600/20 text-primary-300 border border-primary-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <span>{cat.replace('-', ' ')}</span>
                <ChevronRight
                  className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 ${
                    selectedCategory === cat ? 'text-primary-400' : 'text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Catalog Section */}
      <section className="col-span-1 lg:col-span-3 space-y-8">
        {/* Promotion Banner */}
        <div className="relative overflow-hidden glass rounded-3xl border border-purple-900/20 p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl shadow-purple-950/10">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary-600/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="space-y-4 max-w-lg text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-xs text-primary-300 font-medium tracking-wide">
              <Sparkles className="h-3 w-3 animate-spin" /> Summer Collection
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-white">
              Next-Gen Tech <br />
              <span className="bg-gradient-to-r from-primary-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                For Modern Spaces
              </span>
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Elevate your productivity setup with 20% off our verified devices catalog. Use code <code className="bg-purple-950/40 text-purple-200 border border-purple-800/40 px-2 py-0.5 rounded font-mono">AETHER20</code>.
            </p>
          </div>
          
          <div className="relative group animate-float">
            <div className="absolute inset-0 bg-primary-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-60" />
            <img
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400"
              alt="Gaming Setup"
              className="w-64 h-48 md:w-80 md:h-56 object-cover rounded-2xl border border-purple-900/30 relative"
            />
          </div>
        </div>

        {/* Global Search form for desktop */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center w-full relative">
          <Input
            type="text"
            placeholder="Search catalog... (e.g. Phone, Laptop)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pr-12 bg-purple-950/10"
          />
          <button type="submit" className="absolute right-4 text-purple-300 hover:text-white transition-colors">
            <Search className="h-5 w-5" />
          </button>
        </form>

        {/* Active filters */}
        {(searchQuery || selectedCategory) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-purple-300">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-purple-800/20 rounded-full text-xs text-white">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-red-400"><X className="h-3 w-3" /></button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-purple-800/20 rounded-full text-xs text-white capitalize">
                Category: {selectedCategory.replace('-', ' ')}
                <button onClick={() => setSelectedCategory('')} className="hover:text-red-400"><X className="h-3 w-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Sort Controls and Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-purple-900/10">
          <div className="text-xs text-purple-300 font-semibold uppercase tracking-wider">
            Showing <span className="text-white font-bold">{sortedProducts.length}</span> Products
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Sort By:</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="bg-purple-950/20 border border-purple-900/40 text-slate-900 text-xs rounded-xl px-3 py-1.5 outline-none cursor-pointer focus:border-primary-500/50"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Best Rating</option>
            </select>
          </div>
        </div>

        {/* Products List Grid */}
        {isProductsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass rounded-2xl border border-purple-900/10 p-4 space-y-4 animate-pulse">
                <div className="bg-purple-950/20 h-48 rounded-xl w-full" />
                <div className="h-4 bg-purple-950/30 rounded w-2/3" />
                <div className="h-4 bg-purple-950/30 rounded w-1/2" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-6 bg-purple-950/30 rounded w-1/3" />
                  <div className="h-10 bg-purple-950/30 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : isProductsError ? (
          <div className="glass rounded-2xl border border-red-500/10 p-8 text-center space-y-4">
            <p className="text-red-400 font-semibold">Failed to load products</p>
            <p className="text-gray-400 text-sm">{(productsError as Error)?.message}</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="glass rounded-2xl border border-purple-900/10 p-16 text-center space-y-4">
            <ShoppingBag className="h-12 w-12 text-purple-500 mx-auto" />
            <p className="text-white font-semibold text-lg">No products found</p>
            <p className="text-gray-400 text-sm">Try modifying your filters or search query.</p>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between glass rounded-2xl border border-purple-900/10 hover:border-primary-500/30 p-4 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  {/* Image and discount badge */}
                  <div
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="relative overflow-hidden rounded-xl bg-purple-950/10 h-48 flex items-center justify-center border border-purple-900/10 cursor-pointer"
                  >
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="object-contain h-full w-full group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      className="absolute top-3 left-3 z-10 p-1.5 rounded-lg bg-white/90 border border-purple-900/10 text-gray-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all shadow-sm flex items-center justify-center"
                      title="Add to Wishlist"
                    >
                      <Heart className={`h-3.5 w-3.5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </button>

                    {product.discountPercentage > 0 && (
                      <span className="absolute top-3 right-3 bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        -{Math.round(product.discountPercentage)}%
                      </span>
                    )}
                  </div>

                  {/* Meta info */}
                  <div className="text-left space-y-2">
                    <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">
                      {product.category.replace('-', ' ')}
                    </span>
                    <h3
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="font-bold text-base text-white line-clamp-1 group-hover:text-primary-300 transition-colors cursor-pointer"
                    >
                      {product.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
                      <span className="text-xs font-semibold text-amber-200">{product.rating}</span>
                      <span className="text-xs text-gray-500">({product.stock} in stock)</span>
                    </div>
                  </div>
                </div>

                {/* Actions & pricing */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-purple-900/10">
                  <div className="text-left">
                    <div className="text-xs text-gray-500 line-through">
                      {product.discountPercentage > 0 &&
                        formatCurrency(product.price * (1 + product.discountPercentage / 100))}
                    </div>
                    <div className="text-lg font-black text-white">
                      {formatCurrency(product.price)}
                    </div>
                  </div>
                  
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => addToCart(product)}
                    className="rounded-xl"
                  >
                    Add +
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
