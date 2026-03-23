<script lang="ts">
  import { createMutation, createQuery } from '@tanstack/svelte-query';
  import type {
    CategoryWithStats,
    CreateCategoryDto,
    CreateDiscountDto,
    CreateProductDto,
    CreateUserDto,
    Discount,
    Order,
    OrdersListResponse,
    OrderStatus,
    Product,
    ProductsListResponse,
    Role,
    SuccessResponse,
    UserSummary,
    UsersListResponse,
  } from '@trabajo/types';
  import { ADMIN_TABS, type AdminTab } from '@/lib/constants';
  import { formatCurrency, formatDate } from '@/lib/formatters';
  import { queryClient } from '@/query/client';
  import { queryKeys } from '@/query/keys';
  import { authSession } from '@/features/auth/auth-session.svelte';
  import { getFriendlyError } from '@/features/auth/auth-errors';
  import { productsService } from '@/services/products.service';
  import { categoriesService } from '@/services/categories.service';
  import { discountsService } from '@/services/discounts.service';
  import { usersService } from '@/services/users.service';
  import { ordersService } from '@/services/orders.service';
  import ProductForm from '@/features/products/product-form.svelte';
  import CategoryForm from '@/features/categories/category-form.svelte';
  import UserForm from '@/features/users/user-form.svelte';
  import Modal from '@/components/ui/modal.svelte';
  import ConfirmDialog from '@/components/ui/confirm-dialog.svelte';

  let activeTab = $state<AdminTab>(ADMIN_TABS.products);

  let productSearch = $state('');
  let userSearch = $state('');
  let userRoleFilter = $state<'all' | Role>('all');
  let orderStatusDrafts = $state<Record<string, OrderStatus>>({});
  let discountSyncing = $state(false);

  const orderStatusOptions: OrderStatus[] = ['created', 'processing', 'shipped', 'delivered', 'cancelled'];

  type ProductSubmitPayload = {
    product: CreateProductDto;
    discount: {
      enabled: boolean;
      discountPercent: number;
      startDate: string;
      endDate: string;
    };
  };

  let productModal = $state<{ open: boolean; mode: 'create' | 'edit'; product: Product | null }>({
    open: false,
    mode: 'create',
    product: null,
  });

  let categoryModal = $state<{ open: boolean; mode: 'create' | 'edit'; category: CategoryWithStats | null }>({
    open: false,
    mode: 'create',
    category: null,
  });

  let userModal = $state<{ open: boolean; mode: 'create' | 'edit'; user: UserSummary | null }>({
    open: false,
    mode: 'create',
    user: null,
  });

  type ConfirmState = {
    open: boolean;
    title: string;
    message: string;
    pending: boolean;
    action: null | (() => Promise<void>);
  };

  let confirmState = $state<ConfirmState>({
    open: false,
    title: '',
    message: '',
    pending: false,
    action: null,
  });

  let globalError = $state('');

  const productsQuery = createQuery<ProductsListResponse>({
    queryKey: ['products', 'admin-list'],
    queryFn: () =>
      productsService.list({
        q: productSearch || undefined,
        limit: 100,
        page: 1,
        sort: 'new',
      }),
  });

  const categoriesQuery = createQuery<CategoryWithStats[]>({
    queryKey: queryKeys.categories.all(),
    queryFn: categoriesService.list,
  });

  const usersQuery = createQuery<UsersListResponse>({
    queryKey: ['users', 'admin-list'],
    queryFn: () =>
      usersService.list({
        q: userSearch || undefined,
        role: userRoleFilter === 'all' ? undefined : userRoleFilter,
        page: 1,
        limit: 100,
      }),
  });

  const ordersQuery = createQuery<OrdersListResponse>({
    queryKey: queryKeys.orders.list({ page: 1, limit: 100 }),
    queryFn: () => ordersService.list({ page: 1, limit: 100 }),
  });

  let productFilterSignature = $state('');
  let userFilterSignature = $state('');

  $effect(() => {
    const nextSignature = productSearch.trim();

    if (productFilterSignature === '') {
      productFilterSignature = nextSignature;
      return;
    }

    if (nextSignature === productFilterSignature) return;

    productFilterSignature = nextSignature;
    void $productsQuery.refetch();
  });

  $effect(() => {
    const nextSignature = `${userSearch.trim()}|${userRoleFilter}`;

    if (userFilterSignature === '') {
      userFilterSignature = nextSignature;
      return;
    }

    if (nextSignature === userFilterSignature) return;

    userFilterSignature = nextSignature;
    void $usersQuery.refetch();
  });

  const createProductMutation = createMutation<Product, Error, CreateProductDto>({
    mutationFn: (payload: CreateProductDto) => productsService.create(payload),
    onError: (error) => {
      globalError = getFriendlyError(error, 'Could not create product.');
    },
  });

  const updateProductMutation = createMutation<Product, Error, { id: string; payload: CreateProductDto }>({
    mutationFn: ({ id, payload }: { id: string; payload: CreateProductDto }) => productsService.update(id, payload),
    onError: (error) => {
      globalError = getFriendlyError(error, 'Could not update product.');
    },
  });

  const deleteProductMutation = createMutation<SuccessResponse, Error, string>({
    mutationFn: (id: string) => productsService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
      authSession.setNotice({ kind: 'success', text: 'Product deleted.' });
    },
    onError: (error) => {
      globalError = getFriendlyError(error, 'Could not delete product.');
    },
  });

  const createCategoryMutation = createMutation<CategoryWithStats, Error, CreateCategoryDto>({
    mutationFn: (payload: CreateCategoryDto) => categoriesService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
      closeCategoryModal();
      authSession.setNotice({ kind: 'success', text: 'Category created.' });
    },
    onError: (error) => {
      globalError = getFriendlyError(error, 'Could not create category.');
    },
  });

  const updateCategoryMutation = createMutation<
    CategoryWithStats,
    Error,
    { id: string; payload: CreateCategoryDto }
  >({
    mutationFn: ({ id, payload }: { id: string; payload: CreateCategoryDto }) => categoriesService.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
      closeCategoryModal();
      authSession.setNotice({ kind: 'success', text: 'Category updated.' });
    },
    onError: (error) => {
      globalError = getFriendlyError(error, 'Could not update category.');
    },
  });

  const deleteCategoryMutation = createMutation<SuccessResponse, Error, string>({
    mutationFn: (id: string) => categoriesService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
      authSession.setNotice({ kind: 'success', text: 'Category deleted.' });
    },
    onError: (error) => {
      globalError = getFriendlyError(error, 'Could not delete category.');
    },
  });

  const createUserMutation = createMutation<UserSummary, Error, CreateUserDto>({
    mutationFn: (payload: CreateUserDto) => usersService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      closeUserModal();
      authSession.setNotice({ kind: 'success', text: 'User created.' });
    },
    onError: (error) => {
      globalError = getFriendlyError(error, 'Could not create user.');
    },
  });

  const updateUserMutation = createMutation<
    UserSummary,
    Error,
    { id: string; payload: { displayName?: string; role?: Role } }
  >({
    mutationFn: ({ id, payload }: { id: string; payload: { displayName?: string; role?: Role } }) =>
      usersService.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      closeUserModal();
      authSession.setNotice({ kind: 'success', text: 'User updated.' });
    },
    onError: (error) => {
      globalError = getFriendlyError(error, 'Could not update user.');
    },
  });

  const deleteUserMutation = createMutation<SuccessResponse, Error, string>({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      authSession.setNotice({ kind: 'success', text: 'User deleted.' });
    },
    onError: (error) => {
      globalError = getFriendlyError(error, 'Could not delete user.');
    },
  });

  const updateOrderMutation = createMutation<Order, Error, { id: string; status: OrderStatus }>({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersService.update(id, { status }),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
      orderStatusDrafts = {
        ...orderStatusDrafts,
        [updated._id]: normalizeOrderStatus(updated.status),
      };
      authSession.setNotice({ kind: 'success', text: 'Order status updated.' });
    },
    onError: (error) => {
      globalError = getFriendlyError(error, 'Could not update order status.');
    },
  });

  const products = $derived($productsQuery.data?.items ?? []);
  const categories = $derived($categoriesQuery.data ?? []);
  const users = $derived($usersQuery.data?.items ?? []);
  const orders = $derived($ordersQuery.data?.items ?? []);

  const isProductSubmitting = $derived(
    $createProductMutation.isPending || $updateProductMutation.isPending || discountSyncing
  );
  const isCategorySubmitting = $derived($createCategoryMutation.isPending || $updateCategoryMutation.isPending);
  const isUserSubmitting = $derived($createUserMutation.isPending || $updateUserMutation.isPending);

  async function syncDiscountForProduct(
    productId: string,
    discountInput: ProductSubmitPayload['discount']
  ) {
    const existing = await discountsService.list({ productId });

    if (!discountInput.enabled) {
      if (existing.length > 0) {
        await Promise.all(existing.map((item: Discount) => discountsService.remove(item._id)));
      }
      return;
    }

    const payload: CreateDiscountDto = {
      productId,
      discountPercent: Number(discountInput.discountPercent),
      startDate: discountInput.startDate,
      endDate: discountInput.endDate,
    };

    if (existing.length === 0) {
      await discountsService.create(payload);
      return;
    }

    await discountsService.update(existing[0]._id, payload);
    if (existing.length > 1) {
      await Promise.all(existing.slice(1).map((item: Discount) => discountsService.remove(item._id)));
    }
  }

  function normalizeOrderStatus(status?: string): OrderStatus {
    if (status === 'created') return 'created';
    if (status === 'processing') return 'processing';
    if (status === 'shipped') return 'shipped';
    if (status === 'delivered') return 'delivered';
    if (status === 'cancelled' || status === 'canceled') return 'cancelled';
    return 'created';
  }

  function getOrderDraftStatus(order: Order): OrderStatus {
    return orderStatusDrafts[order._id] ?? normalizeOrderStatus(order.status);
  }

  function setOrderDraftStatus(orderId: string, value: string) {
    const status = normalizeOrderStatus(value);
    orderStatusDrafts = {
      ...orderStatusDrafts,
      [orderId]: status,
    };
  }

  async function saveOrderStatus(order: Order) {
    globalError = '';
    const status = getOrderDraftStatus(order);
    await $updateOrderMutation.mutateAsync({ id: order._id, status });
  }

  function closeProductModal() {
    productModal = { open: false, mode: 'create', product: null };
  }

  function closeCategoryModal() {
    categoryModal = { open: false, mode: 'create', category: null };
  }

  function closeUserModal() {
    userModal = { open: false, mode: 'create', user: null };
  }

  async function submitProduct(payload: ProductSubmitPayload) {
    globalError = '';

    try {
      const savedProduct =
        productModal.mode === 'create'
          ? await $createProductMutation.mutateAsync(payload.product)
          : productModal.product
            ? await $updateProductMutation.mutateAsync({
                id: productModal.product._id,
                payload: payload.product,
              })
            : null;

      if (!savedProduct) return;

      discountSyncing = true;
      await syncDiscountForProduct(savedProduct._id, payload.discount);
      await queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
      closeProductModal();
      authSession.setNotice({
        kind: 'success',
        text: productModal.mode === 'create' ? 'Product created.' : 'Product updated.',
      });
    } catch (error) {
      globalError = getFriendlyError(error, 'Could not save product.');
    } finally {
      discountSyncing = false;
    }
  }

  function submitCategory(payload: CreateCategoryDto) {
    globalError = '';

    if (categoryModal.mode === 'create') {
      $createCategoryMutation.mutate(payload);
      return;
    }

    if (categoryModal.category) {
      $updateCategoryMutation.mutate({ id: categoryModal.category._id, payload });
    }
  }

  function submitUser(payload: CreateUserDto) {
    globalError = '';

    if (userModal.mode === 'create') {
      $createUserMutation.mutate(payload);
      return;
    }

    if (userModal.user) {
      $updateUserMutation.mutate({
        id: userModal.user._id,
        payload: {
          displayName: payload.displayName,
          role: payload.role,
        },
      });
    }
  }

  function requestConfirmation(title: string, message: string, action: () => Promise<void>) {
    confirmState = {
      open: true,
      title,
      message,
      pending: false,
      action,
    };
  }

  function cancelConfirmation() {
    confirmState = {
      open: false,
      title: '',
      message: '',
      pending: false,
      action: null,
    };
  }

  async function runConfirmation() {
    if (!confirmState.action) return;

    confirmState.pending = true;
    try {
      await confirmState.action();
      cancelConfirmation();
    } catch {
      confirmState.pending = false;
    }
  }
