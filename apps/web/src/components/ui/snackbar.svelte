<script lang="ts">
  import { AnimatePresence } from 'svelte-motion';
  import type { SessionNotice } from '@/features/auth/auth-session.svelte';
  import MotionDiv from './motion-div.svelte';

  let { notice, onClose } = $props<{
    notice: SessionNotice | null;
    onClose: () => void;
  }>();

  const toneClass = $derived(
    notice?.kind === 'error'
      ? 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/70 dark:text-rose-200'
      : notice?.kind === 'success'
        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200'
        : 'border-cyan-300 bg-cyan-50 text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950/70 dark:text-cyan-200'
  );

  $effect(() => {
    if (!notice || typeof window === 'undefined') return;

    const timeoutId = window.setTimeout(() => {
      onClose();
    }, 4200);

    return () => window.clearTimeout(timeoutId);
  });
</script>

<div class="pointer-events-none fixed bottom-4 left-4 z-[70] w-[min(92vw,24rem)]">
  <AnimatePresence show={notice !== null} initial={false}>
    <MotionDiv
      key={notice?.text ?? 'snackbar'}
      class={`pointer-events-auto overflow-hidden rounded-xl border p-3 shadow-2xl backdrop-blur ${toneClass}`}
      initial={{ opacity: 0, x: -24, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -18, y: 12, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
    >
      {#if notice}
        <div class="flex items-start justify-between gap-3">
          <p class="text-sm font-medium">{notice.text}</p>
          <button
            class="rounded-md px-2 py-1 text-xs font-semibold text-current/70 transition hover:bg-black/5 hover:text-current dark:hover:bg-white/10"
            type="button"
            onclick={onClose}
          >
            Dismiss
          </button>
        </div>
      {/if}
    </MotionDiv>
  </AnimatePresence>
</div>
