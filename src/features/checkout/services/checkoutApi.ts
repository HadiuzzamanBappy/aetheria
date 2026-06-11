import { dbAxiosInstance } from '@/lib/axios';
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
    try {
      const response = await dbAxiosInstance.post<OrderResponse>('/api/orders', order);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Checkout payment failed');
    }
  },
};
