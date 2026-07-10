---
title: Development
description: Local commands, COS Referer workflow, fonts, media, and pre-commit checks.
---

# Development

## Runtime

- Node.js: `24.x` (production and the Vercel project setting). `engines.node` in `package.json` is the source of truth.
- Package manager: pnpm (`packageManager: pnpm@11.7.0`).
- Framework: Pages Router. Do not switch to App Router.
- Server entry: `server.js` (used in dev and production). Do not use `next dev` / `next start`.

`server.js` loads `.env.local`, prepares Next, respects `PORT`, and handles graceful shutdown. `proxy.ts` is the locale middleware entry.

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`. `proxy.ts` will 308-redirect `/` to `/zh-CN` (depending on `NEXT_LOCALE` cookie and `Accept-Language`).

## Common commands

```bash
pnpm dev           # node server.js
pnpm build         # next build
pnpm start         # cross-env NODE_ENV=production node server.js
pnpm lint          # eslint .
pnpm typecheck     # tsc --noEmit
pnpm test          # vitest run
pnpm check         # lint + typecheck + test + build
```

Single tests:

```bash
pnpm vitest run lib/blog-client.test.ts
pnpm vitest run -t "reading time"
```

Vitest uses `jsdom` and matches `**/*.test.ts`. New tests live under `tests/<area>/` with the six areas `lib` / `components` / `hooks` / `i18n` / `pages` / `repo` (GOTCHAS.md item 27). Do not put `.test.ts` next to source files.

## Local COS Referer workflow

The `cdn.arsvine.com` bucket only allows Referer values matching `arsvine.com` / `*.arsvine.com`. Localhost and empty Referer are rejected.

To use real COS resources locally, the Windows helper handles hosts and proxy:

```powershell
scripts\dev-host-setup.cmd          # Full: UAC + hosts + dev server on port 80 + cleanup on exit
scripts\dev-host-setup.cmd -HostsOnly   # Just hosts; start dev manually with $env:PORT=80; pnpm dev
scripts\dev-host-setup.cmd -Remove      # Cleanup hosts / proxy
```

With `-HostsOnly`, open `http://dev.arsvine.com` in the browser; COS accepts the `dev.arsvine.com` Referer.

## Local COS workspace

`cos-workspace/` is a purely local working directory and **must** be gitignored.

```bash
pnpm assets:prepare      # Rewrite cos-workspace/public-root-legacy/ into cos-workspace/public-root/
pnpm assets:build        # Process images/audio; produce dist/cos-upload/{public,private}-root + dist/local-manifest/manifest.generated.json
pnpm assets:build -- --publish-current   # Also flip current.json to the new version (no current.next.json)
pnpm assets:publish      # Upload and trigger revalidate
pnpm assets:publish -- --dry-run
pnpm assets:publish -- --rollback 20260710T120000Z
pnpm assets:publish -- --force-full      # One-off full re-upload for emergencies
```

`pnpm assets:prepare` expects `cos-workspace/public-root-legacy/` to be a mirror of the current live public bucket. See `website/asset-pipeline` and `website/cos-and-cdn` for details.

## Data and copy editing

For routine content changes prefer these files, **not** hard-coded values in components:

```text
data/                 # Site metadata, projects, experience, life, skills, friend links, music
content/blog/init/    # Bundled fallback blog post
locales/              # next-intl UI strings
public/               # Static images, icons, local music test files
config/               # Small runtime config fragments, e.g. image hosts
```

When adding a locale, update all of these:

1. `i18n/config.ts` (locales plus each map and helper)
2. `locales/<locale>.json`
3. `data/<topic>/<locale>.ts` for every topic
4. `lib/i18n-data.ts` static registry
5. `proxy.ts` locale detection (if a new Accept-Language tag needs support)

## Remote image host allowlist

Centralized in `config/image-hosts.js`, following Next.js `images.remotePatterns` spec:

```js
{ protocol: 'https', hostname: 'cdn.arsvine.com', ... }
{ protocol: 'https', hostname: 'placehold.co', ... }
{ protocol: 'https', hostname: 'images.unsplash.com', ... }
```

Add or remove hosts only in this file. **Do not** duplicate the list in `next.config.js`.

Defaults and origins:

- `cdn.arsvine.com` — Tencent COS Hong Kong bucket `arsvine-cdn`, serving self-hosted media, covers, galleries, and assets
- `placehold.co` — placeholders used by `data/*.ts`
- `images.unsplash.com` / `source.unsplash.com` — template sample images

For large content images, prefer direct `cdn.arsvine.com` URLs with `next/image` and `unoptimized={true}` to avoid burning Vercel Hobby Image Optimization quota and to avoid unnecessary `/_next/image` proxy traffic.

## Font hosting

Realm self-hosts Google Fonts on `cdn.arsvine.com/shared/fonts/` rather than `fonts.googleapis.com`, because Google Fonts is unreliable in mainland China. Three families:

- `Dosis` 300 / 400 / 500 (HUD UI)
- `Noto Sans SC` 300 / 400 / 500 / 700 (CJK body plus some bold)
- `Noto Serif SC` 400 / 700 (MDX reading)

`data/site.ts` `fonts.googleStylesheet` is the source of truth. After changing it:

```bash
node scripts/fetch-google-fonts.mjs
# Then, per website/font-hosting, coscli upload public/_fonts-staging/ to cos://shared/fonts/
```

Strict COS metadata:

| Object | Content-Type | Cache-Control |
|---|---|---|
| `google-fonts.css` | `text/css; charset=utf-8` | `public, max-age=86400, must-revalidate` |
| `*.woff2` | `font/woff2` | `public, max-age=31536000, immutable` |

The COS custom header **Value** field must hold only the value, never `Cache-Control: ...`. A wrong value produces `Cache-Control: Cache-Control: ...`, Firefox rejects the font, and Traditional Chinese characters occasionally render as tofu. This is `GOTCHAS.md` item 3.

## Before committing

At minimum:

```bash
pnpm check
```

For UI / interaction changes, also manually verify:

- Desktop and mobile layout
- Home → content → detail transitions
- Public and protected blog posts
- Mobile hash navigation to content sections
- Music player open / close / track switching
- Custom cursor hover labels and BACK state
- CJK and accented Latin character rendering
