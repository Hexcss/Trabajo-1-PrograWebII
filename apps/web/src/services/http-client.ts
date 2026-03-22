import type { ApiErrorResponse } from '@trabajo/types';
import { buildQueryString } from '@/lib/query-string';

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

type RequestParams = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  silent401?: boolean;
};

export class ApiHttpError extends Error {
  status: number;
  payload: ApiErrorResponse | null;

  constructor(message: string, status: number, payload: ApiErrorResponse | null) {
    super(message);
    this.name = 'ApiHttpError';
    this.status = status;
    this.payload = payload;
  }
}

const unauthorizedSubscribers = new Set<() => void>();

export function subscribeUnauthorized(handler: () => void) {
  unauthorizedSubscribers.add(handler);
  return () => unauthorizedSubscribers.delete(handler);
}

function emitUnauthorized() {
  unauthorizedSubscribers.forEach((handler) => handler());
}

function parseErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const maybe = payload as Partial<ApiErrorResponse>;
    if (Array.isArray(maybe.errors) && maybe.errors.length > 0) {
      return maybe.errors.join(' • ');
    }
  }

  return fallback;
}

async function request<TResponse>(path: string, params: RequestParams = {}): Promise<TResponse> {
  const { method = 'GET', body, query, headers, signal, silent401 = false } = params;
  const querySuffix = query ? buildQueryString(query) : '';
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}${querySuffix}`, {
    method,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    signal,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body !== undefined && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
  });

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = parseErrorMessage(payload, response.statusText || 'Request failed');
    const errorPayload = isJson && payload && typeof payload === 'object' ? (payload as ApiErrorResponse) : null;

    if (response.status === 401 && !silent401) {
      emitUnauthorized();
    }

    throw new ApiHttpError(message, response.status, errorPayload);
  }

  return payload as TResponse;
}

export const apiClient = {
  get<TResponse>(path: string, params: Omit<RequestParams, 'method' | 'body'> = {}) {
    return request<TResponse>(path, { ...params, method: 'GET' });
  },
  post<TResponse, TBody = unknown>(path: string, body?: TBody, params: Omit<RequestParams, 'method' | 'body'> = {}) {
    return request<TResponse>(path, { ...params, method: 'POST', body });
  },
  put<TResponse, TBody = unknown>(path: string, body?: TBody, params: Omit<RequestParams, 'method' | 'body'> = {}) {
    return request<TResponse>(path, { ...params, method: 'PUT', body });
  },
  patch<TResponse, TBody = unknown>(path: string, body?: TBody, params: Omit<RequestParams, 'method' | 'body'> = {}) {
    return request<TResponse>(path, { ...params, method: 'PATCH', body });
  },
  delete<TResponse>(path: string, params: Omit<RequestParams, 'method' | 'body'> = {}) {
    return request<TResponse>(path, { ...params, method: 'DELETE' });
  },
};
