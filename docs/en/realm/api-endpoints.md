---
title: API endpoints
description: "The 13 routes under pages/api/*: purpose, request/response, security boundaries."
---

# API endpoints

There are 13 handlers under `pages/api/*`, grouped into four categories. This page records the actual behavior of each endpoint, not just the file structure.

## 1. Protected-post related

### `GET /api/grant-check?group=<group>`

Reads the signed cookie and checks whether `group` has been authorized. Returns `{ granted: boolean }`. No cookie or invalid signature → `granted: false`.

### `POST /api/protected-verify`

Accepts `{ group, code }`, verifies the TOTP, and on success signs an HttpOnly cookie with `ACCESS_GRANT_SECRET` and writes it to the response. Rate-limited via `enforceRateLimit()` (default 30/min per client key).

### `GET /api/post-variant?slug=&locale=`

Returns the serialized MDX for the given slug / locale. **Protected post variant fetches must have a valid grant cookie**; otherwise this returns `403`. This is the counterpart of SSG `mdxSource: null` — all runtime body content comes from here.

## 2. Tweet archive

### `GET /api/tweet-months?offset=&limit=`

Reads the month index from the external repo's `tweets/index.json` and returns a paginated slice. When the repo is not configured, returns an empty array. In dev with `TWEETS_STRESS_TEST=1` returns synthetic data.

## 3. Asset catalogs

### `GET /api/assets/home`
### `GET /api/assets/works`
### `GET /api/assets/collections/[slug]`
### `GET /api/assets/links`
### `GET /api/assets/audio`

These five endpoints read the active version from the private COS bucket's `realm/catalog/current.json`, then read the corresponding `realm/catalog/versions/<version>/<section>.json`, and rewrite hashed object keys to full `https://cdn.arsvine.com/...` URLs. See `website/cos-and-cdn`.

## 4. ISR / cache invalidation

### `POST /api/revalidate`

Rebuilds `/<locale>/tweets` for all locales. `REVALIDATE_SECRET` can be supplied via request body or querystring (backward compatible with GET and POST). Rate-limited via `enforceRateLimit()`. On failure returns `500 { message }` and **does not** echo internal error text.

### `POST /api/revalidate-content`

Rebuilds `/<locale>/content` for all locales; if the request body's `slug` field matches `^[a-z0-9]+(?:-[a-z0-9]+)*$`, also rebuilds `/<locale>/blog/<slug>`. Rate-limited. If a blog path was never SSG'd, the `try/catch` swallows the error and adds it to `skipped: string[]` without aborting the whole response.

### `POST /api/revalidate-assets`

Rebuilds the pages affected by a COS asset version bump: `/{locale}`, `/{locale}/content`, `/{locale}/friends`, every `/<locale>/web/<id>`, and every `/<locale>/life/<id>`. `Promise.allSettled` runs them in parallel. On partial failure the server logs `console.error` with the failing path and reason, and responds `200 { partial: true, failed }`. When **all** paths fail it returns `500`. `scripts/assets-publish.mjs` calls this endpoint after uploading a new resource version.

## 5. Other

### `GET /api/hitokoto`

Server-side proxy for `v1.hitokoto.cn`, with timeout and cache. Provides the random one-liner source for the home page typing signature.

## Security and rate limiting rules

- Any endpoint that uses `enforceRateLimit()` respects `TRUST_PROXY` for client key resolution.
- Any endpoint that checks `REVALIDATE_SECRET` uses constant-time comparison (`constantTimeEqual`) to avoid timing side channels.
- Any endpoint that writes a cookie sets `httpOnly: true` and `sameSite: 'lax'`.
- `try/catch` blocks never echo the raw error to the response body; details are only written to `console.error`.

## Common response shapes

```ts
// Success
{ revalidated: true, paths: string[] }
// revalidate-content may also include skipped
{ revalidated: true, paths: string[], skipped?: string[] }
// Partial failure
{ revalidated: false, paths: string[], failed: string[], partial: true }
// All-failure
{ revalidated: false, paths: string[], failed: string[], message: '...' }
// Rate limited
{ message: 'Too many requests' }   // with Retry-After
// Auth failure
{ message: 'Invalid token' }      // 401
// Method not allowed
{ message: 'Method not allowed' }  // 405 with Allow header
```

`scripts/assets-publish.mjs` treats `200 + partial` as a warning; only 5xx is fatal.
