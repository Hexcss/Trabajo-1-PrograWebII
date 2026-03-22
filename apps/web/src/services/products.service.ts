import type {
  CreateProductDto,
  Product,
  ProductListQuery,
  ProductsListResponse,
  SuccessResponse,
  UpdateProductDto,
} from '@trabajo/types';
import { apiClient } from './http-client';

export const productsService = {
  list(params: ProductListQuery) {
    return apiClient.get<ProductsListResponse>('/products', { query: params });
  },
  top(limit = 6) {
    return apiClient.get<Product[]>('/products/top', { query: { limit } });
  },
  getById(id: string) {
    return apiClient.get<Product>(`/products/${id}`);
  },
  create(payload: CreateProductDto) {
    return apiClient.post<Product, CreateProductDto>('/products', payload);
  },
  update(id: string, payload: UpdateProductDto) {
    return apiClient.put<Product, UpdateProductDto>(`/products/${id}`, payload);
  },
  remove(id: string) {
    return apiClient.delete<SuccessResponse>(`/products/${id}`);
  },
};
