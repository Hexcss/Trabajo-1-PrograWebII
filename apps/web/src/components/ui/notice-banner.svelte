<script lang="ts">
  import MotionDiv from './motion-div.svelte';
  import type { SessionNotice } from '@/features/auth/auth-session.svelte';

  let { notice, onClose } = $props<{
    notice: SessionNotice | null;
    onClose: () => void;
  }>();

  const toneClass = $derived(
    notice?.kind === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
      : notice?.kind === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
        : 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300'
  );
</script>

{#if notice}
  <MotionDiv
    key={notice.text}
    class={`mb-4 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm ${toneClass}`}
    initial={{ opacity: 0, y: -12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
  >
    <p>{notice.text}</p>
    <button
      class="rounded-lg px-2 py-1 text-xs font-semibold text-current/70 transition hover:bg-black/5 hover:text-current"
      type="button"
      onclick={onClose}
    >
      Dismiss
    </button>
  </MotionDiv>
{/if}
