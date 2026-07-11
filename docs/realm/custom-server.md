---
title: 自定义服务器
description: server.js 的职责、启动流程、graceful shutdown。
---

# 自定义服务器

Realm 在 dev 与 prod 都用自定义 Node.js 服务 `server.js` 启动，**不是** `next dev` / `next start`。本节记录 `server.js` 的实际行为。

## 入口

`package.json` 的三个命令都走 `server.js`：

```bash
pnpm dev      # NODE_ENV=development node server.js
pnpm start    # cross-env NODE_ENV=production node server.js
pnpm build    # next build（这个不走 server.js）
```

## server.js 职责

1. **加载环境变量**：`dotenv` 读 `.env.local`
2. **准备 Next.js 实例**：`next({ dev: process.env.NODE_ENV !== 'production' })`
3. **创建 HTTP 服务器**：Node 原生 `http.createServer`
4. **请求处理**：
   - 对每个请求用 `toParsedUrl(req)` 解析 URL
   - 如果第一段是 `zh-CN` / `zh-TW` / `en`，写到 `query.locale`——向后兼容老代码中 `useRouter().query.locale` 的用法
   - 调用 `app.getRequestHandler()` 走 Next.js 正常请求处理
5. **监听 `process.env.PORT`**，默认 3000
6. **Graceful shutdown**：监听 SIGTERM / SIGINT / SIGHUP，收到信号后开始关闭，3 秒强制退出兜底

## 关于 locale

`server.js` **不做** locale 选择——那是 `proxy.ts` 的职责。`server.js` 只把 URL 第一段当 `query.locale` 透传。这个字段在 Pages Router 的 `getServerSideProps` 和 `useRouter().query` 中可用，帮助老代码兼容。

## 可选旁路

`server.js` 预留了一段注释掉的旁路逻辑：

```js
if (parsedUrl.pathname.startsWith('/analytics/')) { ... }
```

这段预留是为自托管分析服务代理准备的，当前未启用。按需开启即可，结构上与正常请求处理并行。

## 为什么不用 next start

`next start` 不支持：
- 自定义 `.env.local` 加载顺序
- 请求预处理（locale query 透传）
- 自托管分析服务代理

这些功能对 Realm 来说不是必须的，但 `server.js` 的存在允许在不改架构的前提下扩展这些能力。

## Vercel 部署中的角色

在 Vercel 部署中，`server.js` **不运行**。Vercel 直接使用 Next.js 的 serverless 函数。Vercel 项目设置的 `Start Command: pnpm start` 仅用于 Node.js 24.x 环境声明，实际的 serverless 运行时不执行此命令。因此：

- 自定义 server 逻辑（locale query 透传）在 Vercel 上不生效，但也不影响——`proxy.ts` 已处理 locale 选择
- Vercel 部署的 Framework Preset 必须设为 **Other**（不是 Next.js），否则构建可能失败
