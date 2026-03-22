<script lang="ts">
  import { AnimatePresence } from 'svelte-motion';
  import type { Snippet } from 'svelte';
  import MotionDiv from './motion-div.svelte';

  let {
    open,
    title,
    subtitle,
    panelClass = '',
    onClose,
    children,
  } = $props<{
    open: boolean;
    title: string;
    subtitle?: string;
    panelClass?: string;
    onClose: () => void;
    children?: Snippet;
  }>();

  function closeFromBackdrop(event: MouseEvent) {
    if (event.currentTarget !== event.target) return;
    onClose();
  }
</script>

<AnimatePresence show={open} initial={false}>
  <MotionDiv
    key="overlay"
    class="fixed inset-0 z-50 grid place-items-center bg-slate-900/45 p-4 dark:bg-slate-950/70"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    onclick={closeFromBackdrop}
  >
    <MotionDiv
      key="panel"
      class={`w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900 ${panelClass}`}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 18, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
    >
      <header class="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          {#if subtitle}
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          {/if}
        </div>
        <button
          class="rounded-lg border border-slate-200 px-2.5 py-1 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          type="button"
          onclick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      </header>

      {@render children?.()}
    </MotionDiv>
  </MotionDiv>
</AnimatePresence>
