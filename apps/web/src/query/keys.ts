import type { OrderListQuery, ProductListQuery, ReviewListQuery, UserListQuery } from '@trabajo/types';

export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  products: {
    all: () => ['products'] as const,
    list: (params: ProductListQuery) => ['products', 'list', params] as const,
    detail: (id: string) => ['products', id] as const,
    top: () => ['products', 'top'] as const,
  },
  categories: {
    all: () => ['categories'] as const,
  },
  users: {
    list: (params: UserListQuery) => ['users', 'list', params] as const,
  },
  orders: {
    mine: (params: OrderListQuery = {}) => ['orders', 'mine', params] as const,
    list: (params: OrderListQuery = {}) => ['orders', 'list', params] as const,
    detail: (id: string) => ['orders', id] as const,
  },
  reviews: {
    list: (params: ReviewListQuery) => ['reviews', 'list', params] as const,
  },
};
