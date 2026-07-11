---
title: Custom server
description: server.js responsibilities, startup flow, graceful shutdown.
---

# Custom Server

Realm uses a custom Node.js server `server.js` for both dev and production — it does **not** use `next dev` or `next start`. This page documents `server.js`'s actual behavior.

## Entry points

Three `package.json` commands go through `server.js`:

```bash
pnpm dev      # NODE_ENV=development node server.js
pnpm start    # cross-env NODE_ENV=production node server.js
pnpm build    # next build (this one does NOT go through server.js)
```

## server.js responsibilities

1. **Load environment variables**: `dotenv` reads `.env.local`
2. **Prepare Next.js instance**: `next({ dev: process.env.NODE_ENV !== 'production' })`
3. **Create HTTP server**: Node's native `http.createServer`
4. **Request handling**:
   - Parse the URL with `toParsedUrl(req)`
   - If the first path segment is `zh-CN` / `zh-TW` / `en`, write it to `query.locale` — backwards compatibility for code using `useRouter().query.locale`
   - Call `app.getRequestHandler()` for normal Next.js request handling
5. **Listen on `process.env.PORT`**, defaulting to 3000
6. **Graceful shutdown**: Listen for SIGTERM / SIGINT / SIGHUP, begin shutdown on signal, force-exit after 3 seconds

## About locale

`server.js` does **not** do locale selection — that is `proxy.ts`'s job. It only passes through the first URL segment as `query.locale`. This field is available in `getServerSideProps` and `useRouter().query` for backwards compatibility.

## Optional bypass

`server.js` has a commented-out bypass:

```js
if (parsedUrl.pathname.startsWith('/analytics/')) { ... }
```

This is reserved for a self-hosted analytics proxy. Currently unused. Enable it when needed — it runs in parallel with normal request handling.

## Why not next start

`next start` does not support:
- Custom `.env.local` loading order
- Request preprocessing (locale query passthrough)
- Self-hosted analytics proxy

These features aren't strictly required by Realm today, but `server.js` leaves room to extend them without an architecture change.

## Role in Vercel deployment

`server.js` does **not** run in Vercel deployments. Vercel uses Next.js serverless functions directly. The `Start Command: pnpm start` in the Vercel project settings only serves to declare the Node.js 24.x environment — the actual serverless runtime does not execute this command. Therefore:

- Custom server logic (locale query passthrough) has no effect on Vercel, but doesn't interfere either — `proxy.ts` already handles locale selection
- The Vercel project's Framework Preset must be set to **Other** (not Next.js), or the build may fail
