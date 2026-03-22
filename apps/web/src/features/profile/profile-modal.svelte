<script lang="ts">
  import { createMutation, createQuery } from '@tanstack/svelte-query';
  import type { OrdersListResponse, SessionUser, UploadFileResponse } from '@trabajo/types';
  import Modal from '@/components/ui/modal.svelte';
  import Icon from '@/components/ui/icon.svelte';
  import { authSession } from '@/features/auth/auth-session.svelte';
  import { appPreferences } from '@/features/preferences/app-preferences.svelte';
  import { getFriendlyError } from '@/features/auth/auth-errors';
  import { formatDate } from '@/lib/formatters';
  import { queryClient } from '@/query/client';
  import { queryKeys } from '@/query/keys';
  import { filesService } from '@/services/files.service';
  import { ordersService } from '@/services/orders.service';
  import { usersService } from '@/services/users.service';

  let { open, onClose } = $props<{ open: boolean; onClose: () => void }>();

  let displayName = $state('');
  let avatarUrl = $state('');
  let uploadError = $state('');
  let formError = $state('');
  let successMessage = $state('');
  let pickedFilename = $state('');

  const copy = $derived(
    appPreferences.language === 'es'
      ? {
          title: 'Perfil',
          subtitle: 'Gestiona tu cuenta y revisa tus pedidos',
          sectionProfile: 'Ajustes de usuario',
          sectionOrders: 'Mis pedidos',
          displayName: 'Nombre visible',
          email: 'Email',
          role: 'Rol',
          persistSession: 'Mantener caché rápida del perfil en este dispositivo',
          uploadAvatar: 'Subir foto',
          uploading: 'Subiendo...',
          save: 'Guardar cambios',
          saving: 'Guardando...',
          emptyOrders: 'Aún no tienes pedidos.',
          orderId: 'Pedido',
          orderItems: 'Artículos',
          orderStatus: 'Estado',
          orderTotal: 'Total',
          orderDate: 'Fecha',
          close: 'Cerrar',
        }
      : {
          title: 'Profile',
          subtitle: 'Manage account settings and your orders',
          sectionProfile: 'User settings',
          sectionOrders: 'My orders',
          displayName: 'Display name',
          email: 'Email',
          role: 'Role',
          persistSession: 'Keep quick profile cache on this device',
          uploadAvatar: 'Upload picture',
          uploading: 'Uploading...',
          save: 'Save changes',
          saving: 'Saving...',
          emptyOrders: 'You do not have any orders yet.',
          orderId: 'Order',
          orderItems: 'Items',
          orderStatus: 'Status',
          orderTotal: 'Total',
          orderDate: 'Date',
          close: 'Close',
        }
  );

  const ordersQuery = createQuery<OrdersListResponse>({
    queryKey: queryKeys.orders.mine({ page: 1, limit: 25 }),
    queryFn: () => ordersService.mine({ page: 1, limit: 25 }),
    enabled: false,
  });

  const uploadMutation = createMutation<UploadFileResponse, Error, File>({
    mutationFn: (file: File) => filesService.upload(file, 'avatars'),
    onSuccess: (result) => {
      avatarUrl = result.url;
      uploadError = '';
      successMessage = '';
    },
    onError: (error) => {
      uploadError = getFriendlyError(error, 'Could not upload image.');
    },
  });

  const updateMutation = createMutation<SessionUser, Error, void>({
    mutationFn: () =>
      usersService.updateMe({
        displayName: displayName.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      }),
    onSuccess: (updated) => {
      authSession.setSession(updated, {
        kind: 'success',
        text: appPreferences.language === 'es' ? 'Perfil actualizado.' : 'Profile updated.',
      });
      queryClient.setQueryData(queryKeys.auth.me(), updated);
      successMessage = appPreferences.language === 'es' ? 'Cambios guardados.' : 'Changes saved.';
      formError = '';
    },
    onError: (error) => {
      formError = getFriendlyError(error, appPreferences.language === 'es' ? 'No se pudo actualizar el perfil.' : 'Could not update profile.');
      successMessage = '';
    },
  });

  $effect(() => {
    if (!open) return;

    displayName = authSession.user?.displayName ?? '';
    avatarUrl = authSession.user?.avatarUrl ?? '';
    uploadError = '';
    formError = '';
    successMessage = '';
    pickedFilename = '';
  });

  $effect(() => {
    if (!open || !authSession.isAuthenticated) return;
    void $ordersQuery.refetch();
  });

  function togglePersistence(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    authSession.setPersistence(target.checked);
  }

  function uploadAvatar(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    pickedFilename = file.name;
    uploadError = '';
    $uploadMutation.mutate(file);
  }

  function submit(event: SubmitEvent) {
    event.preventDefault();
    formError = '';
    successMessage = '';
    $updateMutation.mutate();
  }

  function formatCurrency(value: number, currency?: string) {
    const locale = appPreferences.language === 'es' ? 'es-ES' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'EUR',
      maximumFractionDigits: 2,
    }).format(value);
  }
