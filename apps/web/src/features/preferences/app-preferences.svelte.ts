import {
  APP_LANGUAGES,
  APP_THEMES,
  type AppLanguage,
  type AppTheme,
  STORAGE_KEYS,
} from '@/lib/constants';

class AppPreferences {
  language = $state<AppLanguage>(APP_LANGUAGES.en);
  theme = $state<AppTheme>(APP_THEMES.light);

  isDark = $derived(this.theme === APP_THEMES.dark);

  constructor() {
    this.hydrate();
  }

  setLanguage(language: AppLanguage) {
    this.language = language;
    this.persist(STORAGE_KEYS.language, language);
  }

  setTheme(theme: AppTheme) {
    this.theme = theme;
    this.persist(STORAGE_KEYS.theme, theme);
    this.syncThemeClass();
  }

  toggleTheme() {
    this.setTheme(this.theme === APP_THEMES.dark ? APP_THEMES.light : APP_THEMES.dark);
  }

  label(values: Record<AppLanguage, string>) {
    return values[this.language];
  }

  private hydrate() {
    if (typeof window === 'undefined') return;

    try {
      const storedLanguage = window.localStorage.getItem(STORAGE_KEYS.language);
      if (storedLanguage === APP_LANGUAGES.en || storedLanguage === APP_LANGUAGES.es) {
        this.language = storedLanguage;
      }

      const storedTheme = window.localStorage.getItem(STORAGE_KEYS.theme);
      if (storedTheme === APP_THEMES.light || storedTheme === APP_THEMES.dark) {
        this.theme = storedTheme;
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.theme = prefersDark ? APP_THEMES.dark : APP_THEMES.light;
      }
    } catch {
      // Ignore storage failures.
    }

    this.syncThemeClass();
  }

  private persist(key: string, value: string) {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore storage failures.
    }
  }

  private syncThemeClass() {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.classList.toggle('dark', this.theme === APP_THEMES.dark);
    root.style.colorScheme = this.theme;
  }
}

export const appPreferences = new AppPreferences();
