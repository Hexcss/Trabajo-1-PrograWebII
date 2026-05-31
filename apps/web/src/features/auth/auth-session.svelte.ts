import type { SessionUser } from '@trabajo/types';
import { STORAGE_KEYS } from '@/lib/constants';
import { queryClient } from '@/query/client';
import { subscribeUnauthorized } from '@/services/http-client';

type AuthStatus = 'checking' | 'authenticated' | 'anonymous';

type SessionNotice = {
  kind: 'info' | 'success' | 'error';
  text: string;
};

class AuthSession {
  status = $state<AuthStatus>('checking');
  user = $state<SessionUser | null>(null);
  notice = $state<SessionNotice | null>(null);
  persistProfile = $state(true);

  isChecking = $derived(this.status === 'checking');
  isAuthenticated = $derived(this.status === 'authenticated' && this.user !== null);
  isAdmin = $derived(this.user?.role === 'admin');
  displayName = $derived(this.user?.displayName?.trim() || this.user?.email || 'Guest');

  constructor() {
    this.hydratePreference();
    this.hydrateUser();

    subscribeUnauthorized(() => {
      this.invalidate('Your session expired. Sign in again to continue.');
    });
  }

  beginChecking() {
    this.status = 'checking';
  }

  setSession(user: SessionUser, notice?: SessionNotice) {
    this.user = user;
    this.status = 'authenticated';
    if (notice) this.notice = notice;
    this.saveUser(user);
  }

  markAnonymous() {
    this.user = null;
    this.status = 'anonymous';
    this.removeCachedUser();
  }

  invalidate(message?: string) {
    this.user = null;
    this.status = 'anonymous';
    this.removeCachedUser();
    queryClient.clear();

    if (message) {
      this.notice = {
        kind: 'error',
        text: message,
      };
    }
  }

  clearNotice() {
    this.notice = null;
  }

  setNotice(notice: SessionNotice) {
    this.notice = notice;
  }

  setPersistence(enabled: boolean) {
    this.persistProfile = enabled;

    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(STORAGE_KEYS.sessionPreference, enabled ? '1' : '0');
    } catch {
      // Ignore storage failures.
    }

    if (!enabled) {
      this.removeCachedUser();
    } else if (this.user) {
      this.saveUser(this.user);
    }
  }

  private hydratePreference() {
    if (typeof window === 'undefined') return;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEYS.sessionPreference);
      if (stored === '0') {
        this.persistProfile = false;
      }
    } catch {
      // Ignore storage failures.
    }
  }

  private hydrateUser() {
    if (typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.cachedUser);
      if (!raw) return;

      const parsed = JSON.parse(raw) as SessionUser;
      if (!parsed || typeof parsed !== 'object' || !parsed._id || !parsed.email) return;

      this.user = parsed;
      this.status = 'authenticated';
    } catch {
      this.removeCachedUser();
    }
  }

  private saveUser(user: SessionUser) {
    if (typeof window === 'undefined' || !this.persistProfile) return;

    try {
      window.localStorage.setItem(STORAGE_KEYS.cachedUser, JSON.stringify(user));
    } catch {
      // Ignore storage failures.
    }
  }

  private removeCachedUser() {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.removeItem(STORAGE_KEYS.cachedUser);
    } catch {
      // Ignore storage failures.
    }
  }
}

export const authSession = new AuthSession();

export type { SessionNotice };
