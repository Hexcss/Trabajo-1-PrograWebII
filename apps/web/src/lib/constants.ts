import type { Role } from '@trabajo/types';

export const APP_ROUTES = {
  login: '/login',
  market: '/market',
  profile: '/profile',
  admin: '/admin',
} as const;

export type AppRoutePath = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];

export const STORAGE_KEYS = {
  cachedUser: 'storefront.cached-user',
  sessionPreference: 'storefront.session-preference',
  language: 'storefront.language',
  theme: 'storefront.theme',
} as const;

export const STORE_NAME = 'Circuit Harbor';

export const APP_LANGUAGES = {
  en: 'en',
  es: 'es',
} as const;

export type AppLanguage = (typeof APP_LANGUAGES)[keyof typeof APP_LANGUAGES];

export const APP_THEMES = {
  light: 'light',
  dark: 'dark',
} as const;

export type AppTheme = (typeof APP_THEMES)[keyof typeof APP_THEMES];

export const ROLES: Record<'user' | 'admin', Role> = {
  user: 'user',
  admin: 'admin',
};

export const ADMIN_TABS = {
  products: 'products',
  categories: 'categories',
  users: 'users',
  orders: 'orders',
} as const;

export type AdminTab = (typeof ADMIN_TABS)[keyof typeof ADMIN_TABS];
