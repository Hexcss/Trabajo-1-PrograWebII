import type {
  CreateUserDto,
  SessionUser,
  SuccessResponse,
  UpdateUserDto,
  UserListQuery,
  UsersListResponse,
} from '@trabajo/types';
import { apiClient } from './http-client';

export const usersService = {
  list(params: UserListQuery) {
    return apiClient.get<UsersListResponse>('/users', { query: params });
  },
  create(payload: CreateUserDto) {
    return apiClient.post<SessionUser, CreateUserDto>('/users', payload);
  },
  update(id: string, payload: UpdateUserDto) {
    return apiClient.patch<SessionUser, UpdateUserDto>(`/users/${id}`, payload);
  },
  remove(id: string) {
    return apiClient.delete<SuccessResponse>(`/users/${id}`);
  },
  updateMe(payload: UpdateUserDto) {
    return apiClient.patch<SessionUser, UpdateUserDto>('/users/me', payload);
  },
};
