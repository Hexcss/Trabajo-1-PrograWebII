import type {
  CreateReviewDto,
  Review,
  ReviewListQuery,
  ReviewsListResponse,
  SuccessResponse,
  UpdateReviewDto,
} from '@trabajo/types';
import { apiClient } from './http-client';

export const reviewsService = {
  list(params: ReviewListQuery) {
    return apiClient.get<ReviewsListResponse>('/reviews', { query: params });
  },
  create(payload: CreateReviewDto) {
    return apiClient.post<Review, CreateReviewDto>('/reviews', payload);
  },
  update(id: string, payload: UpdateReviewDto) {
    return apiClient.put<Review, UpdateReviewDto>(`/reviews/${id}`, payload);
  },
  remove(id: string) {
    return apiClient.delete<SuccessResponse>(`/reviews/${id}`);
  },
};
