<script lang="ts">
  import type { CreateUserDto, Role, UserSummary } from '@trabajo/types';

  let {
    mode = 'create',
    initialValue = null,
    submitting = false,
    onCancel,
    onSubmit,
  } = $props<{
    mode?: 'create' | 'edit';
    initialValue?: UserSummary | null;
    submitting?: boolean;
    onCancel: () => void;
    onSubmit: (payload: CreateUserDto) => void;
  }>();

  let email = $state('');
  let password = $state('');
  let displayName = $state('');
  let role = $state<Role>('user');
  let formError = $state('');

  $effect(() => {
    email = initialValue?.email ?? '';
    displayName = initialValue?.displayName ?? '';
    role = initialValue?.role ?? 'user';
    password = '';
  });

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!email.trim()) {
      formError = 'Email is required.';
      return;
    }

    if (mode === 'create' && password.trim().length < 6) {
      formError = 'Password must have at least 6 characters.';
      return;
    }

    formError = '';
    onSubmit({
      email: email.trim(),
      password: password.trim(),
      displayName: displayName.trim() || undefined,
      role,
    });
  }
</script>

<form class="space-y-4" onsubmit={handleSubmit}>
  <label class="space-y-1">
    <span class="text-sm font-semibold text-slate-700">Email</span>
    <input
      class="w-full rounded-xl border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
      bind:value={email}
      type="email"
      required
      disabled={mode === 'edit'}
    />
  </label>

  {#if mode === 'create'}
    <label class="space-y-1">
      <span class="text-sm font-semibold text-slate-700">Temporary password</span>
      <input
        class="w-full rounded-xl border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
        bind:value={password}
        type="password"
        required
        minlength="6"
      />
    </label>
  {/if}

  <label class="space-y-1">
    <span class="text-sm font-semibold text-slate-700">Display name</span>
    <input
      class="w-full rounded-xl border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
      bind:value={displayName}
      type="text"
    />
  </label>

  <label class="space-y-1">
    <span class="text-sm font-semibold text-slate-700">Role</span>
    <select
      class="w-full rounded-xl border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
      bind:value={role}
    >
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </select>
  </label>

  {#if formError}
    <p class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>
  {/if}

  <footer class="flex justify-end gap-2 pt-2">
    <button
      class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      type="button"
      onclick={onCancel}
    >
      Cancel
    </button>
    <button
      class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:bg-teal-400"
      type="submit"
      disabled={submitting}
    >
      {submitting ? 'Saving...' : mode === 'create' ? 'Create user' : 'Save changes'}
    </button>
  </footer>
</form>