</script>

<Modal open={open} title={copy.title} subtitle={copy.subtitle} panelClass="max-w-5xl" onClose={onClose}>
  <div class="grid gap-6 md:grid-cols-[1fr_1.2fr]">
    <form class="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40" onsubmit={submit}>
      <h4 class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">{copy.sectionProfile}</h4>

      <div class="flex items-center gap-3">
        <div class="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-slate-200 text-lg font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
          {#if avatarUrl}
            <img alt={authSession.displayName} class="h-full w-full object-cover" src={avatarUrl} />
          {:else}
            {(authSession.displayName || 'U').slice(0, 1).toUpperCase()}
          {/if}
        </div>

        <label class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
          <Icon name="upload" size={15} />
          {$uploadMutation.isPending ? copy.uploading : copy.uploadAvatar}
          <input class="hidden" type="file" accept="image/*" onchange={uploadAvatar} />
        </label>
      </div>

      {#if pickedFilename}
        <p class="text-xs text-slate-500 dark:text-slate-400">{pickedFilename}</p>
      {/if}

      <label class="space-y-1">
        <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">{copy.displayName}</span>
        <input
          class="w-full rounded-xl border-slate-300 bg-white text-sm text-slate-900 focus:border-teal-600 focus:ring-teal-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          bind:value={displayName}
          type="text"
        />
      </label>

      <div class="space-y-1 rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
        <p class="font-semibold text-slate-500 dark:text-slate-400">{copy.email}</p>
        <p class="text-slate-800 dark:text-slate-100">{authSession.user?.email}</p>
      </div>

      <div class="space-y-1 rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
        <p class="font-semibold text-slate-500 dark:text-slate-400">{copy.role}</p>
        <p class="text-slate-800 dark:text-slate-100">{authSession.user?.role ?? '-'}</p>
      </div>

      <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input
          checked={authSession.persistProfile}
          class="rounded border-slate-300 text-teal-600 focus:ring-teal-600 dark:border-slate-600 dark:bg-slate-900"
          type="checkbox"
          onchange={togglePersistence}
        />
        {copy.persistSession}
      </label>

      {#if uploadError}
        <p class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
          {uploadError}
        </p>
      {/if}

      {#if formError}
        <p class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
          {formError}
        </p>
      {/if}

      {#if successMessage}
        <p class="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
          {successMessage}
        </p>
      {/if}

      <div class="flex items-center justify-end gap-2">
        <button
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          type="button"
          onclick={onClose}
        >
          {copy.close}
        </button>
        <button
          class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-500 dark:bg-teal-600 dark:hover:bg-teal-500"
          type="submit"
          disabled={$updateMutation.isPending || $uploadMutation.isPending}
        >
          {$updateMutation.isPending ? copy.saving : copy.save}
        </button>
      </div>
    </form>

    <section class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
      <div class="mb-3 flex items-center gap-2">
        <Icon className="text-slate-600 dark:text-slate-300" name="orders" />
        <h4 class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">{copy.sectionOrders}</h4>
      </div>

      {#if $ordersQuery.isPending}
        <div class="space-y-2">
          {#each Array.from({ length: 3 }) as _, index}
            <div class="h-16 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" aria-hidden="true"></div>
          {/each}
        </div>
      {:else if ($ordersQuery.data?.items?.length ?? 0) === 0}
        <p class="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300">
          {copy.emptyOrders}
        </p>
      {:else}
        <div class="max-h-[430px] space-y-3 overflow-auto pr-1">
          {#each $ordersQuery.data?.items ?? [] as order}
            <article class="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="font-semibold text-slate-900 dark:text-slate-100">{copy.orderId} #{order._id.slice(-6).toUpperCase()}</p>
                <span class="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                  {order.status ?? 'created'}
                </span>
              </div>

              <dl class="mt-2 grid gap-1 text-xs text-slate-600 dark:text-slate-300">
                <div class="flex justify-between gap-4">
                  <dt>{copy.orderDate}</dt>
                  <dd>{formatDate(order.createdAt)}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt>{copy.orderItems}</dt>
                  <dd>{order.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt>{copy.orderTotal}</dt>
                  <dd>{formatCurrency(order.total, order.currency)}</dd>
                </div>
              </dl>
            </article>
          {/each}
        </div>
      {/if}
    </section>
  </div>
</Modal>
