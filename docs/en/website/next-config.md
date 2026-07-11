---
title: Next.js config
description: next.config.js detailed configuration: i18n, build, images, webpack.
---

# Next.js Config

`next.config.js` is the build configuration entry for Realm. This page documents its actual settings.

## i18n plugin

```js
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
```

`i18n/request.ts` is the next-intl 4 request config entry, loading `locales/<locale>.json` by locale.

## Build config

```js
distDir: process.env.NEXT_BUILD_DIR || '.next'
```

`NEXT_BUILD_DIR` lets deployment wrappers set a custom output directory. Do not set it during normal development.

## Allowed dev origins

```js
allowedDevOrigins: ['dev.arsvine.com', '127.0.0.1', 'localhost']
```

The dev server needs to be accessible via `dev.arsvine.com` (custom hosts) so that COS bucket Referer checks don't block image loading.

## Remote image allowlist

```js
images: { remotePatterns }   // from config/image-hosts.js
```

`remotePatterns` is centralized in `config/image-hosts.js`, not hard-coded in `next.config.js`. See `seo-and-security`.

## Bundle Analyzer

```js
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' });
```

Only enabled when `ANALYZE=true`. Output goes to `.next/analyze/`.

## Webpack

Disables cache on Windows production builds:

```js
if (process.platform === 'win32' && !dev) {
  config.cache = false;
}
```

Avoids webpack 5 cache serialization issues on Windows.

## File location

`arsvine-realm/next.config.js` — approximately 40 lines, containing all of the above.
