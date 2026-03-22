import type { EntityId, PaginatedResponse } from './common';

export type ReviewAuthor = {
  _id?: EntityId;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
};

export type Review = {
  _id: EntityId;
  productId: EntityId;
  userId: EntityId;
  score: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: ReviewAuthor;
};

export type ReviewListQuery = {
  productId: EntityId;
  page?: number;
  limit?: number;
  userId?: EntityId;
};

export type ReviewsListResponse = PaginatedResponse<Review>;

export type CreateReviewDto = {
  productId: EntityId;
  score: number;
  comment?: string;
};

export type UpdateReviewDto = Partial<CreateReviewDto>;
