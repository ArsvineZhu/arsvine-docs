---
title: Server & build stack
description: server.js entry responsibilities, next.config.js configuration, build and start commands.
---

# Server & build stack

## server.js

`server.js` is the dev and production entry. `pnpm dev` and `pnpm start` both run this file, **not** `next dev` / `next start`.

Its actual responsibilities (simplified):

1. Load `.env.local`
2. Prepare Next.js (`next({ dev })`)
3. Create the HTTP server
4. For each request:
   - Parse with `toParsedUrl(req)`, writing the URL first segment (if it is `zh-CN` / `zh-TW` / `en`) to `query.locale` (backward compatible for older hooks)
   - Call `app.getRequestHandler()` and hand off to Next
5. Listen for SIGTERM / SIGINT / SIGHUP with a graceful shutdown (3 s force-exit fallback)
6. Listen on `process.env.PORT` (default 3000)

Note: `server.js` does **not** perform locale selection — that is `proxy.ts`'s job. `server.js` only passes the URL first segment as `query.locale` so older code can keep using `useRouter().query.locale`.

Optional bypass: an inline comment reserves a `if (parsedUrl.pathname.startsWith('/analytics/'))` block for a self-hosted analytics service proxy; enable only if needed.

## next.config.js

Key fields:

```js
distDir: process.env.NEXT_BUILD_DIR || '.next'
```

`NEXT_BUILD_DIR` lets a deployment wrapper specify a custom output directory; do not set it normally.

```js
allowedDevOrigins: ['dev.arsvine.com', '127.0.0.1', 'localhost']
```

In dev you must access the site via `dev.arsvine.com`; otherwise the COS bucket Referer check fails and images break.

```js
images: { remotePatterns }   // from config/image-hosts.js
```

`remotePatterns` is not declared here; it is centralized in `config/image-hosts.js`.

Webpack disables `config.cache` in Windows production builds (`config.cache = false`) to avoid webpack 5 + Windows cache serialization issues.

## i18n plugin

```js
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
```

`i18n/request.ts` is the next-intl 4 request config entry; it loads `locales/<locale>.json` per locale.

## Entry trio

```bash
pnpm dev        # node server.js (dev)
pnpm build      # next build (produces .next/)
pnpm start      # cross-env NODE_ENV=production node server.js
```

Vercel project settings:

| Item | Value |
|---|---|
| Framework Preset | Other (do **not** use Next.js) |
| Install Command | `pnpm install` |
| Build Command | `pnpm build` |
| Start Command | `pnpm start` |
| Node.js | 24.x |

## Sub-builders

`pnpm env:sync` runs `scripts/sync-env-files.mjs` to sync `.env.local` into `.env.example` (redacted). Both docs site and main site share the same `SECTIONS` list; add new env vars there.

`pnpm assets:prepare / build / publish` are the asset publishing pipeline (see `asset-pipeline`).
