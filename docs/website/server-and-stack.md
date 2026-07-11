---
title: 服务器与构建栈
description: server.js 入口职责、next.config.js 配置、构建与启动命令。
---

# 服务器与构建栈

## server.js

`server.js` 是 dev 与 prod 共用的入口。`pnpm dev` 与 `pnpm start` 都跑这个文件，**不是** `next dev` / `next start`。

它的实际职责（精简）：

1. 加载 `.env.local`
2. 准备 Next.js（`next({ dev })`）
3. 创建 HTTP server
4. 对每个请求：
   - 用 `toParsedUrl(req)` 解析，把 URL 第一段（如果是 `zh-CN` / `zh-TW` / `en`）写到 `query.locale`（向后兼容老 hook）
   - 调 `app.getRequestHandler()` 走 Next
5. 监听 SIGTERM / SIGINT / SIGHUP，graceful shutdown（3s 强制退出兜底）
6. 监听 `process.env.PORT`（默认 3000）

注意：`server.js` **不**做 locale 选择——那是 `proxy.ts` 的事。`server.js` 只把 URL 第一段当 `query.locale` 透传，方便老代码用 `useRouter().query.locale`。

可选旁路：预留了 `if (parsedUrl.pathname.startsWith('/analytics/'))` 形式的自托管分析服务代理注释，按需开启。

## next.config.js

关键字段：

```js
distDir: process.env.NEXT_BUILD_DIR || '.next'
```

`NEXT_BUILD_DIR` 允许部署包装器指定自定义输出目录，平时**不要**设。

```js
allowedDevOrigins: ['dev.arsvine.com', '127.0.0.1', 'localhost']
```

dev 期需要通过 `dev.arsvine.com`（自定义 hosts）访问，否则 COS 桶 Referer 不放行导致图裂。

```js
images: { remotePatterns }   // 来自 config/image-hosts.js
```

`remotePatterns` 不在这里写，集中在 `config/image-hosts.js`。

webpack 在 Windows 生产构建时关 cache（`config.cache = false`）——避免 webpack 5 + Windows 的 cache 序列化问题。

## i18n 插件

```js
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
```

`i18n/request.ts` 是 next-intl 4 的请求配置入口，按 locale 加载 `locales/<locale>.json`。

## 入口三件套

```bash
pnpm dev        # node server.js（dev）
pnpm build      # next build（产出 .next/）
pnpm start      # cross-env NODE_ENV=production node server.js
```

Vercel 项目侧：

| 项 | 值 |
|---|---|
| Framework Preset | Other（**不要**用 Next.js） |
| Install Command | `pnpm install` |
| Build Command | `pnpm build` |
| Start Command | `pnpm start` |
| Node.js | 24.x |

## 子构建器开关

`pnpm env:sync` 跑 `scripts/sync-env-files.mjs`，把 `.env.local` 同步到 `.env.example`（脱敏）。文档站 / 主站共用同一份 `SECTIONS` 列表，新增 env var 时改这里。

`pnpm assets:prepare / build / publish` 三个命令是资源发布流水线（详见 `asset-pipeline`）。
