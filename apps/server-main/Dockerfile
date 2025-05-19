# Base image
FROM node:20-alpine AS base
WORKDIR /app

COPY pnpm-lock.yaml package.json ./
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Production image
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./



CMD ["node", "dist/src/main"]
