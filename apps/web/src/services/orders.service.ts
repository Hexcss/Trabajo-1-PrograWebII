import type {
  CreateOrderDto,
  Order,
  OrderListQuery,
  OrdersListResponse,
  UpdateOrderDto,
} from '@trabajo/types';
import { apiClient } from './http-client';

export const ordersService = {
  create(payload: CreateOrderDto) {
    return apiClient.post<Order, CreateOrderDto>('/orders', payload);
  },
  mine(params: OrderListQuery = {}) {
    return apiClient.get<OrdersListResponse>('/orders/my', { query: params });
  },
  list(params: OrderListQuery = {}) {
    return apiClient.get<OrdersListResponse>('/orders', { query: params });
  },
  byId(id: string) {
    return apiClient.get<Order>(`/orders/${id}`);
  },
  update(id: string, payload: UpdateOrderDto) {
    return apiClient.put<Order, UpdateOrderDto>(`/orders/${id}`, payload);
  },
};
