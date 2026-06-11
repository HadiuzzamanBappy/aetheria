import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';

interface WishlistState {
  items: Product[];
  isWishlistOpen: boolean;
  setWishlistOpen: (open: boolean) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isWishlistOpen: false,

      setWishlistOpen: (open) => set({ isWishlistOpen: open }),

      toggleWishlist: (product) => {
        const { items } = get();
        const exists = items.some((item) => item.id === product.id);
        
        if (exists) {
          set({ items: items.filter((item) => item.id !== product.id) });
        } else {
          set({ items: [...items, product] });
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId);
      },
    }),
    {
      name: 'ecommerce-wishlist', // Persists wishlisted items in localStorage
    }
  )
);
