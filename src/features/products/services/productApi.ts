import { axiosInstance } from '@/lib/axios';
import type { Product, ProductQueryResponse, ProductFilter } from '@/types';

export const productApi = {
  getProducts: async (filters: ProductFilter = {}): Promise<ProductQueryResponse> => {
    const { category, search, skip = 0, limit = 20 } = filters;
    let url = '/products';
    const params: Record<string, any> = { limit, skip };

    if (search) {
      url = '/products/search';
      params.q = search;
    } else if (category) {
      url = `/products/category/${category}`;
    }

    const response = await axiosInstance.get<ProductQueryResponse>(url, { params });
    return response.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await axiosInstance.get<Product>(`/products/${id}`);
    return response.data;
  },

  getCategories: async (): Promise<string[]> => {
    // DummyJSON returns category objects or array of strings depending on versions.
    // In current DummyJSON, GET /products/categories returns array of objects with slug and name.
    // We will parse out standard string values for simple mapping.
    const response = await axiosInstance.get<any[]>('/products/categories');

    // Check if the response items are objects (new dummyjson version) or strings
    if (response.data.length > 0 && typeof response.data[0] === 'object') {
      return response.data.map((cat) => cat.slug || cat.name);
    }
    return response.data;
  },
};
