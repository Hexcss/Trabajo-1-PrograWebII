<script lang="ts">
  import type { CategoryWithStats, CreateProductDto, Product } from '@trabajo/types';

  let {
    mode = 'create',
    categories,
    initialValue = null,
    submitting = false,
    onCancel,
    onSubmit,
  } = $props<{
    mode?: 'create' | 'edit';
    categories: CategoryWithStats[];
    initialValue?: Product | null;
    submitting?: boolean;
    onCancel: () => void;
    onSubmit: (payload: CreateProductDto) => void;
  }>();

  type Draft = {
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
    categoryId: string;
    tagsText: string;
  };

  const emptyDraft: Draft = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    imageUrl: '',
    categoryId: '',
    tagsText: '',
  };

  let draft = $state<Draft>(emptyDraft);
  let formError = $state('');

  $effect(() => {
    if (!initialValue) {
      draft = emptyDraft;
      return;
    }

    draft = {
      name: initialValue.name,
      description: initialValue.description ?? '',
      price: Number(initialValue.price ?? 0),
      stock: Number(initialValue.stock ?? 0),
      imageUrl: initialValue.imageUrl ?? '',
      categoryId: initialValue.categoryId ?? '',
      tagsText: initialValue.tags?.join(', ') ?? '',
    };
  });

  function parseTags(value: string) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!draft.name.trim()) {
      formError = 'Product name is required.';
      return;
    }

    if (draft.price < 0 || draft.stock < 0) {
      formError = 'Price and stock must be positive values.';
      return;
    }

    const selectedCategory = categories.find((item: CategoryWithStats) => item._id === draft.categoryId);

    onSubmit({
      name: draft.name.trim(),
      description: draft.description.trim() || undefined,
      price: Number(draft.price),
      stock: Number(draft.stock),
      imageUrl: draft.imageUrl.trim() || undefined,
      categoryId: draft.categoryId || undefined,
      category: selectedCategory?.name,
      tags: parseTags(draft.tagsText),
    });

    formError = '';
  }
</script>

<form class="space-y-4" onsubmit={handleSubmit}>
  <div class="grid gap-4 md:grid-cols-2">
    <label class="space-y-1 md:col-span-2">
      <span class="text-sm font-semibold text-slate-700">Name</span>
      <input
        class="w-full rounded-xl border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
        bind:value={draft.name}
        type="text"
        required
      />
    </label>

    <label class="space-y-1 md:col-span-2">
      <span class="text-sm font-semibold text-slate-700">Description</span>
      <textarea
        class="w-full rounded-xl border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
        bind:value={draft.description}
        rows="4"
      ></textarea>
    </label>

    <label class="space-y-1">
      <span class="text-sm font-semibold text-slate-700">Price</span>
      <input
        class="w-full rounded-xl border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
        bind:value={draft.price}
        type="number"
        min="0"
        step="0.01"
        required
      />
    </label>

    <label class="space-y-1">
      <span class="text-sm font-semibold text-slate-700">Stock</span>
      <input
        class="w-full rounded-xl border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
        bind:value={draft.stock}
        type="number"
        min="0"
        step="1"
        required
      />
    </label>

    <label class="space-y-1 md:col-span-2">
      <span class="text-sm font-semibold text-slate-700">Image URL</span>
      <input
        class="w-full rounded-xl border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
        bind:value={draft.imageUrl}
        type="url"
        placeholder="https://example.com/image.jpg"
      />
    </label>

    <label class="space-y-1">
      <span class="text-sm font-semibold text-slate-700">Category</span>
      <select
        class="w-full rounded-xl border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
        bind:value={draft.categoryId}
      >
        <option value="">No category</option>
        {#each categories as category}
          <option value={category._id}>{category.name}</option>
        {/each}
      </select>
    </label>

    <label class="space-y-1">
      <span class="text-sm font-semibold text-slate-700">Tags</span>
      <input
        class="w-full rounded-xl border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
        bind:value={draft.tagsText}
        type="text"
        placeholder="gaming, office, premium"
      />
    </label>
  </div>

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
      {submitting ? 'Saving...' : mode === 'create' ? 'Create product' : 'Save changes'}
    </button>
  </footer>
</form>
