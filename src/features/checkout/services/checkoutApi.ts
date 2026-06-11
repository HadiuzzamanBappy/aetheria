import { axiosInstance } from '@/lib/axios';
import type { CartProduct } from '@/types';

export interface OrderInput {
  items: CartProduct[];
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  totalAmount: number;
}

export interface OrderResponse {
  orderId: string;
  status: 'success' | 'pending' | 'failed';
  message: string;
  timestamp: string;
  details: OrderInput;
}

export const checkoutApi = {
  createOrder: async (order: OrderInput): Promise<OrderResponse> => {
    // Simulating checkout order placement
    // DummyJSON doesn't have an order endpoint, so we can POST to a generic dummy endpoint
    // or simulate a network call to ensure local/offline demo integrity.
    try {
      await axiosInstance.post('/posts/add', {
        title: 'Order Placement',
        userId: 1,
        body: JSON.stringify(order),
      });

      return {
        orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'success',
        message: 'Your order has been placed successfully.',
        timestamp: new Date().toISOString(),
        details: order,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Checkout payment failed');
    }
  },
};
