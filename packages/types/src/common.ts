export type EntityId = string;

export type Role = 'user' | 'admin';

export type ApiErrorResponse = {
  statusCode: number;
  errors: string[];
  path: string;
  timestamp: string;
  requestId?: string;
};

export type SuccessResponse = {
  success: boolean;
};

export type PaginatedResponse<TItem> = {
  items: TItem[];
  total: number;
  page: number;
  limit: number;
};

export type SortOrder = 'new' | 'priceAsc' | 'priceDesc' | 'rating';
