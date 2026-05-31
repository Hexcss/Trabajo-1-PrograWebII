<script lang="ts">
  import type { Snippet } from 'svelte';
  import MotionDiv from '@/components/ui/motion-div.svelte';
  import Icon from '@/components/ui/icon.svelte';
  import {
    APP_LANGUAGES,
    APP_ROUTES,
    APP_THEMES,
    STORE_NAME,
    type AppLanguage,
    type AppTheme,
  } from '@/lib/constants';

  let {
    currentPath,
    pageTitle,
    isAuthenticated,
    isAdmin,
    userName,
    userAvatarUrl,
    language,
    theme,
    onNavigate,
    onLogin,
    onLogout,
    onOpenProfile,
    onLanguageChange,
    onThemeToggle,
    children,
  } = $props<{
    currentPath: string;
    pageTitle: string;
    isAuthenticated: boolean;
    isAdmin: boolean;
    userName: string;
    userAvatarUrl?: string;
    language: AppLanguage;
    theme: AppTheme;
    onNavigate: (path: string) => void;
    onLogin: () => void;
    onLogout: () => void;
    onOpenProfile: () => void;
    onLanguageChange: (language: AppLanguage) => void;
    onThemeToggle: () => void;
    children?: Snippet;
  }>();

  let accountMenuOpen = $state(false);
  let accountMenuElement = $state<HTMLElement | null>(null);

  const copy = $derived(
    language === APP_LANGUAGES.es
      ? {
          store: 'Tienda',
          admin: 'Gestión',
          profile: 'Perfil',
          logout: 'Cerrar sesión',
          login: 'Ingresar',
          theme: theme === APP_THEMES.dark ? 'Modo claro' : 'Modo oscuro',
        }
      : {
          store: 'Store',
          admin: 'Management',
          profile: 'Profile',
          logout: 'Logout',
          login: 'Sign in',
          theme: theme === APP_THEMES.dark ? 'Light mode' : 'Dark mode',
        }
  );

  const navItems = $derived(
    [
      { label: copy.store, path: APP_ROUTES.market, icon: 'store' as const },
      ...(isAdmin ? [{ label: copy.admin, path: APP_ROUTES.admin, icon: 'admin' as const }] : []),
    ] as Array<{ label: string; path: string; icon: 'store' | 'admin' }>
  );

  $effect(() => {
    if (!accountMenuOpen || typeof window === 'undefined') return;

    const handleWindowClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target || !accountMenuElement || accountMenuElement.contains(target)) return;
      accountMenuOpen = false;
    };

    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  });

  function goTo(path: string) {
    onNavigate(path);
    accountMenuOpen = false;
  }

  function openProfile() {
    accountMenuOpen = false;
    onOpenProfile();
  }

  function logout() {
    accountMenuOpen = false;
    onLogout();
  }
</script>

<div class="min-h-full">
  <header class="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80">
    <div class="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
      <button class="text-left" type="button" onclick={() => goTo(APP_ROUTES.market)}>
        <p class="font-display text-[11px] uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-300">{STORE_NAME}</p>
        <h1 class="text-lg font-bold text-slate-900 dark:text-slate-100">{pageTitle}</h1>
      </button>

      <nav class="flex flex-wrap items-center gap-2">
        {#each navItems as item}
          <button
            class={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              currentPath === item.path
                ? 'bg-cyan-700 text-white shadow'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
            type="button"
            onclick={() => goTo(item.path)}
          >
            <Icon name={item.icon} size={15} />
            {item.label}
          </button>
        {/each}
      </nav>

      <div class="flex items-center gap-2">
        <div class="flex items-center rounded-lg border border-slate-300 bg-white p-0.5 dark:border-slate-600 dark:bg-slate-900">
          <button
            class={`rounded-md px-2 py-1 text-xs font-semibold transition ${
              language === APP_LANGUAGES.en
                ? 'bg-slate-900 text-white dark:bg-cyan-600'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            type="button"
            onclick={() => onLanguageChange(APP_LANGUAGES.en)}
            aria-label="English"
          >
            EN
          </button>
          <button
            class={`rounded-md px-2 py-1 text-xs font-semibold transition ${
              language === APP_LANGUAGES.es
                ? 'bg-slate-900 text-white dark:bg-cyan-600'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            type="button"
            onclick={() => onLanguageChange(APP_LANGUAGES.es)}
            aria-label="Español"
          >
            ES
          </button>
        </div>

        <button
          class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          type="button"
          onclick={onThemeToggle}
          aria-label={copy.theme}
          title={copy.theme}
        >
          <Icon name={theme === APP_THEMES.dark ? 'sun' : 'moon'} size={16} />
        </button>

        {#if isAuthenticated}
          <div class="relative" bind:this={accountMenuElement}>
            <button
              class="inline-flex h-9 items-center gap-1 rounded-full border border-slate-300 bg-white px-1.5 pr-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              type="button"
              onclick={() => (accountMenuOpen = !accountMenuOpen)}
              aria-expanded={accountMenuOpen}
              aria-label={copy.profile}
            >
              <span class="grid h-6 w-6 place-items-center overflow-hidden rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-cyan-600">
                {#if userAvatarUrl}
                  <img alt={userName} class="h-full w-full object-cover" src={userAvatarUrl} />
                {:else}
                  {(userName || 'U').slice(0, 1).toUpperCase()}
                {/if}
              </span>
              <Icon name="chevron-down" size={14} />
            </button>

            {#if accountMenuOpen}
              <div class="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                <button
                  class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  type="button"
                  onclick={openProfile}
                >
                  <Icon name="profile" size={16} />
                  {copy.profile}
                </button>
                <button
                  class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                  type="button"
                  onclick={logout}
                >
                  <Icon name="logout" size={16} />
                  {copy.logout}
                </button>
              </div>
            {/if}
          </div>
        {:else}
          <button
            class="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            type="button"
            onclick={onLogin}
          >
            <Icon name="login" size={16} />
            {copy.login}
          </button>
        {/if}
      </div>
    </div>
  </header>

  <MotionDiv
    key={currentPath}
    class="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25 }}
  >
    {@render children?.()}
  </MotionDiv>
</div>
