import { normalizePath } from './routes';

type NavigateOptions = {
  replace?: boolean;
};

class RouterState {
  currentPath = $state<string>('/market');

  constructor() {
    if (typeof window !== 'undefined') {
      this.currentPath = normalizePath(window.location.pathname);
    }
  }

  start() {
    if (typeof window === 'undefined') {
      return () => undefined;
    }

    const updateFromLocation = () => {
      this.currentPath = normalizePath(window.location.pathname);
    };

    updateFromLocation();
    window.addEventListener('popstate', updateFromLocation);

    return () => {
      window.removeEventListener('popstate', updateFromLocation);
    };
  }

  navigate(path: string, options: NavigateOptions = {}) {
    if (typeof window === 'undefined') return;

    const nextPath = normalizePath(path);
    if (nextPath === this.currentPath) return;

    if (options.replace) {
      window.history.replaceState({}, '', nextPath);
    } else {
      window.history.pushState({}, '', nextPath);
    }

    this.currentPath = nextPath;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export const router = new RouterState();
