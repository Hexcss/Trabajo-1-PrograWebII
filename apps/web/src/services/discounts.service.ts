import type {
  CreateDiscountDto,
  Discount,
  DiscountListQuery,
  SuccessResponse,
  UpdateDiscountDto,
} from '@trabajo/types';
import { apiClient } from './http-client';

export const discountsService = {
  list(params: DiscountListQuery = {}) {
    return apiClient.get<Discount[]>('/discounts', { query: params });
  },
  getById(id: string) {
    return apiClient.get<Discount>(`/discounts/${id}`);
  },
  create(payload: CreateDiscountDto) {
    return apiClient.post<Discount, CreateDiscountDto>('/discounts', payload);
  },
  update(id: string, payload: UpdateDiscountDto) {
    return apiClient.put<Discount, UpdateDiscountDto>(`/discounts/${id}`, payload);
  },
  remove(id: string) {
    return apiClient.delete<SuccessResponse>(`/discounts/${id}`);
  },
};
