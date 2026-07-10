---
title: COS & CDN
description: Public and private bucket layouts, object key naming, version pointers, Cache-Control headers.
---

# COS & CDN

Media resources (self-hosted images, covers, galleries, fonts, decorations, audio) all live in the Tencent Cloud COS Hong Kong bucket `arsvine-cdn`, served through the self-hosted CDN domain `cdn.arsvine.com`.

## Buckets and permissions

- **Public bucket**: media resources
- **Private bucket**: versioned catalogs (`realm/catalog/**`) plus resources that require a signed access cookie
- Public bucket policy: public-read / private-write
- Private bucket policy: every read must be signed (access cookie)
- CORS: public bucket allows `https://arsvine.com` and its subdomains, plus `http://dev.arsvine.com` (local) for GET/HEAD
- Referer allowlist: `arsvine.com`, `*.arsvine.com` (localhost and empty Referer are rejected)

## Object keys

Object key structure and examples:

```text
public bucket:
  shared/fonts/<family>/<file>.woff2
  shared/fonts/google-fonts.css
  realm/images/YYYY/MM/DD/<name>.<hash8>.<ext>
  realm/audio/YYYY/MM/DD/<name>.<hash8>.<ext>
  realm/site-catalog/current.json
  realm/site-catalog/current.next.json
  realm/site-catalog/versions/<version>/assets.json

private bucket:
  realm/catalog/current.json
  realm/catalog/current.next.json
  realm/catalog/versions/<version>/
    home.json
    works.json
    collections.json
    links.json
    audio.json
    static-assets.json
```

`<hash8>` is the first 8 hex characters of the source file's SHA256, **embedded in the object key** (not only in the manifest). Same source always lands on the same object key, so `cos sync` can safely skip unchanged objects by etag.

`<version>` is the publish version stamp (UTC ISO without separators), e.g. `20260710T120000Z`.

## Version pointer

`current.json` is the active version pointer:

```json
{ "version": "20260710T120000Z" }
```

`current.next.json` is a pre-publish pointer written during the build; it is **not** flipped by the publish script. `cos sync` explicitly excludes both pointer files; `scripts/assets-publish.mjs` writes the real `current.json` in the last step with `cos cp` and `Cache-Control: no-cache, max-age=0, must-revalidate`.

The order is last-writer-wins:

1. Upload immutable objects (images, audio, shared fonts)
2. Upload the private catalog version directory
3. `ls` to verify both `assets.json` / `static-assets.json` exist
4. Write the public `current.json`
5. Write the private `current.json`
6. Call `/api/revalidate-assets` to trigger ISR

If any earlier step fails the pointer is not flipped.

## Cache-Control headers

| Class | Cache-Control |
|---|---|
| `*.woff2` | `public, max-age=31536000, immutable` |
| `google-fonts.css` | `public, max-age=86400, must-revalidate` |
| Images (hashed name) | `public, max-age=31536000, immutable` |
| Media catalog JSON | `public, max-age=300` |
| `current.json` (public / private) | `no-cache, max-age=0, must-revalidate` (public) / `no-store` (private) |
| Other private bucket objects | `no-store` |

## Client read paths

- Self-hosted images (`og:image`, post images, galleries): composed from `data/site.ts` `assets.ogImage` or a catalog `objectKey` to `https://cdn.arsvine.com/<key>`, then `next/image` with `unoptimized={true}`.
- Fonts: `styles/globals.scss` font variables (`--font-hud` etc.) bind to `https://cdn.arsvine.com/shared/fonts/google-fonts.css`.
- Media catalogs (home / works / collections / links / audio): at runtime the client calls `/api/assets/<section>`; the handler reads the private bucket `current.json` → the version directory's `<section>.json` → rewrites hashed object keys into full `https://cdn.arsvine.com/...` URLs.

## Critical invariants

- **Never hard-code COS object keys in code**. Every resource reference goes through the catalog.
- **Never write private bucket paths into public docs**. This page describes structure only, never instance names.
- **Never put `current.json` and catalog version directories in the same `cos sync`**. The former uses `cos cp` explicitly; the latter uses `cos sync` incrementally.
- **Local dev uses `dev.arsvine.com` + `scripts/dev-host-setup.cmd`** to solve the Referer check.
