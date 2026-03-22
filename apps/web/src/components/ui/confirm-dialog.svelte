<script lang="ts">
  import Modal from './modal.svelte';

  let {
    open,
    title,
    message,
    confirmText = 'Confirm',
    confirmTone = 'danger',
    pending = false,
    onCancel,
    onConfirm,
  } = $props<{
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    confirmTone?: 'danger' | 'default';
    pending?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
  }>();

  const confirmClass = $derived(
    confirmTone === 'danger'
      ? 'bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-400'
      : 'bg-teal-600 text-white hover:bg-teal-700 disabled:bg-teal-400'
  );
</script>

<Modal {open} {title} subtitle="This action cannot be undone." onClose={onCancel}>
  <div class="space-y-6">
    <p class="text-sm text-slate-600">{message}</p>

    <div class="flex justify-end gap-2">
      <button
        class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        type="button"
        onclick={onCancel}
      >
        Cancel
      </button>
      <button
        class={`rounded-lg px-4 py-2 text-sm font-semibold transition ${confirmClass}`}
        type="button"
        onclick={onConfirm}
        disabled={pending}
      >
        {pending ? 'Working...' : confirmText}
      </button>
    </div>
  </div>
</Modal>
