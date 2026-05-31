import type { EntityId, PaginatedResponse } from './common';

export const ORDER_STATUSES = [
  'created',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'canceled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderItem = {
  productId: EntityId;
  name: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  discountPercent?: number;
  lineTotal: number;
};

export type OrderEmailStatus = {
  attempted: boolean;
  sent: boolean;
  id?: string | null;
  error?: string | null;
};

export type Order = {
  _id: EntityId;
  userId: EntityId;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status?: OrderStatus | string;
  currency?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
  emailStatus?: OrderEmailStatus;
};

export type CreateOrderItemDto = {
  productId: EntityId;
  quantity: number;
};

export type CreateOrderDto = {
  items: CreateOrderItemDto[];
  currency?: string;
};

export type UpdateOrderDto = {
  status?: OrderStatus;
};

export type OrderListQuery = {
  page?: number;
  limit?: number;
};

export type OrdersListResponse = PaginatedResponse<Order>;
