---
title: Protected posts
description: TOTP verification, signed cookies, and the static-prod invariant.
---

# Protected posts

Realm's "protected posts" are a class of MDX blog entries gated by TOTP. There is one core invariant:

> **Protected post body MDX must never appear in static products (SSG props or `_next/data/...` JSON).**

This invariant runs through configuration, the SSG phase, the client-side state machine, and the API behavior.

## Configuration

The external content index declares the access mode in the post metadata:

```json
{
  "access": { "mode": "totp", "group": "friends-a" }
}
```

Server-side env vars:

```dotenv
ACCESS_GRANT_SECRET=<long-random-string>
TOTP_GROUPS_JSON={"friends-a":{"current":"JBSWY3DPEHPK3PXP","period":30,"digits":6,"window":1}}
```

`TOTP_GROUPS_JSON` is a group → secret map: `current` is the base32 TOTP secret; `period` / `digits` / `window` describe parameters. `ACCESS_GRANT_SECRET` signs the HttpOnly access-grant cookie.

## The 7-step flow

1. **`getStaticProps` returns sanitized metadata plus `mdxSource: null`** for protected posts. The body is never in static props.
2. **The browser renders a loading shell** and starts the auth-probe effect.
3. **Probe `/api/grant-check?group=<group>`** to check for a valid cookie.
4. **Granted → fetch `/api/post-variant?slug=&locale=`** for the body MDX (cookie-validated).
5. **Not granted → user enters TOTP**; client POSTs to `/api/protected-verify`.
6. **Server verifies the TOTP** (via `lib/content/totp.ts`); on success, signs an HttpOnly cookie with `ACCESS_GRANT_SECRET` and writes it to the response.
7. **Client re-fetches `/api/post-variant`** to get the body. An unauthenticated direct GET to `/api/post-variant` returns `403`.

## State machine

`hooks/useBlogPostState.ts` + `lib/blog-post-state.ts` implement the state machine with these states (simplified):

- `idle` — initial
- `checking` — probing the grant
- `granted` — authorized, preparing to fetch the body
- `required` — TOTP verification required
- `loading` — fetching `/api/post-variant`
- `ready` — body is in place
- `error`

The `authResolved` action (both `granted` and `required` branches) **must** clear `activeRequestKey` and `loadingLocale`. Clearing only the `required` branch leaves stale keys; the next legitimate fetch gets incorrectly deduped and the page hangs. This is `GOTCHAS.md` item 9.

The probe `useEffect` must include `state.authState` in its dependency list. Otherwise switching protected posts within the same `access.group` leaves deps referentially unchanged and the effect does not re-run; auth checks stall. This is `GOTCHAS.md` item 8.

## Rate limiting

`/api/protected-verify` and `/api/revalidate*` use `enforceRateLimit()` from `lib/content/rate-limit.ts`, defaulting to 30 req / 60s per client key.

- With Upstash configured: distributed rate limiting across serverless instances (Vercel Marketplace Upstash integration auto-injects).
- Without Upstash: falls back to a process-local `Map`; only suitable for local dev and single-instance testing.

`getClientKey(req)` reads `X-Forwarded-For` first-segment when `TRUST_PROXY=1|true|yes`; otherwise it falls back to `req.socket.remoteAddress`.

## Invariant verification checklist

After deployment, run through these in order:

1. A public post renders normally.
2. A protected post does not show its body without authorization (TOTP input or empty body).
3. Directly fetch `https://arsvine.com/_next/data/<buildId>/<locale>/blog/<protected>.json` — the `body` field is `null` or empty.
4. Submit a valid TOTP code; the body loads.
5. Directly `curl /api/post-variant?slug=<protected>&locale=zh-CN` (no cookie) returns `403`.

Any failure of items 2, 3, or 5 means the SSG boundary was breached and a rollback is needed.
