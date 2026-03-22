import type {
  AuthSessionPayload,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  SessionUser,
  SuccessResponse,
} from '@trabajo/types';
import { ApiHttpError, apiClient } from './http-client';

export const authService = {
  login(payload: LoginRequest) {
    return apiClient.post<LoginResponse, LoginRequest>('/auth/login', payload);
  },
  register(payload: RegisterRequest) {
    return apiClient.post<RegisterResponse, RegisterRequest>('/auth/register', payload);
  },
  me() {
    return apiClient.get<SessionUser | null>('/users/me', { silent401: true });
  },
  authPayload() {
    return apiClient.get<AuthSessionPayload>('/auth/me', { silent401: true });
  },
  async logout() {
    try {
      return await apiClient.post<SuccessResponse>('/auth/logout');
    } catch (error) {
      if (error instanceof ApiHttpError && error.status === 401) {
        return { success: true };
      }
      throw error;
    }
  },
};
