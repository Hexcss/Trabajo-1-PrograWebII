import type { PaginatedResponse, Role } from './common';

export type UserSummary = {
  _id: string;
  email: string;
  displayName?: string;
  role: Role;
  avatarUrl?: string;
  createdAt?: string;
};

export type UserListQuery = {
  q?: string;
  role?: Role;
  limit?: number;
  page?: number;
};

export type UsersListResponse = PaginatedResponse<UserSummary>;

export type CreateUserDto = {
  email: string;
  password: string;
  displayName?: string;
  role?: Role;
};

export type UpdateUserDto = {
  displayName?: string;
  avatarUrl?: string;
  role?: Role;
};
