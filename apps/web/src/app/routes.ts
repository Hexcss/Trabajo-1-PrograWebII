import { APP_ROUTES, type AppRoutePath } from '@/lib/constants';

export type RouteDefinition = {
  id: 'login' | 'market' | 'admin' | 'not-found';
  path: string;
  title: string;
  requiresAuth: boolean;
  adminOnly?: boolean;
  inNavigation?: boolean;
};

const routeTable: RouteDefinition[] = [
  {
    id: 'login',
    path: APP_ROUTES.login,
    title: 'Login',
    requiresAuth: false,
  },
  {
    id: 'market',
    path: APP_ROUTES.market,
    title: 'Store',
    requiresAuth: false,
    inNavigation: true,
  },
  {
    id: 'admin',
    path: APP_ROUTES.admin,
    title: 'Admin Console',
    requiresAuth: true,
    adminOnly: true,
    inNavigation: true,
  },
];

export function normalizePath(path: string): string {
  if (!path || path === '/') return APP_ROUTES.market;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return normalized.length > 1 ? normalized.replace(/\/$/, '') : normalized;
}

export function getRoute(path: string): RouteDefinition {
  const normalized = normalizePath(path);
  const found = routeTable.find((route) => route.path === normalized);
  if (found) return found;

  return {
    id: 'not-found',
    path: normalized,
    title: 'Not Found',
    requiresAuth: false,
  };
}

export function isKnownRoute(path: string): path is AppRoutePath {
  return routeTable.some((route) => route.path === path);
}

export const navigationRoutes = routeTable.filter((route) => route.inNavigation);
