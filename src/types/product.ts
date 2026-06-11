import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  discountPercentage: z.number().optional().default(0),
  rating: z.number().optional().default(0),
  stock: z.number(),
  brand: z.string().optional().default('Generic'),
  category: z.string(),
  thumbnail: z.string(),
  images: z.array(z.string()).optional().default([]),
});

export type Product = z.infer<typeof ProductSchema>;

export const ProductQueryResponseSchema = z.object({
  products: z.array(ProductSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

export type ProductQueryResponse = z.infer<typeof ProductQueryResponseSchema>;

export const ProductFilterSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  skip: z.number().optional(),
  limit: z.number().optional(),
});

export type ProductFilter = z.infer<typeof ProductFilterSchema>;

export const ReviewSchema = z.object({
  id: z.string().optional(),
  productId: z.number(),
  reviewerName: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string(),
  date: z.string(),
  helpfulCount: z.number().default(0),
});

export type Review = z.infer<typeof ReviewSchema>;
