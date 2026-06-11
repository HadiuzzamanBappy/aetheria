import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OrderResponse } from '@/features/checkout/services/checkoutApi';

interface OrderState {
  orders: OrderResponse[];
  addOrder: (order: OrderResponse) => void;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],

      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),

      clearOrders: () => set({ orders: [] }),
    }),
    {
      name: 'ecommerce-orders', // Persists orders list in localStorage
    }
  )
);
