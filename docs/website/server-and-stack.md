---
title: 服务器与构建栈
description: server.js 入口、构建命令、Vercel 项目设置。
---

# 服务器与构建栈

## 自定义服务器

Realm 在 dev 与 prod 都用 `server.js` 启动，**不是** `next dev` / `next start`。

`server.js` 加载 `.env.local`、准备 Next.js 实例、创建 HTTP 服务器、监听 `PORT`（默认 3000）。详见 [`custom-server`](/realm/custom-server)。

`proxy.ts` 是 Next.js 中间件（Next.js 16 把 `middleware.ts` 改名为 `proxy.ts`），负责 locale 路由选择与 GEO_COUNTRY cookie。详见 [`routes-and-proxy`](/realm/routes-and-proxy)。

## 构建命令

```bash
pnpm dev        # node server.js（dev）
pnpm build      # next build（产出 .next/）
pnpm start      # cross-env NODE_ENV=production node server.js
```

## Vercel 项目设置

| 项 | 值 |
|---|---|
| Framework Preset | Other（**不要**用 Next.js） |
| Install Command | `pnpm install` |
| Build Command | `pnpm build` |
| Start Command | `pnpm start` |
| Node.js | 24.x |

`server.js` 在 Vercel 部署中**不运行**——Vercel 使用 serverless 函数。Framework Preset 必须设为 Other，否则构建可能失败。

## 其他命令

```bash
pnpm lint          # eslint .
pnpm typecheck     # tsc --noEmit
pnpm test          # vitest run
pnpm check         # lint + typecheck + test + build
pnpm env:sync      # scripts/sync-env-files.mjs
```

## 详见

- [`next-config`](/website/next-config) — `next.config.js` 详细配置
- [`env-vars`](/website/env-vars) — 环境变量完整说明
- [`custom-server`](/realm/custom-server) — `server.js` 实现细节
