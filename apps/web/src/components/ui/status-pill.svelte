<script lang="ts">
  let { tone = 'neutral', label } = $props<{
    tone?: 'neutral' | 'success' | 'warning' | 'danger';
    label: string;
  }>();

  const toneClass = $derived(
    tone === 'success'
      ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
      : tone === 'warning'
        ? 'bg-amber-100 text-amber-700 ring-amber-200'
        : tone === 'danger'
          ? 'bg-rose-100 text-rose-700 ring-rose-200'
          : 'bg-slate-100 text-slate-700 ring-slate-200'
  );
</script>

<span class={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${toneClass}`}>
  {label}
</span>
