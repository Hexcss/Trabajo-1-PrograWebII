import type {
  CategoryThumbnailResponse,
  CategoryWithStats,
  CreateCategoryDto,
  SuccessResponse,
  UpdateCategoryDto,
} from '@trabajo/types';
import { apiClient } from './http-client';

export const categoriesService = {
  list() {
    return apiClient.get<CategoryWithStats[]>('/categories');
  },
  create(payload: CreateCategoryDto) {
    return apiClient.post<CategoryWithStats, CreateCategoryDto>('/categories', payload);
  },
  update(id: string, payload: UpdateCategoryDto) {
    return apiClient.put<CategoryWithStats, UpdateCategoryDto>(`/categories/${id}`, payload);
  },
  remove(id: string) {
    return apiClient.delete<SuccessResponse>(`/categories/${id}`);
  },
  refreshThumbnail(id: string) {
    return apiClient.get<CategoryThumbnailResponse>(`/categories/${id}/thumbnail`);
  },
};
