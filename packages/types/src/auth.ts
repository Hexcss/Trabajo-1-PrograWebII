import type { Role } from './common';

export type SessionUser = {
  _id: string;
  email: string;
  displayName?: string;
  role: Role;
  avatarUrl?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  displayName: string;
};

export type VerificationEmailResult = {
  attempted: boolean;
  sent: boolean;
  id: string | null;
  error: string | null;
};

export type LoginResponse = {
  user: SessionUser;
};

export type RegisterResponse = {
  user: SessionUser;
  verificationEmail: VerificationEmailResult;
};

export type AuthSessionPayload = {
  sub: string;
  email: string;
  role: Role;
};

export type WsTicketResponse = {
  token: string;
};
