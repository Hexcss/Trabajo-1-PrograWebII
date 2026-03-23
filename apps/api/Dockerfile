########################################
# 1) Build API from monorepo root
########################################
FROM node:22-alpine AS builder

WORKDIR /workspace
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Workspace manifests (for cache-friendly install)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/types/package.json packages/types/package.json

RUN pnpm install --frozen-lockfile --filter ./apps/api...

# Source needed for the API build
COPY apps/api ./apps/api
COPY packages/types ./packages/types

RUN pnpm --dir apps/api build

########################################
# 2) Runtime image
########################################
FROM node:22-alpine AS runner

WORKDIR /workspace
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install production dependencies for API slice
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/types/package.json packages/types/package.json

RUN pnpm install --frozen-lockfile --prod --filter ./apps/api...

COPY --from=builder /workspace/apps/api/dist ./apps/api/dist

RUN addgroup -S app && adduser -S app -G app
USER app

WORKDIR /workspace/apps/api
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
