import type { CartProduct } from '@/types';

export interface MismatchedItem {
  id: number;
  title: string;
  originalPrice: number;
  currentPrice: number;
}

export interface ValidationResult {
  isValid: boolean;
  mismatchedItems: MismatchedItem[];
}

export const cartValidation = {
  validateCartPrices: async (_items: CartProduct[]): Promise<ValidationResult> => {
    // Simulated price re-verification endpoint check.
    // In production, swap this mock with:
    // const response = await axiosInstance.post<ValidationResult>('/cart/validate-prices', { items });
    // return response.data;

    // Simulate 800ms latency validation call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock response details: By default, client prices match database prices
    return {
      isValid: true,
      mismatchedItems: [],
    };
  },
};
