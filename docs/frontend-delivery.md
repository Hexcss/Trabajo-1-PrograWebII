# Frontend Delivery Notes

## Requirement coverage

1. Login screen: `apps/web/src/pages/login-page.svelte`
2. Protected SPA routes: route guard in `apps/web/src/app/app-root.svelte`
3. Products list/detail: `apps/web/src/pages/market-page.svelte`
4. Products CRUD (admin): `apps/web/src/pages/admin-page.svelte` + `features/products/product-form.svelte`
5. Categories CRUD (admin): `apps/web/src/pages/admin-page.svelte` + `features/categories/category-form.svelte`
6. Users CRUD (admin): `apps/web/src/pages/admin-page.svelte` + `features/users/user-form.svelte`
7. Role-aware UI: auth state + route checks in `features/auth/auth-session.svelte.ts` and `app-root.svelte`
8. Responsive/polished UI: Tailwind + motion-driven transitions

## Svelte runes traceability

`$state`

- Session state and notices: `apps/web/src/features/auth/auth-session.svelte.ts`
- Filters/modals/forms: `market-page.svelte`, `admin-page.svelte`, `product-form.svelte`, `user-form.svelte`

`$derived`

- Auth booleans and labels: `auth-session.svelte.ts`
- Navigation/button styles and computed collections: `app-shell.svelte`, `market-page.svelte`, `admin-page.svelte`

`$effect`

- Router bootstrap + guard redirects: `app-root.svelte`
- Query refetch synchronization to filter state: `market-page.svelte`, `admin-page.svelte`
- Profile/form synchronization: `profile-page.svelte`, feature form components

`$props`

- Reusable components/forms with explicit typed callback APIs:
  - `components/layout/app-shell.svelte`
  - `components/ui/modal.svelte`
  - `components/ui/confirm-dialog.svelte`
  - `features/products/product-form.svelte`
  - `features/categories/category-form.svelte`
  - `features/users/user-form.svelte`

## Query/mutation architecture

- Query client: `apps/web/src/query/client.ts`
- Query keys: `apps/web/src/query/keys.ts`
- API layer: `apps/web/src/services/*`
- Server state managed with `@tanstack/svelte-query` in page-level modules

## Session and refresh details

- HTTP client: `apps/web/src/services/http-client.ts`
- All requests use credentials for cookie-based auth.
- `401` responses trigger global unauthorized callback and frontend session cleanup.
- Backend refresh handling is transparent; frontend just retries through normal requests.

## Notes for demo

1. Start API and web app.
2. Login with existing backend users.
3. Navigate Store and Profile.
4. Login as admin and open Admin Console.
5. Demonstrate create/edit/delete in products, categories, and users tables.
