<script lang="ts">
  import type { CategoryWithStats, CreateCategoryDto } from '@trabajo/types';

  let {
    mode = 'create',
    initialValue = null,
    submitting = false,
    onCancel,
    onSubmit,
  } = $props<{
    mode?: 'create' | 'edit';
    initialValue?: CategoryWithStats | null;
    submitting?: boolean;
    onCancel: () => void;
    onSubmit: (payload: CreateCategoryDto) => void;
  }>();

  let name = $state('');
  let icon = $state('');
  let formError = $state('');

  $effect(() => {
    name = initialValue?.name ?? '';
    icon = initialValue?.icon ?? '';
  });

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!name.trim() || !icon.trim()) {
      formError = 'Name and icon are required.';
      return;
    }

    formError = '';
    onSubmit({
      name: name.trim(),
      icon: icon.trim(),
    });
  }
</script>

<form class="space-y-4" onsubmit={handleSubmit}>
  <label class="space-y-1">
    <span class="text-sm font-semibold text-slate-700">Category name</span>
    <input
      class="w-full rounded-xl border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
      bind:value={name}
      type="text"
      required
    />
  </label>

  <label class="space-y-1">
    <span class="text-sm font-semibold text-slate-700">Lucide icon name</span>
    <input
      class="w-full rounded-xl border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
      bind:value={icon}
      type="text"
      placeholder="laptop, package, shopping-cart"
      required
    />
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
      {submitting ? 'Saving...' : mode === 'create' ? 'Create category' : 'Save changes'}
    </button>
  </footer>
</form>
