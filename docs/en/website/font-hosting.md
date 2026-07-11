---
title: Font hosting
description: "Self-hosted Google Fonts: source, fetching, upload, and required metadata."
---

# Font hosting

Realm does not load fonts directly from `fonts.googleapis.com` — Google Fonts is unreliable in mainland China. All font files are downloaded, the CSS is rewritten, and the assets are hosted on `cdn.arsvine.com/shared/fonts/`.

## Three families

| Family | Weights | Use |
|---|---|---|
| Dosis | 300 / 400 / 500 | HUD UI text (Latin) |
| Noto Sans SC | 300 / 400 / 500 / 700 | CJK body plus some bold |
| Noto Serif SC | 400 / 700 | MDX reading body (`--font-reading`) |

Noto Serif SC 500 is unused in practice and was removed from `data/site.ts`. The three families cover four weight values across unicode-range.

## Source of truth

```ts
// data/site.ts
fonts: {
  cdnPreconnect: [
    { href: 'https://cdn.arsvine.com', crossOrigin: 'anonymous' },
  ],
  googleStylesheet:
    'https://fonts.googleapis.com/css2?family=Dosis:wght@300;400;500&family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Serif+SC:wght@400;700&display=swap',
  cdnStylesheet: 'https://cdn.arsvine.com/shared/fonts/google-fonts.css',
}
```

- `cdnPreconnect` adds `<link rel="preconnect">` in `<head>` to shorten the TLS handshake
- `googleStylesheet` is the **input**, only consumed by `scripts/fetch-google-fonts.mjs`
- `cdnStylesheet` is the **output**, the actual CSS loaded by browsers

## Fetch script

```bash
node scripts/fetch-google-fonts.mjs
```

The script:

1. Fetches the Google CSS with a modern Chrome User-Agent
2. Downloads every `.woff2`
3. Rewrites each `url()` to `cdn.arsvine.com/shared/fonts/<family>/<file>`
4. Writes the staging tree to `public/_fonts-staging/`

`public/_fonts-staging/` is a temporary directory, gitignored, not version controlled.

## Upload and metadata

```bash
# Upload to cos://shared/fonts/ with coscli
# Do not run coscli config init; inject credentials via env:
COS_SECRET_ID=... COS_SECRET_KEY=... coscli cp -r public/_fonts-staging/ cos://shared/fonts/
```

Strict COS custom-header values:

| Object | Content-Type | Cache-Control |
|---|---|---|
| `google-fonts.css` | `text/css; charset=utf-8` | `public, max-age=86400, must-revalidate` |
| `*.woff2` | `font/woff2` | `public, max-age=31536000, immutable` |

The **Value** field holds only the value. Never paste `Cache-Control: public, ...` as a value. A wrong value produces `Cache-Control: Cache-Control: ...`, Firefox rejects the font, and Traditional Chinese characters occasionally render as tofu. This is `GOTCHAS.md` item 3.

## Verification

```bash
curl -I -H "Referer: https://arsvine.com/" https://cdn.arsvine.com/shared/fonts/google-fonts.css
```

Expect to see `Content-Type` and `Cache-Control` each appear once with the correct values.

## Variable font deduplication

Google Fonts returns multiple `@font-face` blocks for the same `.woff2` at different `font-weight` values. This is expected behavior for Variable Fonts — a single file covers a continuous `wght` axis. **Do not** rewrite `fetch-google-fonts.mjs` to force "one weight per file" (GOTCHAS.md item 4).
