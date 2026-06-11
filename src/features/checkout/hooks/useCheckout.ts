import { useMutation } from '@tanstack/react-query';
import { checkoutApi } from '../services/checkoutApi';
import type { OrderInput, OrderResponse } from '../services/checkoutApi';
import { useCartStore } from '@/store/useCartStore';

export const useCheckoutMutation = (options?: {
  onSuccess?: (data: OrderResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const clearCart = useCartStore((state) => state.clearCart);

  return useMutation({
    mutationFn: (order: OrderInput) => checkoutApi.createOrder(order),
    onSuccess: (data) => {
      clearCart(); // Flush the checkout items upon success
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: Error) => {
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};
