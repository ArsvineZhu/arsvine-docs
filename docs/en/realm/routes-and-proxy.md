---
title: Routes & proxy middleware
description: Route shape, the proxy.ts responsibilities, and how they relate to i18n/config.ts.
---

# Routes & the proxy middleware

## Route shape

Every user-visible page lives under `pages/[locale]/...`. The locale must be one of the entries in `i18n/config.ts` `locales` (`zh-CN` / `zh-TW` / `en`). URLs look like:

```text
/<locale>
/<locale>/content
/<locale>/works
/<locale>/web/<id>
/<locale>/life/<slug>
/<locale>/blog/<slug>
/<locale>/access/<group>
/<locale>/rss.xml
```

Bare paths (`/`, `/content`, `/web/3`, etc.) are 308-redirected to their locale-prefixed form by the `proxy.ts` middleware.

## proxy.ts

Next.js 16 renamed the middleware entry from `middleware.ts` to `proxy.ts`. The repo's `proxy.ts` does two things:

1. **Locale routing**: for bare paths, select a locale using `NEXT_LOCALE` cookie > `Accept-Language` > `zh-CN`, prefix `/<locale>/...` and respond 308.
2. **GEO_COUNTRY cookie**: write Vercel edge `geolocation(request).country` to the `GEO_COUNTRY` cookie with a 12-hour TTL. The client-side `_document` inline bootstrap script reads that cookie and writes `<html data-country>` to drive region-only UI micro-tuning (e.g. B 站).

### Bypass rules

`proxy.ts` skips these prefixes entirely so they do not enter i18n routing:

```text
/api, /_next, /_vercel, /favicon.ico, /apple-touch-icon.png,
/icons, /fonts, /images, /decor, /music, /robots.txt,
/sitemap.xml, /rss.xml
```

Any path with a file extension (`/\.[a-z0-9]+$/i`) is also bypassed. `pages/[locale]` routes never end with an extension, so the check is safe.

### Avoiding the `/en/fr/web/1` bug

To prevent "looks like a locale but is not supported" segments from being treated as a bare business path and pre-prefixed with a real locale, `proxy.ts` uses `LOOKS_LIKE_LOCALE = /^[a-z]{2}(-[A-Za-z]{2,4})?$/`. If the first segment matches (e.g. `/fr/web/1`), it is stripped before the selected locale is prepended, avoiding the broken `/en/fr/web/1` path.

### `?_geo=` debug override

`proxy.ts` accepts `?_geo=US` to temporarily override the country (writes to the cookie), and `?_geo=` to clear the override. This is for dev debugging and forced refreshes after switching VPN. It does not participate in any permission decision.

## i18n/config.ts

`i18n/config.ts` is the single source of truth for locale information:

| Field | Purpose |
|---|---|
| `locales` | UI locale tuple (`['zh-CN', 'zh-TW', 'en']`) |
| `defaultLocale` | Fallback target when a translation is missing; fixed at `zh-CN` |
| `htmlLangMap` | locale → `<html lang>` BCP-47 value (`zh-CN` → `zh-Hans-CN`) |
| `ogLocaleMap` | locale → `og:locale` (Facebook-style underscore) |
| `rssLanguageMap` | locale → RSS `<language>` field |
| `localeShortLabel` | locale → short label for LanguageSwitcher (`简中` / `繁中` / `ENG`) |
| `localeNativeName` | locale → full native name for LocaleFallbackBanner |

Helper functions `isLocale(value)`, `getLocaleFromPath(path)`, and `resolveLocale(rawLocale, path)` are shared by `proxy.ts` and `getStaticProps` on the page side.

When you change the `locales` array you must also update: the three `locales/<locale>.json` files; missing `data/<topic>/<locale>.ts` translations that should fall back to `defaultLocale`; `proxy.ts` locale detection; and sitemap / RSS / hreflang output.

## Locale resolution order (must be preserved)

```text
NEXT_LOCALE cookie > Accept-Language > zh-CN
```

Do not use IP / country to infer language. The `GEO_COUNTRY` cookie is for UI micro-tuning only; it must not participate in locale selection. This rule is explicitly flagged as "do not change" in `docs/GOTCHAS.md` item 19.
