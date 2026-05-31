<script lang="ts">
  import { createMutation } from '@tanstack/svelte-query';
  import type { LoginRequest, LoginResponse } from '@trabajo/types';
  import { APP_LANGUAGES, APP_ROUTES, STORE_NAME } from '@/lib/constants';
  import MotionDiv from '@/components/ui/motion-div.svelte';
  import { authService } from '@/services/auth.service';
  import { queryClient } from '@/query/client';
  import { queryKeys } from '@/query/keys';
  import { authSession } from '@/features/auth/auth-session.svelte';
  import { appPreferences } from '@/features/preferences/app-preferences.svelte';
  import { getFriendlyError } from '@/features/auth/auth-errors';
  import { router } from '@/app/router.svelte';

  let email = $state('');
  let password = $state('');
  let remember = $state(authSession.persistProfile);
  let formError = $state('');

  const copy = $derived(
    appPreferences.language === APP_LANGUAGES.es
      ? {
          title: 'Iniciar sesión',
          subtitle: 'Usa tus credenciales del backend para acceder a tu cuenta.',
          email: 'Correo',
          password: 'Contraseña',
          remember: 'Mantener perfil en este dispositivo',
          submit: 'Entrar',
          submitting: 'Ingresando...',
          google: 'Entrar con Google',
          github: 'Entrar con GitHub',
          guest: 'Entrar como invitado',
          heroTag: STORE_NAME,
          heroTitle: 'Tu tienda tech con panel de gestión integrado.',
          heroBody: 'Invitados pueden explorar; usuarios registrados pueden comentar, comprar y gestionar su perfil.',
          validation: 'Ingresa un correo válido y una contraseña de al menos 6 caracteres.',
          loginError: 'No se pudo iniciar sesión con esas credenciales.',
        }
      : {
          title: 'Sign in',
          subtitle: 'Use your backend credentials to access your account.',
          email: 'Email',
          password: 'Password',
          remember: 'Keep profile cache on this device',
          submit: 'Sign in',
          submitting: 'Signing in...',
          google: 'Continue with Google',
          github: 'Continue with GitHub',
          guest: 'Continue as guest',
          heroTag: STORE_NAME,
          heroTitle: 'A focused tech store with integrated management workspace.',
          heroBody: 'Guests can browse, registered users can comment, buy, and manage profile settings.',
          validation: 'Enter a valid email and a password with at least 6 characters.',
          loginError: 'Could not login with those credentials.',
        }
  );

  const loginMutation = createMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: (result) => {
      authSession.setPersistence(remember);
      authSession.setSession(result.user, {
        kind: 'success',
        text:
          appPreferences.language === APP_LANGUAGES.es
            ? `Bienvenido, ${result.user.displayName ?? result.user.email}.`
            : `Welcome back, ${result.user.displayName ?? result.user.email}.`,
      });
      queryClient.setQueryData(queryKeys.auth.me(), result.user);
      router.navigate(APP_ROUTES.market, { replace: true });
    },
    onError: (error) => {
      formError = getFriendlyError(error, copy.loginError);
    },
  });

  function submit(event: SubmitEvent) {
    event.preventDefault();
    formError = '';

    if (!email.trim() || password.trim().length < 6) {
      formError = copy.validation;
      return;
    }

    $loginMutation.mutate({
      email: email.trim(),
      password,
    });
  }

  function continueAsGuest() {
    router.navigate(APP_ROUTES.market);
  }

  function continueWithGoogle() {
    if (typeof window === 'undefined') return;
    const baseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
    window.location.href = `${baseUrl}/auth/oauth/google/start?intent=login`;
  }

  function continueWithGithub() {
    if (typeof window === 'undefined') return;
    const baseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
    window.location.href = `${baseUrl}/auth/oauth/github/start?intent=login`;
  }
</script>

