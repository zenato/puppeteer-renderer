# Patched Node.js runtime. The puppeteer base image pins its own `node:24-bookworm`
# digest at release time, so it lags behind Node.js security releases: every image up
# to 25.16.0 still ships Node 24.21.0 or older, which is affected by the October 2026
# Node.js security release (CVE-2026-111497 Brotli decoder out-of-bounds write and
# nine others). Until the base image ships Node >= 24.22.1, the runtime binary is
# taken from the official patched image instead. See CLAUDE.md for when to remove it.
ARG NODE_PATCH_VERSION=24.22.1
FROM node:${NODE_PATCH_VERSION}-bookworm as node-patched

FROM ghcr.io/puppeteer/puppeteer:25.11.0 as base

WORKDIR /app

USER root

# Replace the base image's Node.js binary (and matching headers) with the patched build,
# and keep the inherited NODE_VERSION metadata in line with what is actually installed.
ARG NODE_PATCH_VERSION
COPY --from=node-patched /usr/local/bin/node /usr/local/bin/node
COPY --from=node-patched /usr/local/include/node /usr/local/include/node
ENV NODE_VERSION=${NODE_PATCH_VERSION}
RUN test "$(node --version)" = "v${NODE_PATCH_VERSION}"

RUN apt-get update && \
    apt-get install -y tini && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ARG SCOPE
ENV SCOPE=$SCOPE

ARG PACKAGE_CONTAINERS="apps packages"
ARG CLEANING_TARGETS="src test .turbo .eslintrc.* jest.config.* tsup.config.* tsconfig.*"

ARG PORT=3000
ENV PORT=$PORT
ENV CI=true

RUN npm install -g pnpm turbo

FROM base as pruner
# package.json is copied alongside the lockfile so that `pnpm fetch` sees the
# pnpm.overrides config (it is validated against the lockfile) and so that pnpm
# self-manages to the packageManager version the repo pins.
COPY pnpm-lock.yaml package.json ./
RUN pnpm fetch
ADD . .
RUN turbo prune --scope=$SCOPE --docker

FROM base as installer
COPY --from=pruner /app/out/full .
COPY --from=pruner /app/out/pnpm-lock.yaml .
RUN pnpm install -r

FROM base as builder
COPY --from=installer /app .
COPY --from=pruner /app/out/pnpm-workspace.yaml .
RUN pnpm run build --filter=$SCOPE

FROM base as runner
COPY --from=builder /app .
RUN pnpm install -r --prod --ignore-scripts
RUN for c in $PACKAGE_CONTAINERS; do \
    for t in $CLEANING_TARGETS; do \
    rm -rf ./$c/*/$t; \
    done; \
    done;
EXPOSE $PORT

RUN chown -R pptruser:pptruser /app
USER pptruser

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD pnpm --filter=$SCOPE run start
