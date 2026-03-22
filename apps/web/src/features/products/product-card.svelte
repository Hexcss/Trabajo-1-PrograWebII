<script lang="ts">
  import MotionDiv from '@/components/ui/motion-div.svelte';
  import Icon from '@/components/ui/icon.svelte';
  import type { Product } from '@trabajo/types';
  import { clampText, formatCurrency } from '@/lib/formatters';

  let {
    product,
    index = 0,
    canAddToCart = false,
    labels,
    onOpen,
    onAddToCart,
    onRequireLogin,
  } = $props<{
    product: Product;
    index?: number;
    canAddToCart?: boolean;
    labels: {
      details: string;
      addToCart: string;
      loginToBuy: string;
      outOfStock: string;
    };
    onOpen: (product: Product) => void;
    onAddToCart: (product: Product) => void;
    onRequireLogin: () => void;
  }>();

  const discountedPrice = $derived(
    product.activeDiscount
      ? product.price * (1 - product.activeDiscount.discountPercent / 100)
      : product.price
  );

  const canPurchase = $derived(product.stock > 0);
</script>

<MotionDiv
  class="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900"
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.04, type: 'spring', stiffness: 260, damping: 24 }}
>
  <button class="flex flex-1 flex-col text-left" type="button" onclick={() => onOpen(product)}>
    <div class="relative h-44 overflow-hidden bg-slate-100">
      {#if product.imageUrl}
        <img
          alt={product.name}
          class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          src={product.imageUrl}
          loading="lazy"
        />
      {:else}
        <div class="grid h-full place-items-center text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          No image
        </div>
      {/if}

      {#if product.activeDiscount}
        <span class="absolute left-3 top-3 rounded-full bg-rose-600 px-2 py-1 text-xs font-semibold text-white">
          -{product.activeDiscount.discountPercent}%
        </span>
      {/if}
    </div>

    <div class="flex flex-1 flex-col space-y-3 p-4 pb-2">
      <div class="min-h-[4.75rem]">
        <p class="line-clamp-1 text-base font-bold text-slate-900 dark:text-slate-100">{product.name}</p>
        <p class="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{clampText(product.description ?? 'No description available.', 86)}</p>
      </div>

      <div class="mt-auto flex items-end justify-between">
        <div>
          <p class="text-lg font-bold text-slate-900 dark:text-slate-100">{formatCurrency(discountedPrice)}</p>
          {#if product.activeDiscount}
            <p class="text-xs text-slate-500 line-through dark:text-slate-400">{formatCurrency(product.price)}</p>
          {/if}
        </div>

        <div class="text-right text-xs font-medium text-slate-500 dark:text-slate-400">
          <p>{product.reviewCount ?? 0} reviews</p>
          <p>Rating {product.avgRating ?? '—'}</p>
        </div>
      </div>
    </div>
  </button>

  <div class="grid grid-cols-2 gap-2 p-4 pt-2">
    <button
      class="h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
      type="button"
      onclick={() => onOpen(product)}
    >
      <span class="whitespace-nowrap">{labels.details}</span>
    </button>
    <button
      class={`inline-flex h-11 items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
        canPurchase
          ? canAddToCart
            ? 'bg-cyan-700 text-white hover:bg-cyan-600'
            : 'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800'
          : 'cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
      }`}
      type="button"
      onclick={() => {
        if (!canPurchase) return;
        if (canAddToCart) {
          onAddToCart(product);
          return;
        }
        onRequireLogin();
      }}
      disabled={!canPurchase}
    >
      {#if canPurchase}
        <Icon name="cart" size={15} />
      {/if}
      <span class="whitespace-nowrap">{canPurchase ? (canAddToCart ? labels.addToCart : labels.loginToBuy) : labels.outOfStock}</span>
    </button>
  </div>
</MotionDiv>
