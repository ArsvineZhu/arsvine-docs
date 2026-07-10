---
title: SEO & security
description: Site metadata, revalidate secret, TOTP, access cookie, remote image hosts, HTTP headers.
---

# SEO & security

## Site metadata

`data/site.ts` `siteConfig` is the single source of truth for SEO copy and social links. Changing it propagates to:

- HUD / Loading site name
- Contact email and click-to-copy
- About-page footer copyright
- `<title>` / `og:title` / `<meta description>` / `og:description`
- sitemap / RSS / robots base URL and titles
- Home-page typing signature (two lines: Russian and Chinese, from Zamyatin's "We")
- `og:image` / `twitter:image`
- Font external links and preconnect targets
- `<html lang>` / `og:locale` / RSS `<language>`
- `/content` and `/friends` page SEO and headings

`package.json` `name` / `author` / `description` are **not** in the import scope; template users must sync these by hand after cloning.

## `<html lang>` and `og:locale`

Switched per locale:

| Locale | `<html lang>` | `og:locale` | RSS `<language>` |
|---|---|---|---|
| `zh-CN` | `zh-Hans-CN` | `zh_CN` | `zh-CN` |
| `zh-TW` | `zh-Hant-TW` | `zh_TW` | `zh-TW` |
| `en` | `en-US` | `en_US` | `en-US` |

BCP-47 values come from `htmlLangMap`; Facebook-style underscore values come from `ogLocaleMap`. Mappings live in `i18n/config.ts`.

## Remote image host allowlist

Centralized in `config/image-hosts.js`:

- `cdn.arsvine.com` — self-hosted CDN (Tencent Cloud COS Hong Kong bucket)
- `placehold.co` — placeholders used by `data/*.ts`
- `images.unsplash.com` / `source.unsplash.com` — template samples

Add a domain only in this file. **Do not** copy the list into `next.config.js`.

## Protected posts

- `ACCESS_GRANT_SECRET` signs the HttpOnly access-grant cookie
- `TOTP_GROUPS_JSON` describes the group → secret map
- A protected post's `mdxSource` is `null` from SSG; the body only ships at runtime from `/api/post-variant`
- After deploy you must verify "the `_next/data/.../<slug>.json` for a protected post does not contain a body"

## Shared ISR secret

`REVALIDATE_SECRET` guards `/api/revalidate*`:

- `/api/revalidate` rebuilds `/<locale>/tweets` (GET or POST, secret in body or querystring)
- `/api/revalidate-content` rebuilds `/<locale>/content` and (optionally) `/<locale>/blog/<slug>` (POST only, rate-limited 30/min per client)
- `/api/revalidate-assets` rebuilds home, content, friends, work detail, and life detail paths (POST only, parallel, partial OK)

When `REVALIDATE_SECRET` is unset these endpoints are effectively disabled. All comparisons are `constantTimeEqual` to avoid timing side channels.

## Trust proxy

`TRUST_PROXY=1|true|yes` lets revalidate / protected-verify endpoints read the first segment of `X-Forwarded-For` as the rate-limit key; otherwise they use `req.socket.remoteAddress`. Production behind Vercel should set this.

## HTTP headers

`next.config.js` and `server.js` together declare:

- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`

Any new header must be declared in both places so it stays auditable.

## WAF and rate limiting

- Protected endpoints use `enforceRateLimit()` (Upstash or process-local `Map`)
- Vercel built-in WAF and rate limiting are configured at the Vercel project level
- DNSPod provides DNS protection; finer rules are best placed in Vercel

## Restricted content (never write into public docs)

- Any secret from `.env.local`
- GitHub Token / PAT
- COS `SecretId` / `SecretKey` / `SessionToken`
- TOTP secrets (base32 literals)
- Private bucket paths
- Real high-value resource maps
- Unpublished friend information
- Vercel / Tencent Cloud DNSPod screenshots containing sensitive fields
