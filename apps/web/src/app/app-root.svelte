<script lang="ts">
  import { createMutation, createQuery } from '@tanstack/svelte-query';
  import type { SessionUser, SuccessResponse } from '@trabajo/types';
  import { APP_LANGUAGES, APP_ROUTES } from '@/lib/constants';
  import { getRoute } from './routes';
  import { router } from './router.svelte';
  import { authSession } from '@/features/auth/auth-session.svelte';
  import { appPreferences } from '@/features/preferences/app-preferences.svelte';
  import { authService } from '@/services/auth.service';
  import { queryKeys } from '@/query/keys';
  import { queryClient } from '@/query/client';
  import AppShell from '@/components/layout/app-shell.svelte';
  import Snackbar from '@/components/ui/snackbar.svelte';
  import ProfileModal from '@/features/profile/profile-modal.svelte';
  import LoginPage from '@/pages/login-page.svelte';
  import MarketPage from '@/pages/market-page.svelte';
  import AdminPage from '@/pages/admin-page.svelte';

  let profileModalOpen = $state(false);

  const meQuery = createQuery<SessionUser | null>({
    queryKey: queryKeys.auth.me(),
    queryFn: authService.me,
    retry: false,
    refetchOnWindowFocus: true,
  });

  const logoutMutation = createMutation<SuccessResponse, Error, void>({
    mutationFn: authService.logout,
  });

  $effect(() => {
    const stop = router.start();
    return stop;
  });

  $effect(() => {
    const state = $meQuery;

    if (state.isPending) {
      if (!authSession.user) authSession.beginChecking();
      return;
    }

    if (state.isSuccess) {
      if (state.data) {
        authSession.setSession(state.data);
      } else {
        authSession.markAnonymous();
      }
      return;
    }

    if (state.isError) {
      authSession.markAnonymous();
    }
  });

  const route = $derived(getRoute(router.currentPath));
  const pageTitle = $derived(
    route.id === 'market'
      ? appPreferences.language === APP_LANGUAGES.es
        ? 'Tienda'
        : 'Store'
      : route.id === 'admin'
        ? appPreferences.language === APP_LANGUAGES.es
          ? 'Gestión'
          : 'Management'
        : route.title
  );

  $effect(() => {
    if (authSession.isChecking) return;

    if (!authSession.isAuthenticated && route.requiresAuth) {
      authSession.setNotice({
        kind: 'error',
        text:
          appPreferences.language === APP_LANGUAGES.es
            ? 'Necesitas iniciar sesión para entrar a esa sección.'
            : 'You need to sign in to access that section.',
      });
      router.navigate(APP_ROUTES.login, { replace: true });
      return;
    }

    if (authSession.isAuthenticated && route.path === APP_ROUTES.login) {
      router.navigate(APP_ROUTES.market, { replace: true });
      return;
    }

    if (authSession.isAuthenticated && route.adminOnly && !authSession.isAdmin) {
      authSession.setNotice({
        kind: 'error',
        text: appPreferences.language === APP_LANGUAGES.es ? 'Se requiere rol de administrador.' : 'Admin role required for that section.',
      });
      router.navigate(APP_ROUTES.market, { replace: true });
      return;
    }

    if (route.id === 'not-found') {
      router.navigate(APP_ROUTES.market, { replace: true });
    }
  });

  $effect(() => {
    if (authSession.isAuthenticated) return;
    profileModalOpen = false;
  });

  async function handleLogout() {
    try {
      await $logoutMutation.mutateAsync();
    } finally {
      queryClient.clear();
      authSession.markAnonymous();
      authSession.setNotice({
        kind: 'info',
        text: appPreferences.language === APP_LANGUAGES.es ? 'Sesión cerrada.' : 'Session closed.',
      });
      profileModalOpen = false;
      router.navigate(APP_ROUTES.market, { replace: true });
    }
  }

  function navigate(path: string) {
    router.navigate(path);
  }

  function openLogin() {
    router.navigate(APP_ROUTES.login);
  }

  function openProfile() {
    if (!authSession.isAuthenticated) {
      openLogin();
      return;
    }
    profileModalOpen = true;
  }

  function closeProfile() {
    profileModalOpen = false;
  }

  function clearNotice() {
    authSession.clearNotice();
  }
</script>

{#if route.path === APP_ROUTES.login}
  <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
    <LoginPage />
  </div>
{:else if authSession.isChecking}
  <div class="grid min-h-screen place-items-center px-4">
    <div class="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
      {appPreferences.language === APP_LANGUAGES.es ? 'Restaurando sesión...' : 'Restoring session...'}
    </div>
  </div>
{:else}
  <AppShell
    currentPath={route.path}
    {pageTitle}
    isAuthenticated={authSession.isAuthenticated}
    isAdmin={authSession.isAdmin}
    userName={authSession.displayName}
    userAvatarUrl={authSession.user?.avatarUrl}
    language={appPreferences.language}
    theme={appPreferences.theme}
    onNavigate={navigate}
    onLogin={openLogin}
    onLogout={handleLogout}
    onOpenProfile={openProfile}
    onLanguageChange={(language) => appPreferences.setLanguage(language)}
    onThemeToggle={() => appPreferences.toggleTheme()}
  >
    {#if route.path === APP_ROUTES.market}
      <MarketPage isAdmin={authSession.isAdmin} />
    {:else if route.path === APP_ROUTES.admin}
      <AdminPage />
    {:else}
      <div class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300">
        Unknown route.
      </div>
    {/if}

    <ProfileModal open={profileModalOpen} onClose={closeProfile} />
  </AppShell>
{/if}

<Snackbar notice={authSession.notice} onClose={clearNotice} />
