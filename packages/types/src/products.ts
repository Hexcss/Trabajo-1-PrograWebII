import type { EntityId, PaginatedResponse, SortOrder } from './common';

export type ProductDiscount = {
  discountPercent: number;
  startDate: string;
  endDate: string;
};

export type Product = {
  _id: EntityId;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  category?: string;
  categoryId?: EntityId;
  tags: string[];
  createdBy?: EntityId;
  createdAt?: string;
  updatedAt?: string;
  avgRating?: number | null;
  reviewCount?: number;
  activeDiscount?: ProductDiscount | null;
};

export type ProductListQuery = {
  q?: string;
  category?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
  sort?: SortOrder;
};

export type ProductsListResponse = PaginatedResponse<Product>;

export type CreateProductDto = {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  category?: string;
  categoryId?: string;
  tags?: string[];
};

export type UpdateProductDto = Partial<CreateProductDto>;
