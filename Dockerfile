FROM ghcr.io/puppeteer/puppeteer:24.32.0 as base

WORKDIR /app

USER root

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
COPY pnpm-lock.yaml .
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
