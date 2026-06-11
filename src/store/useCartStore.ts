import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartProduct, Product } from '@/types';

interface CartState {
  items: CartProduct[];
  totalQuantity: number;
  totalAmount: number;
  discountedTotal: number;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
}

const calculateTotals = (items: CartProduct[]) => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountedTotal = items.reduce((sum, item) => {
    const discountedPrice = item.price * (1 - (item.discountPercentage || 0) / 100);
    return sum + discountedPrice * item.quantity;
  }, 0);

  return {
    totalQuantity,
    totalAmount: Math.round(totalAmount * 100) / 100,
    discountedTotal: Math.round(discountedTotal * 100) / 100,
  };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalQuantity: 0,
      totalAmount: 0,
      discountedTotal: 0,

      addToCart: (product, quantity = 1) => {
        const { items } = get();
        const existingItemIndex = items.findIndex((item) => item.id === product.id);

        let newItems = [...items];

        if (existingItemIndex > -1) {
          const existingItem = items[existingItemIndex];
          const newQuantity = Math.min(existingItem.quantity + quantity, product.stock);
          newItems[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
            total: existingItem.price * newQuantity,
            discountedPrice: product.price * (1 - (product.discountPercentage || 0) / 100),
          };
        } else {
          const newQuantity = Math.min(quantity, product.stock);
          const discountedPrice = product.price * (1 - (product.discountPercentage || 0) / 100);
          newItems.push({
            id: product.id,
            title: product.title,
            price: product.price,
            quantity: newQuantity,
            total: product.price * newQuantity,
            discountPercentage: product.discountPercentage,
            discountedPrice,
            thumbnail: product.thumbnail,
            stock: product.stock,
          });
        }

        const totals = calculateTotals(newItems);
        set({ items: newItems, ...totals });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        const { items } = get();
        const newItems = items.map((item) => {
          if (item.id === productId) {
            const newQuantity = Math.min(quantity, item.stock || 99);
            return {
              ...item,
              quantity: newQuantity,
              total: item.price * newQuantity,
            };
          }
          return item;
        });

        const totals = calculateTotals(newItems);
        set({ items: newItems, ...totals });
      },

      removeFromCart: (productId) => {
        const { items } = get();
        const newItems = items.filter((item) => item.id !== productId);
        const totals = calculateTotals(newItems);
        set({ items: newItems, ...totals });
      },

      clearCart: () => {
        set({ items: [], totalQuantity: 0, totalAmount: 0, discountedTotal: 0 });
      },
    }),
    {
      name: 'ecommerce-cart', // Persists cart items in localStorage
    }
  )
);
