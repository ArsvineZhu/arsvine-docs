---
title: API 端点
description: pages/api/* 下 13 个路由的目的、请求 / 响应、安全边界。
---

# API 端点

`pages/api/*` 下 13 个 handler，按职责分四组。本节记录每个端点的实际行为，不是按文件结构复述。

## 1. 受保护博文相关

### `GET /api/grant-check?group=<group>`

读签名 cookie，验证 `group` 是否已被授权。返回 `{ granted: boolean }`。无 cookie 或签名失效 → `granted: false`。

### `POST /api/protected-verify`

接收 `{ group, code }`，验证 TOTP，通过后用 `ACCESS_GRANT_SECRET` 签名 HttpOnly cookie 写回。受 `enforceRateLimit()` 限流（默认 30/min per client key）。

### `GET /api/post-variant?slug=&locale=`

返回指定 slug / locale 的 MDX 序列化结果。**受保护博文的 variant fetch 必须有有效 grant cookie**，否则返回 `403`。这个端点是 SSG `mdxSource: null` 的对端——所有运行时正文都从这里出。

## 2. Tweet 归档

### `GET /api/tweet-months?offset=&limit=`

从外部 GitHub 内容仓库的 `tweets/index.json` 读月份索引，分页返回。仓库未配置时返回空数组；dev 模式 `TWEETS_STRESS_TEST=1` 下返回合成数据。

## 3. 资源目录

### `GET /api/assets/home`
### `GET /api/assets/works`
### `GET /api/assets/collections/[slug]`
### `GET /api/assets/links`
### `GET /api/assets/audio`

这五个端点从私有 COS 桶的 `realm/catalog/current.json` 读取当前活跃版本号，再读对应 `realm/catalog/versions/<version>/<section>.json`，把 hashed object key 解析为可用的 `https://cdn.arsvine.com/...` URL 返回给客户端。详见 `website/cos-and-cdn`。

## 4. ISR / 缓存重建

### `POST /api/revalidate`

重建 `/<locale>/tweets` 全部 locale。`REVALIDATE_SECRET` 通过请求体或 querystring 提供（向后兼容 GET+POST）。受 `enforceRateLimit()` 限流。失败时返回 `500 { message }`，**不**回显内部错误文本。

### `POST /api/revalidate-content`

重建 `/<locale>/content` 全部 locale；如果请求体里 `slug` 字段匹配 `^[a-z0-9]+(?:-[a-z0-9]+)*$`，还会重建 `/<locale>/blog/<slug>`。受速率限制。blog 路径如果 SSG 没建过，try/catch 吃掉错误放进 `skipped: string[]`，不阻断整体响应。

### `POST /api/revalidate-assets`

重建受 COS 资源版本影响的页面：`/{locale}`、`/{locale}/content`、`/{locale}/friends`、所有 `/<locale>/web/<id>`、所有 `/<locale>/life/<id>`。`Promise.allSettled` 并行处理；部分失败时 server 端 `console.error` 记录失败路径与 reason，响应 200 `{ partial: true, failed }`；全部失败时 500。`scripts/assets-publish.mjs` 在 publish 完资源版本后调用这里。

## 5. 其他

### `GET /api/hitokoto`

服务端代理 `v1.hitokoto.cn`，带回超时与缓存。供首页 typing signature 的随机一句话源。

## 安全与限流的统一规则

- 任何走 `enforceRateLimit()` 的端点都尊重 `TRUST_PROXY` 读取客户端 key。
- 任何走 `REVALIDATE_SECRET` 的端点都用常量时间比较（`constantTimeEqual`）防止时序侧信道。
- 任何回写 cookie 的端点都用 `httpOnly: true`、`sameSite: 'lax'`。
- 任何 `try/catch` 都不向响应体回显原始错误；细节只写 `console.error`。

## 通用响应体

```ts
// 成功
{ revalidated: true, paths: string[] }
// revalidate-content 还可能带 skipped
{ revalidated: true, paths: string[], skipped?: string[] }
// 部分失败
{ revalidated: false, paths: string[], failed: string[], partial: true }
// 全部失败
{ revalidated: false, paths: string[], failed: string[], message: '...' }
// 限流
{ message: 'Too many requests' }   // 带 Retry-After
// 鉴权
{ message: 'Invalid token' }      // 401
// 不支持的 method
{ message: 'Method not allowed' }  // 405 + Allow header
```

`scripts/assets-publish.mjs` 的 revalidate 步骤把 `200 + partial` 当作警告，5xx 才是 fatal。
