import { z } from 'zod';

export const CartProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  price: z.number(),
  quantity: z.number(),
  total: z.number(),
  discountPercentage: z.number().optional().default(0),
  discountedPrice: z.number().optional().default(0),
  thumbnail: z.string().optional().default(''),
  stock: z.number().optional().default(99),
});

export type CartProduct = z.infer<typeof CartProductSchema>;

export const CartSchema = z.object({
  id: z.number(),
  products: z.array(CartProductSchema),
  total: z.number(),
  discountedTotal: z.number(),
  userId: z.number(),
  totalProducts: z.number(),
  totalQuantity: z.number(),
});

export type Cart = z.infer<typeof CartSchema>;

// Input schema for adding items to the cart
export const AddToCartInputSchema = z.object({
  userId: z.number(),
  products: z.array(
    z.object({
      id: z.number(),
      quantity: z.number(),
    })
  ),
});

export type AddToCartInput = z.infer<typeof AddToCartInputSchema>;
