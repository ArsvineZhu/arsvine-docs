---
title: Server & build stack
description: server.js entry, build commands, Vercel project settings.
---

# Server & Build Stack

## Custom server

Realm uses `server.js` for both dev and production — **not** `next dev` / `next start`.

`server.js` loads `.env.local`, prepares the Next.js instance, creates the HTTP server, and listens on `PORT` (default 3000). See [`custom-server`](/en/realm/custom-server).

`proxy.ts` is the Next.js middleware (Next.js 16 renamed `middleware.ts` to `proxy.ts`), handling locale routing and the `GEO_COUNTRY` cookie. See [`routes-and-proxy`](/en/realm/routes-and-proxy).

## Build commands

```bash
pnpm dev        # node server.js (dev)
pnpm build      # next build (outputs .next/)
pnpm start      # cross-env NODE_ENV=production node server.js
```

## Vercel project settings

| Setting | Value |
|---|---|
| Framework Preset | Other (**do not** use Next.js) |
| Install Command | `pnpm install` |
| Build Command | `pnpm build` |
| Start Command | `pnpm start` |
| Node.js | 24.x |

`server.js` does **not** run in Vercel deployments — Vercel uses serverless functions. The Framework Preset must be set to Other, or the build may fail.

## Other commands

```bash
pnpm lint          # eslint .
pnpm typecheck     # tsc --noEmit
pnpm test          # vitest run
pnpm check         # lint + typecheck + test + build
pnpm env:sync      # scripts/sync-env-files.mjs
```

## See also

- [`next-config`](/en/website/next-config) — `next.config.js` detailed configuration
- [`env-vars`](/en/website/env-vars) — full environment variable documentation
- [`custom-server`](/en/realm/custom-server) — `server.js` implementation details
