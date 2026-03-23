import type { EntityId } from './common';

export type Discount = {
  _id: EntityId;
  productId: EntityId;
  discountPercent: number;
  startDate: string;
  endDate: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateDiscountDto = {
  productId: EntityId;
  discountPercent: number;
  startDate: string;
  endDate: string;
};

export type UpdateDiscountDto = Partial<CreateDiscountDto>;

export type DiscountListQuery = {
  productId?: EntityId;
};
