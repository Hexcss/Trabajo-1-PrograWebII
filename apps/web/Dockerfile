########################################
# 1) Build web app from monorepo root
########################################
FROM node:22-alpine AS builder

WORKDIR /workspace
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

ARG API_URL
ENV VITE_API_URL=${API_URL}

# Workspace manifests (for cache-friendly install)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/types/package.json packages/types/package.json

RUN pnpm install --frozen-lockfile --filter @trabajo/web...

# Source needed for the web build
COPY apps/web ./apps/web
COPY packages/types ./packages/types

RUN pnpm --filter @trabajo/web build

########################################
# 2) Production Nginx static server
########################################
FROM nginx:stable-alpine AS runner

# Remove default nginx site
RUN rm /etc/nginx/conf.d/default.conf

# Custom nginx config from monorepo path
COPY apps/web/nginx.conf /etc/nginx/nginx.conf

# Copy static build output
COPY --from=builder /workspace/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
