# Trabajo 1 - PrograWeb II

Monorepo with a reused NestJS backend and a new Svelte 5 frontend for the assignment.

## Workspace structure

- `apps/api`: existing JWT backend (NestJS + MongoDB)
- `apps/web`: Svelte 5 SPA frontend (Vite + Tailwind + svelte-motion + TanStack Query)
- `packages/types`: shared DTO/domain/API contract types
- `packages/infrastructure`: reserved for Terraform/infrastructure concerns
- `docs`: delivery-oriented documentation

## Prerequisites

- Node.js 20+
- pnpm 10+
- Running MongoDB for backend
- Backend `.env` configured inside `apps/api`

## Install

```bash
pnpm install
```

## Run

Terminal 1 (API):

```bash
pnpm --dir apps/api start:dev
```

Terminal 2 (Web):

```bash
pnpm dev:web
```

Frontend default URL: `http://localhost:5173`

## Frontend environment variables

`apps/web/.env`

- `VITE_API_URL`: backend base URL (default expected `http://localhost:3000`)

Example:

```bash
cp apps/web/.env.example apps/web/.env
```

## Build and check

```bash
pnpm check:web
pnpm build:web
```

## Backend endpoints consumed by frontend

Auth/session:

- `POST /auth/login`
- `POST /auth/logout`
- `GET /users/me`

Products:

- `GET /products`
- `GET /products/top`
- `GET /products/:id`
- `POST /products` (admin)
- `PUT /products/:id` (admin)
- `DELETE /products/:id` (admin)

Categories:

- `GET /categories`
- `POST /categories` (admin)
- `PUT /categories/:id` (admin)
- `DELETE /categories/:id` (admin)

Users:

- `GET /users` (admin)
- `POST /users` (admin)
- `PATCH /users/:id` (admin)
- `DELETE /users/:id` (admin)
- `PATCH /users/me`

## Auth and session flow

- Backend stores JWT access/refresh in HTTP-only cookies.
- Frontend always uses `credentials: 'include'`.
- Access-token expiration is transparently refreshed by backend guard using refresh cookie.
- Frontend subscribes to `401` responses and forces clean logout + redirect.
- Optional profile-cache persistence is handled in frontend localStorage (not token storage).

## Role behavior in UI

- `user`: login, market, profile
- `admin`: all `user` capabilities + admin console (`products`, `categories`, `users` CRUD)

## Rune usage map

- `$state`: page/filter/modal/form/session state (for example `market-page.svelte`, `admin-page.svelte`, `auth-session.svelte.ts`)
- `$derived`: computed flags and render-ready values (`isAdmin`, filtered lists, tab style, pagination values)
- `$effect`: router/auth guards, query refetch sync on filters, storage/session synchronization
- `$props`: typed component APIs in reusable components/forms/layout

## Optional features implemented

- session profile persistence toggle
- role-restricted admin area
- animated UI transitions with `svelte-motion`
- search/sort/filter in market and admin tables
- modal-based create/edit/delete flows with confirmation dialogs

## Shared types

All frontend runtime contracts are centralized under `packages/types/src` and consumed via `@trabajo/types`.
