<script lang="ts">
  import { createMutation } from '@tanstack/svelte-query';
  import type {
    CategoryWithStats,
    CreateProductDto,
    Product,
    UploadFileResponse,
  } from '@trabajo/types';
  import Icon from '@/components/ui/icon.svelte';
  import { getFriendlyError } from '@/features/auth/auth-errors';
  import { filesService } from '@/services/files.service';

  type DiscountDraft = {
    enabled: boolean;
    discountPercent: number;
    startDate: string;
    endDate: string;
  };

  type ProductFormSubmitPayload = {
    product: CreateProductDto;
    discount: DiscountDraft;
  };

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
    onSubmit: (payload: ProductFormSubmitPayload) => void | Promise<void>;
  }>();

  type Draft = {
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
    categoryId: string;
    tagsText: string;
    discountEnabled: boolean;
    discountPercent: number;
    discountStart: string;
    discountEnd: string;
  };

  function toDateTimeLocal(value?: string): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset() * 60_000;
    const local = new Date(date.getTime() - offset);
    return local.toISOString().slice(0, 16);
  }

  function buildEmptyDraft(): Draft {
    return {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      imageUrl: '',
      categoryId: '',
      tagsText: '',
      discountEnabled: false,
      discountPercent: 0,
      discountStart: '',
      discountEnd: '',
    };
  }

  let draft = $state<Draft>(buildEmptyDraft());
  let formError = $state('');
  let uploadError = $state('');
  let pickedFilename = $state('');

  const uploadImageMutation = createMutation<UploadFileResponse, Error, File>({
    mutationFn: (file: File) => filesService.upload(file, 'products'),
    onSuccess: (result) => {
      draft = {
        ...draft,
        imageUrl: result.url,
      };
      uploadError = '';
    },
    onError: (error) => {
      uploadError = getFriendlyError(error, 'Could not upload image.');
    },
  });

  $effect(() => {
    uploadError = '';
    pickedFilename = '';

    if (!initialValue) {
      draft = buildEmptyDraft();
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
      discountEnabled: Boolean(initialValue.activeDiscount),
      discountPercent: Number(initialValue.activeDiscount?.discountPercent ?? 0),
      discountStart: toDateTimeLocal(initialValue.activeDiscount?.startDate),
      discountEnd: toDateTimeLocal(initialValue.activeDiscount?.endDate),
    };
  });

  function parseTags(value: string) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function handleImagePick(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    pickedFilename = file.name;
    uploadError = '';
    $uploadImageMutation.mutate(file);
  }

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    formError = '';

    if (!draft.name.trim()) {
      formError = 'Product name is required.';
      return;
    }

    if (draft.price < 0 || draft.stock < 0) {
      formError = 'Price and stock must be positive values.';
      return;
    }

    let discountStartIso = '';
    let discountEndIso = '';

    if (draft.discountEnabled) {
      if (
        draft.discountPercent < 0 ||
        draft.discountPercent > 100 ||
        !draft.discountStart ||
        !draft.discountEnd
      ) {
        formError = 'Discount requires valid percent, start date and end date.';
        return;
      }

      const start = new Date(draft.discountStart);
      const end = new Date(draft.discountEnd);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
        formError = 'Discount end date must be after start date.';
        return;
      }

      discountStartIso = start.toISOString();
      discountEndIso = end.toISOString();
    }

    const selectedCategory = categories.find((item: CategoryWithStats) => item._id === draft.categoryId);

    void onSubmit({
      product: {
        name: draft.name.trim(),
        description: draft.description.trim() || undefined,
        price: Number(draft.price),
        stock: Number(draft.stock),
        imageUrl: draft.imageUrl.trim() || undefined,
        categoryId: draft.categoryId || undefined,
        category: selectedCategory?.name,
        tags: parseTags(draft.tagsText),
      },
      discount: {
        enabled: draft.discountEnabled,
        discountPercent: Number(draft.discountPercent),
        startDate: discountStartIso,
        endDate: discountEndIso,
      },
    });
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

    <div class="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-2">
      <div class="flex flex-wrap items-center gap-3">
        <div class="grid h-20 w-20 place-items-center overflow-hidden rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-500">
          {#if draft.imageUrl}
            <img alt="Product" class="h-full w-full object-cover" src={draft.imageUrl} />
          {:else}
            No image
          {/if}
        </div>

        <label class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
          <Icon name="upload" size={14} />
          {$uploadImageMutation.isPending ? 'Uploading...' : 'Upload image'}
          <input class="hidden" type="file" accept="image/*" onchange={handleImagePick} />
        </label>
      </div>

      {#if pickedFilename}
        <p class="text-xs text-slate-500">{pickedFilename}</p>
      {/if}

      <label class="space-y-1">
        <span class="text-sm font-semibold text-slate-700">Image URL</span>
        <input
          class="w-full rounded-xl border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
          bind:value={draft.imageUrl}
          type="url"
          placeholder="https://example.com/image.jpg"
        />
      </label>
    </div>

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

    <div class="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-2">
      <label class="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input
          class="rounded border-slate-300 text-teal-600 focus:ring-teal-600"
          type="checkbox"
          bind:checked={draft.discountEnabled}
        />
        Enable discount for this product
      </label>

      {#if draft.discountEnabled}
        <div class="grid gap-3 md:grid-cols-3">
          <label class="space-y-1">
            <span class="text-sm font-semibold text-slate-700">Percent (%)</span>
            <input
              class="w-full rounded-xl border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
              bind:value={draft.discountPercent}
              type="number"
              min="0"
              max="100"
              step="0.01"
            />
          </label>

          <label class="space-y-1">
            <span class="text-sm font-semibold text-slate-700">Start</span>
            <input
              class="w-full rounded-xl border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
              bind:value={draft.discountStart}
              type="datetime-local"
            />
          </label>

          <label class="space-y-1">
            <span class="text-sm font-semibold text-slate-700">End</span>
            <input
              class="w-full rounded-xl border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
              bind:value={draft.discountEnd}
              type="datetime-local"
            />
          </label>
        </div>
      {/if}
    </div>
  </div>

  {#if uploadError}
    <p class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{uploadError}</p>
  {/if}

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
      disabled={submitting || $uploadImageMutation.isPending}
    >
      {submitting ? 'Saving...' : mode === 'create' ? 'Create product' : 'Save changes'}
    </button>
  </footer>
</form>
