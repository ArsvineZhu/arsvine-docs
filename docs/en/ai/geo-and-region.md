---
title: Geo & region
description: GEO_COUNTRY cookie, proxy.ts injection, region-only UI micro-tuning.
---

# Geo & region

Realm writes Vercel edge geo signals to a client-side cookie, driving region-only UI micro-tuning (e.g. B 站). **Not** used for language selection, permissions, or rate limiting.

## proxy.ts writes GEO_COUNTRY

```ts
// proxy.ts
const GEO_COOKIE = 'GEO_COUNTRY';
const GEO_COOKIE_MAX_AGE = 60 * 60 * 12; // 12h
const GEO_OVERRIDE_PARAM = '_geo';
```

Resolution order:

1. URL `?_geo=US` explicit override (dev debug / forced refresh after switching VPN)
   - `?_geo=` empty → clear the override
   - Anything other than two letters → ignored, treated as no override (but the cookie is still cleared)
2. Vercel edge `geolocation(request).country` (uppercase two letters)
3. Existing `GEO_COUNTRY` cookie (fallback)

Returns `{ country, overrideAction: 'set' | 'clear' | 'none' }`. `attachGeo()` writes the cookie accordingly:

- `set` with a different value → write 12 h
- `clear` → write `maxAge: 0` to delete
- `none` → leave alone

## Client-side read

The `_document` inline bootstrap script reads the cookie and writes `<html data-country="US">` (or the current two-letter code). It runs synchronously before hydration, so first-paint CSS can already branch on the attribute.

`lib/region-visibility.ts` is the unified helper:

```ts
import { isRegionVisible } from '@/lib/region-visibility';
isRegionVisible('BILIBILI_BLOCKED')  // returns boolean
```

B 站 embeds / friend links / contact channels all go through this helper, never reading `document.cookie` or `window` directly.

## Why not inject at SSR

An older version (recorded in a comment block) tried to inject country downstream via an `x-geo-country` request header during SSG/ISR. The Vercel CDN cache is shared across visitors, so the first visitor's country would taint the whole cache window, causing B 站 UI to drift to the wrong region.

The current approach uses country **only on the client**. SSG products carry no country signal; the client bootstrap reads the cookie and writes `<html>` attributes. Consequences:

- SSG cache is safe to share across visitors
- A single refresh reflects the new geo
- When client JS is disabled, region UI falls back to "show all" or "hide all" (decided by each helper); no drift

## Deployments outside Vercel

`@vercel/functions` `geolocation(request)` returns no data outside Vercel; the country is an empty string. In that case:

- The first request's `GEO_COUNTRY` cookie is empty
- `isRegionVisible()` returns its default (most permissive or most strict, per business rule)
- Subsequent requests use the cookie if still present

Non-Vercel deployments that need region data must replace `geolocation(request)` in `proxy.ts` with an equivalent source (CDN header, MaxMind GeoIP2, etc.) and adapt `lib/region-visibility.ts` accordingly.

## Security boundary

- `GEO_COUNTRY` cookie **does not** participate in any permission, rate-limit, or locale decision
- The `?_geo=` URL override only affects UI micro-tuning; it does not affect revalidate, TOTP, or access-grant
- `country` is always uppercase two letters or an empty string; no other format
