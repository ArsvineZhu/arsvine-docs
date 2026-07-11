---
title: Next.js 配置
description: next.config.js 的详细配置说明：i18n、构建、图片、webpack。
---

# Next.js 配置

`next.config.js` 是 Realm 主站的构建配置入口。本节记录它的实际配置项。

## i18n 插件

```js
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
```

`i18n/request.ts` 是 next-intl 4 的请求配置入口，按 locale 加载 `locales/<locale>.json`。

## 构建配置

```js
distDir: process.env.NEXT_BUILD_DIR || '.next'
```

`NEXT_BUILD_DIR` 允许部署包装器指定自定义输出目录。平时**不要**设。

## 允许的 dev 来源

```js
allowedDevOrigins: ['dev.arsvine.com', '127.0.0.1', 'localhost']
```

dev 期需要通过 `dev.arsvine.com`（自定义 hosts）访问，否则 COS 桶 Referer 不放行导致图片加载失败。

## 远端图片白名单

```js
images: { remotePatterns }   // 来自 config/image-hosts.js
```

`remotePatterns` 集中在 `config/image-hosts.js`，不在 `next.config.js` 里写死。详见 `seo-and-security`。

## Bundle Analyzer

```js
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' });
```

仅在 `ANALYZE=true` 时启用。分析产物输出到 `.next/analyze/`。

## Webpack

Windows 生产构建时关闭缓存：

```js
if (process.platform === 'win32' && !dev) {
  config.cache = false;
}
```

避免 webpack 5 + Windows 的缓存序列化问题。

## 完整文件路径

`arsvine-realm/next.config.js` — 约 40 行，包含上述全部配置。
