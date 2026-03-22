import { ApiHttpError } from '@/services/http-client';

export function getFriendlyError(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof ApiHttpError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
