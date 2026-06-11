import { useQuery } from '@tanstack/react-query';
import { productApi } from '../services/productApi';
import type { ProductFilter } from '@/types';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilter) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
  categories: () => [...productKeys.all, 'categories'] as const,
};

export const useProductsQuery = (filters: ProductFilter = {}) => {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productApi.getProducts(filters),
    placeholderData: (previousData) => previousData, // keep previous data during search updates
  });
};

export const useProductQuery = (id: number) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productApi.getProductById(id),
    enabled: !!id && !isNaN(id),
  });
};

export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => productApi.getCategories(),
    staleTime: 24 * 60 * 60 * 1000, // Categories are static, cache for 24h
  });
};
