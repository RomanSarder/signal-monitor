FROM node:22-alpine AS builder

# dumb-init is a minimal PID-1 init system for containers.
# Without it Node.js runs as PID 1 and does NOT forward signals (SIGTERM, SIGINT)
# to its children, making graceful shutdown impossible. dumb-init:
#   1. Reaps zombie child processes (Node can spawn them via worker_threads / child_process)
#   2. Forwards OS signals to the Node process so our shutdown handlers fire
# We install it in builder so it's available to copy to release.
RUN apk add --no-cache dumb-init

# Principle of least privilege: the build process does not need root access.
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

WORKDIR /app

COPY package.json package-lock.json ./

# Copy each workspace package's manifest so npm ci can set up the full workspace.
# We do NOT copy the whole workspace yet — just the package.json files.
COPY backend/package.json ./backend/
COPY packages/shared/package.json ./packages/shared/

RUN npm ci

COPY packages/shared/ ./packages/shared/

COPY backend/src/ ./backend/src/
COPY backend/tsconfig.json ./backend/

# Build the shared package FIRST.
# Why: backend/tsconfig.json has a path alias "@signal-monitor/shared" that
# TypeScript resolves to ../packages/shared/src/index.ts. The shared package's
# package.json exports point to ./dist/index.js — that file must exist before
# Node can require it at runtime.
RUN npm run build --workspace=packages/shared

# Compile the backend TypeScript.
# tsconfig outDir is "dist" (relative to backend/), but because the tsconfig's
# paths include ../packages/shared (outside the project root), TypeScript infers
# rootDir as the monorepo root and mirrors the full path in the output:
#   backend/src/server.ts  →  backend/dist/backend/src/server.js
# This is expected behaviour; the start:prod script accounts for it.
RUN npm run build:ts --workspace=backend

RUN npm prune --omit=dev

FROM node:22-alpine AS release

RUN apk add --no-cache dumb-init

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

WORKDIR /app

COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

COPY --from=builder --chown=nodejs:nodejs /app/backend/dist ./backend/dist

# Copy the compiled shared package directory.
# node_modules/@signal-monitor/shared is an npm workspace symlink pointing to
# ../../packages/shared. For Node to resolve that symlink at runtime, the actual
# packages/shared directory (with its compiled dist/) must exist on the filesystem.
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared ./packages/shared

ENV NODE_ENV=production

ENV NODE_OPTIONS="--enable-source-maps"

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]

# Run Node directly (not via npm or fastify-cli) for three reasons:
#   1. npm adds a wrapper process — SIGTERM must cross a process boundary and is
#      frequently dropped, preventing graceful shutdown
#   2. fastify-cli (fastify start) adds startup overhead and its own signal handling
#      that conflicts with our handlers in server.ts
#   3. Direct node is the official Fastify production recommendation
#
CMD ["node", "backend/dist/backend/src/server.js"]
