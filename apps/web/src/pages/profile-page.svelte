<script lang="ts">
  import { createMutation } from '@tanstack/svelte-query';
  import type { SessionUser } from '@trabajo/types';
  import MotionDiv from '@/components/ui/motion-div.svelte';
  import { authSession } from '@/features/auth/auth-session.svelte';
  import { getFriendlyError } from '@/features/auth/auth-errors';
  import { usersService } from '@/services/users.service';
  import { queryClient } from '@/query/client';
  import { queryKeys } from '@/query/keys';

  let displayName = $state(authSession.user?.displayName ?? '');
  let avatarUrl = $state(authSession.user?.avatarUrl ?? '');
  let formError = $state('');
  let successMessage = $state('');

  $effect(() => {
    displayName = authSession.user?.displayName ?? '';
    avatarUrl = authSession.user?.avatarUrl ?? '';
  });

  const updateMutation = createMutation<SessionUser, Error, void>({
    mutationFn: () =>
      usersService.updateMe({
        displayName: displayName.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      }),
    onSuccess: (updated) => {
      authSession.setSession(updated, { kind: 'success', text: 'Profile updated successfully.' });
      queryClient.setQueryData(queryKeys.auth.me(), updated);
      successMessage = 'Changes saved.';
      formError = '';
    },
    onError: (error) => {
      formError = getFriendlyError(error, 'Could not update your profile.');
      successMessage = '';
    },
  });

  function submit(event: SubmitEvent) {
    event.preventDefault();
    successMessage = '';
    formError = '';
    $updateMutation.mutate();
  }

  function togglePersistence(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    authSession.setPersistence(target.checked);
  }
</script>

<section class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
  <MotionDiv
    class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
  >
    <div class="relative h-36 bg-gradient-to-r from-teal-700 via-teal-600 to-amber-500"></div>
    <div class="px-6 pb-6">
      <div class="-mt-12 inline-flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-slate-200 text-3xl font-bold text-slate-700">
        {#if authSession.user?.avatarUrl}
          <img alt={authSession.displayName} class="h-full w-full object-cover" src={authSession.user.avatarUrl} />
        {:else}
          {(authSession.displayName || 'U').slice(0, 1).toUpperCase()}
        {/if}
      </div>

      <h2 class="mt-4 text-2xl font-bold text-slate-900">{authSession.displayName}</h2>
      <p class="text-sm text-slate-500">{authSession.user?.email}</p>

      <dl class="mt-5 space-y-2 text-sm">
        <div class="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
          <dt class="text-slate-500">Role</dt>
          <dd class="font-semibold text-slate-800">{authSession.user?.role ?? '-'}</dd>
        </div>
        <div class="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
          <dt class="text-slate-500">User ID</dt>
          <dd class="font-mono text-xs text-slate-700">{authSession.user?._id ?? '-'}</dd>
        </div>
      </dl>
    </div>
  </MotionDiv>

  <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <h3 class="text-xl font-bold text-slate-900">Profile preferences</h3>
    <p class="mt-1 text-sm text-slate-500">Update your visible profile details.</p>

    <form class="mt-5 space-y-4" onsubmit={submit}>
      <label class="space-y-1">
        <span class="text-sm font-semibold text-slate-700">Display name</span>
        <input
          class="w-full rounded-xl border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
          bind:value={displayName}
          type="text"
        />
      </label>

      <label class="space-y-1">
        <span class="text-sm font-semibold text-slate-700">Avatar URL</span>
        <input
          class="w-full rounded-xl border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
          bind:value={avatarUrl}
          type="url"
          placeholder="https://example.com/avatar.jpg"
        />
      </label>

      <label class="flex items-center gap-2 text-sm text-slate-600">
        <input
          checked={authSession.persistProfile}
          class="rounded border-slate-300 text-teal-600 focus:ring-teal-600"
          type="checkbox"
          onchange={togglePersistence}
        />
        Keep quick profile cache in local storage
      </label>

      {#if formError}
        <p class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>
      {/if}

      {#if successMessage}
        <p class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p>
      {/if}

      <button
        class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-500"
        type="submit"
        disabled={$updateMutation.isPending}
      >
        {$updateMutation.isPending ? 'Saving...' : 'Save profile'}
      </button>
    </form>
  </div>
</section>
