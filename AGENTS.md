# AI Agent Development Instructions

This document contains guidelines that AI agents must follow when developing this project.

## Prerequisites

Before writing code, make sure to review the following documents:

- For general project information and guidelines, refer to **[README.md](README.md)**.
- For code style and guidelines, refer to **[CONTRIBUTING.md](CONTRIBUTING.md)**.
- For commit and PR conventions, refer to **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## Development Guidelines

### Required Commands

- Lint check: `pnpm lint`
- Type check: `pnpm typecheck` (if typecheck command exists)
- Build: `pnpm build`
- Test: `pnpm test`

### Keep the Docker base image in sync with `puppeteer`

The `Dockerfile` base image `ghcr.io/puppeteer/puppeteer:<version>` pre-bakes the exact
Chrome and `chrome-headless-shell` build that its `puppeteer` version requires. If the
`puppeteer` dependency and the base image tag drift apart, the container starts with the
wrong Chrome and fails at runtime with `Could not find Chrome (ver. ...)`.

When changing the `puppeteer` version in `packages/puppeteer-renderer/package.json`:

- Update the `Dockerfile` `FROM ghcr.io/puppeteer/puppeteer:<version>` tag to the **exact
  same version**.
- Keep the `puppeteer` dependency pinned to an exact version (no `^` caret) so the two
  cannot silently diverge.
