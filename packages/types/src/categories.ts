import type { EntityId } from './common';

export type Category = {
  _id: EntityId;
  name: string;
  icon: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CategoryWithStats = Category & {
  productCount: number;
  thumbnail: string | null;
};

export type CategoryThumbnailResponse = {
  categoryId: string;
  thumbnail: string | null;
};

export type CreateCategoryDto = {
  name: string;
  icon: string;
};

export type UpdateCategoryDto = Partial<CreateCategoryDto>;