</script>

<section class="space-y-6">
  <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="font-display text-xs uppercase tracking-[0.22em] text-slate-400">Admin Workspace</p>
        <h2 class="mt-1 text-2xl font-bold text-slate-900">Operations Console</h2>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          class={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
            activeTab === ADMIN_TABS.products
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          type="button"
          onclick={() => (activeTab = ADMIN_TABS.products)}
        >
          Products
        </button>
        <button
          class={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
            activeTab === ADMIN_TABS.categories
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          type="button"
          onclick={() => (activeTab = ADMIN_TABS.categories)}
        >
          Categories
        </button>
        <button
          class={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
            activeTab === ADMIN_TABS.users
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          type="button"
          onclick={() => (activeTab = ADMIN_TABS.users)}
        >
          Users
        </button>
        <button
          class={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
            activeTab === ADMIN_TABS.orders
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          type="button"
          onclick={() => (activeTab = ADMIN_TABS.orders)}
        >
          Orders
        </button>
      </div>
    </div>

    {#if globalError}
      <p class="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{globalError}</p>
    {/if}
  </div>

  {#if activeTab === ADMIN_TABS.products}
    <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex w-full max-w-md items-center gap-2">
          <input
            class="w-full rounded-xl border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
            bind:value={productSearch}
            type="text"
            placeholder="Search products"
          />
        </div>
        <button
          class="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
          type="button"
          onclick={() => (productModal = { open: true, mode: 'create', product: null })}
        >
          Add product
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-3 py-2">Product</th>
              <th class="px-3 py-2">Category</th>
              <th class="px-3 py-2">Price</th>
              <th class="px-3 py-2">Stock</th>
              <th class="px-3 py-2">Discount</th>
              <th class="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#if $productsQuery.isPending}
              <tr>
                <td class="px-3 py-6 text-center text-slate-500" colspan="6">Loading products...</td>
              </tr>
            {:else if products.length === 0}
              <tr>
                <td class="px-3 py-6 text-center text-slate-500" colspan="6">No products found.</td>
              </tr>
            {:else}
              {#each products as product}
                <tr class="border-b border-slate-100">
                  <td class="px-3 py-2 font-semibold text-slate-900">{product.name}</td>
                  <td class="px-3 py-2 text-slate-600">{product.category ?? '-'}</td>
                  <td class="px-3 py-2 text-slate-600">{formatCurrency(product.price)}</td>
                  <td class="px-3 py-2 text-slate-600">{product.stock}</td>
                  <td class="px-3 py-2">
                    {#if product.activeDiscount}
                      <div class="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <span>-{product.activeDiscount.discountPercent}%</span>
                        <span>Active</span>
                      </div>
                      <div class="mt-1 text-[11px] text-slate-500">
                        {formatDate(product.activeDiscount.startDate)} - {formatDate(product.activeDiscount.endDate)}
                      </div>
                    {:else}
                      <span class="inline-flex rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
                        No active discount
                      </span>
                    {/if}
                  </td>
                  <td class="px-3 py-2">
                    <div class="flex gap-2">
                      <button
                        class="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        type="button"
                        onclick={() => (productModal = { open: true, mode: 'edit', product })}
                      >
                        Edit
                      </button>
                      <button
                        class="rounded-md border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                        type="button"
                        onclick={() =>
                          requestConfirmation(
                            'Delete product',
                            `Delete ${product.name}?`,
                            async () => {
                              await $deleteProductMutation.mutateAsync(product._id);
                            }
                          )}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  {#if activeTab === ADMIN_TABS.categories}
    <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h3 class="text-lg font-bold text-slate-900">Category management</h3>
        <button
          class="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
          type="button"
          onclick={() => (categoryModal = { open: true, mode: 'create', category: null })}
        >
          Add category
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-3 py-2">Name</th>
              <th class="px-3 py-2">Icon</th>
              <th class="px-3 py-2">Products</th>
              <th class="px-3 py-2">Updated</th>
              <th class="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#if $categoriesQuery.isPending}
              <tr>
                <td class="px-3 py-6 text-center text-slate-500" colspan="5">Loading categories...</td>
              </tr>
            {:else if categories.length === 0}
              <tr>
                <td class="px-3 py-6 text-center text-slate-500" colspan="5">No categories found.</td>
              </tr>
            {:else}
              {#each categories as category}
                <tr class="border-b border-slate-100">
                  <td class="px-3 py-2 font-semibold text-slate-900">{category.name}</td>
                  <td class="px-3 py-2 text-slate-600">{category.icon}</td>
                  <td class="px-3 py-2 text-slate-600">{category.productCount}</td>
                  <td class="px-3 py-2 text-slate-600">{formatDate(category.updatedAt)}</td>
                  <td class="px-3 py-2">
                    <div class="flex gap-2">
                      <button
                        class="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        type="button"
                        onclick={() => (categoryModal = { open: true, mode: 'edit', category })}
                      >
                        Edit
                      </button>
                      <button
                        class="rounded-md border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                        type="button"
                        onclick={() =>
                          requestConfirmation(
                            'Delete category',
                            `Delete ${category.name}?`,
                            async () => {
                              await $deleteCategoryMutation.mutateAsync(category._id);
                            }
                          )}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  {#if activeTab === ADMIN_TABS.users}
    <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div class="grid w-full gap-2 sm:max-w-xl sm:grid-cols-[2fr_1fr]">
          <input
            class="w-full rounded-xl border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
            bind:value={userSearch}
            type="text"
            placeholder="Search users"
          />
          <select
            class="w-full rounded-xl border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
            bind:value={userRoleFilter}
          >
            <option value="all">All roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          class="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
          type="button"
          onclick={() => (userModal = { open: true, mode: 'create', user: null })}
        >
          Add user
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-3 py-2">Email</th>
              <th class="px-3 py-2">Display name</th>
              <th class="px-3 py-2">Role</th>
              <th class="px-3 py-2">Created</th>
              <th class="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#if $usersQuery.isPending}
              <tr>
                <td class="px-3 py-6 text-center text-slate-500" colspan="5">Loading users...</td>
              </tr>
            {:else if users.length === 0}
              <tr>
                <td class="px-3 py-6 text-center text-slate-500" colspan="5">No users found.</td>
              </tr>
            {:else}
              {#each users as user}
                <tr class="border-b border-slate-100">
                  <td class="px-3 py-2 font-medium text-slate-900">{user.email}</td>
                  <td class="px-3 py-2 text-slate-600">{user.displayName ?? '-'}</td>
                  <td class="px-3 py-2 text-slate-600">{user.role}</td>
                  <td class="px-3 py-2 text-slate-600">{formatDate(user.createdAt)}</td>
                  <td class="px-3 py-2">
                    <div class="flex gap-2">
                      <button
                        class="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        type="button"
                        onclick={() => (userModal = { open: true, mode: 'edit', user })}
                      >
                        Edit
                      </button>
                      <button
                        class="rounded-md border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                        type="button"
                        onclick={() =>
                          requestConfirmation(
                            'Delete user',
                            `Delete ${user.email}?`,
                            async () => {
                              await $deleteUserMutation.mutateAsync(user._id);
                            }
                          )}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  {#if activeTab === ADMIN_TABS.orders}
    <div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 class="text-lg font-bold text-slate-900">Order management</h3>
          <p class="text-sm text-slate-500">Review all store orders and update fulfillment status.</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-3 py-2">Order</th>
              <th class="px-3 py-2">User</th>
              <th class="px-3 py-2">Items</th>
              <th class="px-3 py-2">Total</th>
              <th class="px-3 py-2">Created</th>
              <th class="px-3 py-2">Status</th>
              <th class="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#if $ordersQuery.isPending}
              <tr>
                <td class="px-3 py-6 text-center text-slate-500" colspan="7">Loading orders...</td>
              </tr>
            {:else if orders.length === 0}
              <tr>
                <td class="px-3 py-6 text-center text-slate-500" colspan="7">No orders found.</td>
              </tr>
            {:else}
              {#each orders as order}
                <tr class="border-b border-slate-100">
                  <td class="px-3 py-2 font-mono text-xs text-slate-700">#{order._id.slice(-8).toUpperCase()}</td>
                  <td class="px-3 py-2 text-slate-600">
                    <div>{order.email ?? '-'}</div>
                    <div class="font-mono text-[11px] text-slate-400">{order.userId}</div>
                  </td>
                  <td class="px-3 py-2 text-slate-600">
                    <div>{order.items.length} items</div>
                    <div class="text-xs text-slate-500">
                      {order.items.slice(0, 2).map((item) => item.name).join(', ')}
                      {order.items.length > 2 ? '...' : ''}
                    </div>
                  </td>
                  <td class="px-3 py-2 text-slate-600">{formatCurrency(order.total)}</td>
                  <td class="px-3 py-2 text-slate-600">{formatDate(order.createdAt)}</td>
                  <td class="px-3 py-2">
                    <select
                      class="w-full min-w-[150px] rounded-lg border-slate-300 text-sm focus:border-teal-600 focus:ring-teal-600"
                      value={getOrderDraftStatus(order)}
                      onchange={(event) => setOrderDraftStatus(order._id, (event.currentTarget as HTMLSelectElement).value)}
                    >
                      {#each orderStatusOptions as status}
                        <option value={status}>{status}</option>
                      {/each}
                    </select>
                  </td>
                  <td class="px-3 py-2">
                    <button
                      class="rounded-md bg-teal-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:bg-teal-300"
                      type="button"
                      onclick={() => saveOrderStatus(order)}
                      disabled={$updateOrderMutation.isPending}
                    >
                      {$updateOrderMutation.isPending ? 'Saving...' : 'Update'}
                    </button>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</section>

<Modal
  open={productModal.open}
  title={productModal.mode === 'create' ? 'Create product' : 'Edit product'}
  subtitle="Manage product information"
  onClose={closeProductModal}
>
  <ProductForm
    mode={productModal.mode}
    categories={categories}
    initialValue={productModal.product}
    submitting={isProductSubmitting}
    onCancel={closeProductModal}
    onSubmit={submitProduct}
  />
</Modal>

<Modal
  open={categoryModal.open}
  title={categoryModal.mode === 'create' ? 'Create category' : 'Edit category'}
  subtitle="Categories are used for filtering and reporting"
  onClose={closeCategoryModal}
>
  <CategoryForm
    mode={categoryModal.mode}
    initialValue={categoryModal.category}
    submitting={isCategorySubmitting}
    onCancel={closeCategoryModal}
    onSubmit={submitCategory}
  />
</Modal>

<Modal
  open={userModal.open}
  title={userModal.mode === 'create' ? 'Create user' : 'Edit user'}
  subtitle="Role checks still apply on the API side"
  onClose={closeUserModal}
>
  <UserForm
    mode={userModal.mode}
    initialValue={userModal.user}
    submitting={isUserSubmitting}
    onCancel={closeUserModal}
    onSubmit={submitUser}
  />
</Modal>

<ConfirmDialog
  open={confirmState.open}
  title={confirmState.title}
  message={confirmState.message}
  pending={confirmState.pending}
  onCancel={cancelConfirmation}
  onConfirm={runConfirmation}
  confirmText="Delete"
/>
