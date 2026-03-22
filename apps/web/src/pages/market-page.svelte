<script lang="ts">
  import { createMutation, createQuery } from '@tanstack/svelte-query';
  import type {
    CategoryWithStats,
    CreateOrderDto,
    CreateReviewDto,
    Product,
    ProductsListResponse,
    Review,
    ReviewsListResponse,
  } from '@trabajo/types';
  import { APP_LANGUAGES, APP_ROUTES, STORE_NAME } from '@/lib/constants';
  import MotionDiv from '@/components/ui/motion-div.svelte';
  import Modal from '@/components/ui/modal.svelte';
  import Icon from '@/components/ui/icon.svelte';
  import ProductCard from '@/features/products/product-card.svelte';
  import { authSession } from '@/features/auth/auth-session.svelte';
  import { appPreferences } from '@/features/preferences/app-preferences.svelte';
  import { getFriendlyError } from '@/features/auth/auth-errors';
  import { queryClient } from '@/query/client';
  import { queryKeys } from '@/query/keys';
  import { categoriesService } from '@/services/categories.service';
  import { ordersService } from '@/services/orders.service';
  import { productsService } from '@/services/products.service';
  import { reviewsService } from '@/services/reviews.service';
  import { router } from '@/app/router.svelte';

  let { isAdmin } = $props<{ isAdmin: boolean }>();

  type CartLine = {
    productId: string;
    name: string;
    imageUrl?: string;
    quantity: number;
    unitPrice: number;
    stock: number;
  };

  let search = $state('');
  let selectedCategoryId = $state('');
  let sort = $state<'new' | 'priceAsc' | 'priceDesc' | 'rating'>('new');
  let page = $state(1);
  let selectedProduct = $state<Product | null>(null);
  let cartMap = $state<Record<string, CartLine>>({});
  let orderError = $state('');
  let reviewScore = $state(5);
  let reviewComment = $state('');
  let reviewError = $state('');

  const selectedProductId = $derived(selectedProduct?._id ?? '');

  const copy = $derived(
    appPreferences.language === APP_LANGUAGES.es
      ? {
          heroTag: 'Vista de tienda',
          heroTitle: 'Hardware y gadgets con estética de showroom digital.',
          heroBodyGuest: 'Explora como invitado. Regístrate para comentar, guardar en carrito y generar pedidos.',
          heroBodyUser: 'Agrega al carrito, deja comentarios en productos y finaliza tu pedido en segundos.',
          topPicks: 'Selección del día',
          search: 'Buscar',
          searchPlaceholder: 'Nombre del producto',
          sort: 'Ordenar',
          categories: 'Categorías',
          all: 'Todas',
          newest: 'Más nuevos',
          priceAsc: 'Precio: menor a mayor',
          priceDesc: 'Precio: mayor a menor',
          rating: 'Mejor valorados',
          openManagement: 'Abrir zona de gestión',
          noResults: 'No hay productos para los filtros seleccionados.',
          pagination: (current: number, totalPages: number, totalItems: number) =>
            `Página ${current} de ${totalPages} · ${totalItems} productos`,
          previous: 'Anterior',
          next: 'Siguiente',
          details: 'Detalles',
          addToCart: 'Agregar',
          loginToBuy: 'Inicia sesión',
          outOfStock: 'Sin stock',
          cartTitle: 'Carrito',
          cartGuestTitle: 'Modo invitado',
          cartGuestBody: 'Los invitados solo pueden explorar. Inicia sesión para comprar y comentar.',
          login: 'Iniciar sesión',
          emptyCart: 'Tu carrito está vacío.',
          quantity: 'Cantidad',
          subtotal: 'Subtotal',
          placeOrder: 'Realizar pedido',
          placingOrder: 'Procesando...',
          remove: 'Quitar',
          stock: 'Stock',
          ratingLabel: 'Puntuación',
          reviews: 'Comentarios',
          leaveReview: 'Dejar comentario',
          score: 'Puntaje',
          comment: 'Comentario',
          commentPlaceholder: 'Comparte qué te gustó o qué mejorar.',
          publishReview: 'Publicar comentario',
          publishing: 'Publicando...',
          loginToComment: 'Inicia sesión para comentar.',
          alreadyReviewed: 'Ya comentaste este producto.',
          noReviews: 'Aún no hay comentarios.',
          reviewSuccess: 'Comentario enviado.',
          addFromModal: 'Agregar al carrito',
          close: 'Cerrar',
        }
      : {
          heroTag: 'Store view',
          heroTitle: 'Hardware and gadgets presented like a digital showroom.',
          heroBodyGuest: 'Browse as guest. Sign in to comment, save to cart, and place orders.',
          heroBodyUser: 'Add to cart, leave product comments, and place your order in seconds.',
          topPicks: 'Top picks',
          search: 'Search',
          searchPlaceholder: 'Product name',
          sort: 'Sort',
          categories: 'Categories',
          all: 'All',
          newest: 'Newest',
          priceAsc: 'Price: low to high',
          priceDesc: 'Price: high to low',
          rating: 'Top rated',
          openManagement: 'Open management zone',
          noResults: 'No products match the selected filters.',
          pagination: (current: number, totalPages: number, totalItems: number) =>
            `Page ${current} of ${totalPages} · ${totalItems} products`,
          previous: 'Previous',
          next: 'Next',
          details: 'Details',
          addToCart: 'Add to cart',
          loginToBuy: 'Sign in',
          outOfStock: 'Out of stock',
          cartTitle: 'Cart',
          cartGuestTitle: 'Guest mode',
          cartGuestBody: 'Guests can only browse. Sign in to buy and comment.',
          login: 'Sign in',
          emptyCart: 'Your cart is empty.',
          quantity: 'Quantity',
          subtotal: 'Subtotal',
          placeOrder: 'Place order',
          placingOrder: 'Placing order...',
          remove: 'Remove',
          stock: 'Stock',
          ratingLabel: 'Rating',
          reviews: 'Comments',
          leaveReview: 'Leave a comment',
          score: 'Score',
          comment: 'Comment',
          commentPlaceholder: 'Share what you liked or what could improve.',
          publishReview: 'Publish comment',
          publishing: 'Publishing...',
          loginToComment: 'Sign in to comment.',
          alreadyReviewed: 'You already reviewed this product.',
          noReviews: 'No comments yet.',
          reviewSuccess: 'Comment submitted.',
          addFromModal: 'Add to cart',
          close: 'Close',
        }
  );

  const categoriesQuery = createQuery<CategoryWithStats[]>({
    queryKey: queryKeys.categories.all(),
    queryFn: categoriesService.list,
  });

  const topProductsQuery = createQuery<Product[]>({
    queryKey: queryKeys.products.top(),
    queryFn: () => productsService.top(4),
  });

  const productsQuery = createQuery<ProductsListResponse>({
    queryKey: ['products', 'market-list'],
    queryFn: () =>
      productsService.list({
        q: search || undefined,
        categoryId: selectedCategoryId || undefined,
        page,
        limit: 12,
        sort,
      }),
  });

  const reviewsQuery = createQuery<ReviewsListResponse>({
    queryKey: ['reviews', 'selected-product'],
    queryFn: () =>
      selectedProductId
        ? reviewsService.list({
            productId: selectedProductId,
            page: 1,
            limit: 30,
          })
        : Promise.resolve({
            items: [],
            total: 0,
            page: 1,
            limit: 30,
          }),
    enabled: false,
  });

  const createOrderMutation = createMutation({
    mutationFn: (payload: CreateOrderDto) => ordersService.create(payload),
    onSuccess: async () => {
      cartMap = {};
      orderError = '';
      authSession.setNotice({
        kind: 'success',
        text:
          appPreferences.language === APP_LANGUAGES.es
            ? 'Pedido generado correctamente.'
            : 'Order placed successfully.',
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.orders.mine() }),
      ]);
    },
    onError: (error: Error) => {
      orderError = getFriendlyError(
        error,
        appPreferences.language === APP_LANGUAGES.es
          ? 'No se pudo crear el pedido.'
          : 'Could not place order.'
      );
    },
  });

  const createReviewMutation = createMutation({
    mutationFn: (payload: CreateReviewDto) => reviewsService.create(payload),
    onSuccess: async () => {
      reviewComment = '';
      reviewError = '';
      authSession.setNotice({ kind: 'success', text: copy.reviewSuccess });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all() }),
        $reviewsQuery.refetch(),
      ]);
    },
    onError: (error: Error) => {
      reviewError = getFriendlyError(
        error,
        appPreferences.language === APP_LANGUAGES.es
          ? 'No se pudo publicar tu comentario.'
          : 'Could not publish your review.'
      );
    },
  });

  const items = $derived($productsQuery.data?.items ?? []);
  const total = $derived($productsQuery.data?.total ?? 0);
  const pages = $derived(Math.max(1, Math.ceil(total / 12)));
  const categories = $derived($categoriesQuery.data ?? []);
  const cartItems = $derived(Object.values(cartMap));
  const cartCount = $derived(cartItems.reduce((acc, item) => acc + item.quantity, 0));
  const cartSubtotal = $derived(
    cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0)
  );
  const reviews = $derived(($reviewsQuery.data?.items ?? []) as Review[]);
  const myReview = $derived(
    reviews.find((review) => review.userId === authSession.user?._id) ?? null
  );

  let filterSignature = $state('');
  let currentProductSignature = $state('');

  $effect(() => {
    if (page > pages) page = pages;
  });

  $effect(() => {
    const nextSignature = `${search}|${selectedCategoryId}|${sort}|${page}`;
    if (!filterSignature) {
      filterSignature = nextSignature;
      return;
    }
    if (nextSignature === filterSignature) return;
    filterSignature = nextSignature;
    void $productsQuery.refetch();
  });

  $effect(() => {
    const nextSignature = selectedProductId;
    if (nextSignature === currentProductSignature) return;
    currentProductSignature = nextSignature;
    reviewError = '';
    reviewComment = '';
    reviewScore = 5;
    if (!nextSignature) return;
    void $reviewsQuery.refetch();
  });

  $effect(() => {
    if (authSession.isAuthenticated) return;
    cartMap = {};
  });

  function getEffectivePrice(product: Product): number {
    if (!product.activeDiscount) return product.price;
    return Math.round(product.price * (1 - product.activeDiscount.discountPercent / 100) * 100) / 100;
  }

  function formatMoney(amount: number, currency = 'EUR') {
    const locale = appPreferences.language === APP_LANGUAGES.es ? 'es-ES' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  function requestLogin() {
    authSession.setNotice({
      kind: 'info',
      text:
        appPreferences.language === APP_LANGUAGES.es
          ? 'Inicia sesión para completar esa acción.'
          : 'Sign in to perform that action.',
    });
    router.navigate(APP_ROUTES.login);
  }

  function openProduct(product: Product) {
    selectedProduct = product;
  }

  function closeProductModal() {
    selectedProduct = null;
    reviewError = '';
    reviewComment = '';
    reviewScore = 5;
  }

  function applyCategory(categoryId: string) {
    selectedCategoryId = categoryId;
    page = 1;
  }

  function addToCart(product: Product) {
    if (!authSession.isAuthenticated) {
      requestLogin();
      return;
    }

    if (product.stock <= 0) return;

    const current = cartMap[product._id];
    const nextQuantity = Math.min(product.stock, (current?.quantity ?? 0) + 1);
    cartMap = {
      ...cartMap,
      [product._id]: {
        productId: product._id,
        name: product.name,
        imageUrl: product.imageUrl,
        quantity: nextQuantity,
        stock: product.stock,
        unitPrice: getEffectivePrice(product),
      },
    };
  }

  function incrementItem(productId: string) {
    const current = cartMap[productId];
    if (!current) return;
    if (current.quantity >= current.stock) return;
    cartMap = {
      ...cartMap,
      [productId]: {
        ...current,
        quantity: current.quantity + 1,
      },
    };
  }

  function decrementItem(productId: string) {
    const current = cartMap[productId];
    if (!current) return;
    if (current.quantity <= 1) {
      removeItem(productId);
      return;
    }
    cartMap = {
      ...cartMap,
      [productId]: {
        ...current,
        quantity: current.quantity - 1,
      },
    };
  }

  function removeItem(productId: string) {
    const next = { ...cartMap };
    delete next[productId];
    cartMap = next;
  }

  function placeOrder() {
    if (!authSession.isAuthenticated) {
      requestLogin();
      return;
    }
    if (cartItems.length === 0) return;

    const payload: CreateOrderDto = {
      items: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      currency: 'EUR',
    };

    orderError = '';
    $createOrderMutation.mutate(payload);
  }

  function submitReview(event: SubmitEvent) {
    event.preventDefault();
    if (!selectedProductId) return;
    if (!authSession.isAuthenticated) {
      requestLogin();
      return;
    }
    if (myReview) {
      reviewError = copy.alreadyReviewed;
      return;
    }
    if (reviewScore < 1 || reviewScore > 5) {
      reviewError = appPreferences.language === APP_LANGUAGES.es ? 'Puntaje inválido.' : 'Invalid score.';
      return;
    }

    reviewError = '';
    $createReviewMutation.mutate({
      productId: selectedProductId,
      score: reviewScore,
      comment: reviewComment.trim() || undefined,
    });
  }

  function goToManagement() {
    router.navigate(APP_ROUTES.admin);
  }
</script>

<section class="space-y-6">
  <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-soft dark:border-slate-700 sm:px-8">
    <div class="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-400/30 blur-3xl"></div>
    <div class="absolute -bottom-20 left-8 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl"></div>

    <MotionDiv
      class="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <p class="font-display text-xs uppercase tracking-[0.24em] text-cyan-200">{copy.heroTag}</p>
        <h2 class="mt-2 text-3xl font-bold leading-tight sm:text-4xl">{copy.heroTitle}</h2>
        <p class="mt-3 max-w-xl text-sm text-slate-200/95">
          {authSession.isAuthenticated ? copy.heroBodyUser : copy.heroBodyGuest}
        </p>

        <div class="mt-5 flex flex-wrap items-center gap-3">
          <span class="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-cyan-100">{STORE_NAME}</span>
          <span class="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-cyan-100">
            <Icon className="mr-1 inline-block" name="cart" size={13} />
            {cartCount}
          </span>
          {#if isAdmin}
            <button
              class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              type="button"
              onclick={goToManagement}
            >
              {copy.openManagement}
            </button>
          {/if}
        </div>
      </div>

      <div>
        <p class="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{copy.topPicks}</p>
        <div class="grid gap-3">
          {#if $topProductsQuery.isPending}
            {#each Array.from({ length: 3 }) as _}
              <div class="h-20 animate-pulse rounded-2xl border border-white/20 bg-white/10"></div>
            {/each}
          {:else}
            {#each $topProductsQuery.data ?? [] as product}
              <button
                class="rounded-2xl border border-white/20 bg-white/10 p-4 text-left text-sm backdrop-blur transition hover:bg-white/20"
                type="button"
                onclick={() => openProduct(product)}
              >
                <p class="font-semibold">{product.name}</p>
                <p class="mt-1 text-xs text-slate-100/80">{formatMoney(getEffectivePrice(product))}</p>
              </button>
            {/each}
          {/if}
        </div>
      </div>
    </MotionDiv>
  </div>

  <div class="grid gap-6 xl:grid-cols-[1fr_320px]">
    <div class="space-y-6">
      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
        <div class="grid gap-3 lg:grid-cols-[1.7fr_1fr]">
          <label class="space-y-1">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{copy.search}</span>
            <input
              class="w-full rounded-xl border-slate-300 bg-white text-sm text-slate-900 focus:border-cyan-600 focus:ring-cyan-600 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              bind:value={search}
              type="text"
              placeholder={copy.searchPlaceholder}
              oninput={() => (page = 1)}
            />
          </label>

          <label class="space-y-1">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{copy.sort}</span>
            <select
              class="w-full rounded-xl border-slate-300 bg-white text-sm text-slate-900 focus:border-cyan-600 focus:ring-cyan-600 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              bind:value={sort}
            >
              <option value="new">{copy.newest}</option>
              <option value="priceAsc">{copy.priceAsc}</option>
              <option value="priceDesc">{copy.priceDesc}</option>
              <option value="rating">{copy.rating}</option>
            </select>
          </label>

          <div class="space-y-1 lg:col-span-2">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{copy.categories}</span>
            <div class="flex flex-wrap items-center gap-2">
              <button
                class={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  selectedCategoryId === ''
                    ? 'bg-cyan-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
                type="button"
                onclick={() => applyCategory('')}
              >
                {copy.all}
              </button>
              {#each categories as category}
                <button
                  class={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                    selectedCategoryId === category._id
                      ? 'bg-cyan-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                  type="button"
                  onclick={() => applyCategory(category._id)}
                >
                  {category.name}
                </button>
              {/each}
            </div>
          </div>
        </div>
      </div>

      {#if $productsQuery.isPending}
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {#each Array.from({ length: 6 }) as _}
            <div class="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900" aria-hidden="true"></div>
          {/each}
        </div>
      {:else if items.length === 0}
        <div class="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300">
          {copy.noResults}
        </div>
      {:else}
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {#each items as product, index}
            <ProductCard
              {product}
              {index}
              canAddToCart={authSession.isAuthenticated}
              labels={{
                details: copy.details,
                addToCart: copy.addToCart,
                loginToBuy: copy.loginToBuy,
                outOfStock: copy.outOfStock,
              }}
              onOpen={openProduct}
              onAddToCart={addToCart}
              onRequireLogin={requestLogin}
            />
          {/each}
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900">
          <p class="text-slate-600 dark:text-slate-300">{copy.pagination(page, pages, total)}</p>
          <div class="flex gap-2">
            <button
              class="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              type="button"
              onclick={() => (page = Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              {copy.previous}
            </button>
            <button
              class="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              type="button"
              onclick={() => (page = Math.min(pages, page + 1))}
              disabled={page >= pages}
            >
              {copy.next}
            </button>
          </div>
        </div>
      {/if}
    </div>

    <aside class="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">{authSession.isAuthenticated ? copy.cartTitle : copy.cartGuestTitle}</h3>
        <span class="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">{cartCount}</span>
      </div>

      {#if !authSession.isAuthenticated}
        <div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <p>{copy.cartGuestBody}</p>
          <button
            class="mt-3 inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500"
            type="button"
            onclick={requestLogin}
          >
            <Icon name="login" size={15} />
            {copy.login}
          </button>
        </div>
      {:else if cartItems.length === 0}
        <div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {copy.emptyCart}
        </div>
      {:else}
        <div class="space-y-2">
          {#each cartItems as item}
            <article class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800">
              <p class="line-clamp-1 font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{formatMoney(item.unitPrice)}</p>

              <div class="mt-2 flex items-center justify-between gap-2">
                <div class="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-600 dark:bg-slate-900">
                  <button
                    class="inline-flex h-6 w-6 items-center justify-center rounded text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    type="button"
                    onclick={() => decrementItem(item.productId)}
                  >
                    <Icon name="minus" size={13} />
                  </button>
                  <span class="min-w-6 text-center text-xs font-semibold text-slate-700 dark:text-slate-200">{item.quantity}</span>
                  <button
                    class="inline-flex h-6 w-6 items-center justify-center rounded text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    type="button"
                    onclick={() => incrementItem(item.productId)}
                  >
                    <Icon name="plus" size={13} />
                  </button>
                </div>

                <button
                  class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                  type="button"
                  onclick={() => removeItem(item.productId)}
                >
                  <Icon name="trash" size={13} />
                  {copy.remove}
                </button>
              </div>
            </article>
          {/each}
        </div>

        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-600 dark:text-slate-300">{copy.subtotal}</span>
            <strong class="text-slate-900 dark:text-slate-100">{formatMoney(cartSubtotal)}</strong>
          </div>
        </div>

        {#if orderError}
          <p class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
            {orderError}
          </p>
        {/if}

        <button
          class="w-full rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:bg-cyan-400"
          type="button"
          onclick={placeOrder}
          disabled={$createOrderMutation.isPending}
        >
          {$createOrderMutation.isPending ? copy.placingOrder : copy.placeOrder}
        </button>
      {/if}
    </aside>
  </div>
</section>

<Modal
  open={selectedProduct !== null}
  title={selectedProduct?.name ?? 'Product details'}
  subtitle={selectedProduct?.category ?? STORE_NAME}
  panelClass="max-w-5xl"
  onClose={closeProductModal}
>
  {#if selectedProduct}
    <div class="grid gap-6 lg:grid-cols-[0.95fr_1.1fr]">
      <div class="space-y-3">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
          {#if selectedProduct.imageUrl}
            <img alt={selectedProduct.name} class="h-64 w-full object-cover" src={selectedProduct.imageUrl} />
          {:else}
            <div class="grid h-64 place-items-center text-sm font-semibold text-slate-400 dark:text-slate-500">No image available</div>
          {/if}
        </div>

        <div class="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-800">
          <p class="text-slate-700 dark:text-slate-200">{selectedProduct.description || '-'}</p>
          <p class="text-slate-700 dark:text-slate-200">
            <span class="font-semibold">{copy.stock}:</span> {selectedProduct.stock}
          </p>
          <p class="text-slate-700 dark:text-slate-200">
            <span class="font-semibold">{copy.ratingLabel}:</span> {selectedProduct.avgRating ?? '—'} ({selectedProduct.reviewCount ?? 0})
          </p>
          <p class="text-lg font-bold text-slate-900 dark:text-slate-100">{formatMoney(getEffectivePrice(selectedProduct))}</p>

          <button
            class={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              selectedProduct.stock <= 0
                ? 'cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                : authSession.isAuthenticated
                  ? 'bg-cyan-700 text-white hover:bg-cyan-600'
                  : 'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
            type="button"
            onclick={() => addToCart(selectedProduct!)}
            disabled={selectedProduct.stock <= 0}
          >
            <Icon name="cart" size={16} />
            {selectedProduct.stock <= 0
              ? copy.outOfStock
              : authSession.isAuthenticated
                ? copy.addFromModal
                : copy.loginToBuy}
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <h4 class="text-base font-bold text-slate-900 dark:text-slate-100">{copy.reviews}</h4>

        {#if !authSession.isAuthenticated}
          <p class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {copy.loginToComment}
          </p>
        {:else}
          <form class="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800" onsubmit={submitReview}>
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">{copy.leaveReview}</p>

            <label class="space-y-1">
              <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{copy.score}</span>
              <select
                class="w-full rounded-lg border-slate-300 bg-white text-sm text-slate-900 focus:border-cyan-600 focus:ring-cyan-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                bind:value={reviewScore}
              >
                <option value={5}>5</option>
                <option value={4}>4</option>
                <option value={3}>3</option>
                <option value={2}>2</option>
                <option value={1}>1</option>
              </select>
            </label>

            <label class="space-y-1">
              <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{copy.comment}</span>
              <textarea
                class="w-full rounded-lg border-slate-300 bg-white text-sm text-slate-900 focus:border-cyan-600 focus:ring-cyan-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                bind:value={reviewComment}
                rows="3"
                maxlength="500"
                placeholder={copy.commentPlaceholder}
              ></textarea>
            </label>

            {#if myReview}
              <p class="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                {copy.alreadyReviewed}
              </p>
            {/if}

            {#if reviewError}
              <p class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
                {reviewError}
              </p>
            {/if}

            <button
              class="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:bg-cyan-400"
              type="submit"
              disabled={$createReviewMutation.isPending || myReview !== null}
            >
              {$createReviewMutation.isPending ? copy.publishing : copy.publishReview}
            </button>
          </form>
        {/if}

        {#if $reviewsQuery.isPending}
          <div class="space-y-2">
            {#each Array.from({ length: 3 }) as _}
              <div class="h-14 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"></div>
            {/each}
          </div>
        {:else if reviews.length === 0}
          <p class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {copy.noReviews}
          </p>
        {:else}
          <div class="max-h-[370px] space-y-2 overflow-auto pr-1">
            {#each reviews as review}
              <article class="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                <div class="flex items-center justify-between gap-2">
                  <p class="font-semibold text-slate-800 dark:text-slate-100">
                    {review.user?.displayName || review.user?.email || review.userId}
                  </p>
                  <span class="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <Icon name="star" size={13} />
                    {review.score}
                  </span>
                </div>
                {#if review.comment}
                  <p class="mt-1 text-slate-600 dark:text-slate-300">{review.comment}</p>
                {/if}
              </article>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</Modal>