<div class="grid min-h-[calc(100vh-3rem)] place-items-center py-8">
  <MotionDiv
    class="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-2xl backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/80 lg:grid-cols-2"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 240, damping: 24 }}
  >
    <div class="relative hidden bg-gradient-to-br from-cyan-700 via-sky-700 to-indigo-700 p-10 text-white lg:block">
      <div class="absolute -right-24 -top-20 h-64 w-64 rounded-full bg-white/20 blur-2xl"></div>
      <div class="absolute -bottom-20 left-4 h-72 w-72 rounded-full bg-cyan-900/40 blur-2xl"></div>

      <p class="font-display text-sm uppercase tracking-[0.28em] text-cyan-100">{copy.heroTag}</p>
      <h2 class="mt-4 text-4xl font-bold leading-tight">{copy.heroTitle}</h2>
      <p class="mt-4 max-w-md text-sm text-sky-50/90">
        {copy.heroBody}
      </p>

      <ul class="mt-10 space-y-3 text-sm">
        <li class="rounded-xl bg-white/15 px-3 py-2">JWT cookies + automatic token refresh</li>
        <li class="rounded-xl bg-white/15 px-3 py-2">Role-aware navigation and protected admin zone</li>
        <li class="rounded-xl bg-white/15 px-3 py-2">Interactive catalog with comments and cart orders</li>
      </ul>
    </div>

    <div class="p-6 sm:p-10">
      <div class="mb-6">
        <p class="font-display text-sm uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{STORE_NAME}</p>
        <h1 class="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{copy.title}</h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{copy.subtitle}</p>
      </div>

      <form class="space-y-4" onsubmit={submit}>
        <label class="space-y-1">
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">{copy.email}</span>
          <input
            class="w-full rounded-xl border-slate-300 bg-white text-sm text-slate-900 focus:border-teal-600 focus:ring-teal-600 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
            bind:value={email}
            type="email"
            autocomplete="email"
            required
          />
        </label>

        <label class="space-y-1">
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">{copy.password}</span>
          <input
            class="w-full rounded-xl border-slate-300 bg-white text-sm text-slate-900 focus:border-teal-600 focus:ring-teal-600 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
            bind:value={password}
            type="password"
            autocomplete="current-password"
            minlength="6"
            required
          />
        </label>

        <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            class="rounded border-slate-300 text-teal-600 focus:ring-teal-600 dark:border-slate-600 dark:bg-slate-900"
            bind:checked={remember}
            type="checkbox"
          />
          {copy.remember}
        </label>

        {#if formError}
          <p class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">{formError}</p>
        {/if}

        <div class="space-y-2 pt-1">
          <button
            class="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-500 dark:bg-cyan-600 dark:hover:bg-cyan-500"
            type="submit"
            disabled={$loginMutation.isPending}
          >
            {$loginMutation.isPending ? copy.submitting : copy.submit}
          </button>
          <button
            class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
            type="button"
            onclick={continueWithGoogle}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" class="h-4 w-4">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9a6 6 0 1 1 0-12c2.3 0 3.8 1 4.7 1.8l3.2-3.1A10.8 10.8 0 0 0 12 2a10 10 0 1 0 0 20c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.4-.2-2H12z" />
              <path fill="#FBBC05" d="M3.2 7.3l3.6 2.7A6 6 0 0 1 12 6c2.3 0 3.8 1 4.7 1.8l3.2-3.1A10.8 10.8 0 0 0 12 2C8.1 2 4.8 4.2 3.2 7.3z" />
              <path fill="#34A853" d="M12 22c2.9 0 5.3-1 7-2.8l-3.2-2.6c-.9.7-2 1.2-3.8 1.2-3.9 0-5.2-2.6-5.5-3.9l-3.5 2.7C4.7 19.8 8 22 12 22z" />
              <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.5c-.3 1.3-1.5 3.9-5.5 3.9-3.9 0-5.8-2.9-5.8-6s2-6 5.8-6c2.3 0 3.8 1 4.7 1.8l3.2-3.1A10.8 10.8 0 0 0 12 2a10 10 0 0 0-9 14.6l3.5-2.7A6 6 0 0 1 6.2 12c0-3.1 2-6 5.8-6 2.3 0 3.8 1 4.7 1.8l3.2-3.1A10.8 10.8 0 0 0 12 2a10 10 0 1 0 9.6 10.2z" opacity=".08" />
            </svg>
            {copy.google}
          </button>
          <button
            class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
            type="button"
            onclick={continueWithGithub}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" class="h-4 w-4 fill-current">
              <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.2.8-.6v-2.3c-3.4.8-4.1-1.6-4.1-1.6-.6-1.5-1.4-1.9-1.4-1.9-1.2-.8.1-.8.1-.8 1.3.1 2.1 1.4 2.1 1.4 1.2 2 3.1 1.4 3.9 1.1.1-.9.5-1.4.8-1.7-2.7-.3-5.5-1.4-5.5-6a4.7 4.7 0 0 1 1.2-3.2 4.3 4.3 0 0 1 .1-3.1s1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2a4.3 4.3 0 0 1 .1 3.1 4.7 4.7 0 0 1 1.2 3.2c0 4.6-2.8 5.6-5.5 6 .5.4.9 1.2.9 2.5v3.7c0 .4.2.7.8.6A12 12 0 0 0 12 .3" />
            </svg>
            {copy.github}
          </button>
          <button
            class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            type="button"
            onclick={continueAsGuest}
          >
            {copy.guest}
          </button>
        </div>
      </form>
    </div>
  </MotionDiv>
</div>
