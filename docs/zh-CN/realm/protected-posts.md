---
title: 受保护博文
description: TOTP 验证 + 签名 cookie + 静态产物保护不变式的完整流程。
---

# 受保护博文

Realm 的「受保护博文」是一类被 TOTP 门禁的 MDX 博客文章。它的核心不变式只有一句话：

> **受保护博文的正文 MDX 绝不能出现在静态产物（SSG props 或 `_next/data/...` JSON）里。**

这条不变式贯穿配置、SSG 阶段、客户端 state machine、API 行为。

## 配置

外部 content index 在博客条目的 metadata 里声明访问模式：

```json
{
  "access": { "mode": "totp", "group": "friends-a" }
}
```

服务端环境变量：

```dotenv
ACCESS_GRANT_SECRET=<long-random-string>
TOTP_GROUPS_JSON={"friends-a":{"current":"JBSWY3DPEHPK3PXP","period":30,"digits":6,"window":1}}
```

`TOTP_GROUPS_JSON` 是 group → 密钥映射：`current` 是 base32 TOTP 密钥，`period` / `digits` / `window` 描述参数。`ACCESS_GRANT_SECRET` 用来签发 HttpOnly access-grant cookie。

## 7 步流程

1. **`getStaticProps` 返回 sanitized 元数据 + `mdxSource: null`**。对受保护博文，正文永远不在静态 props 里。
2. **浏览器渲染 loading shell**，启动 auth-probe effect。
3. **探测 `/api/grant-check?group=<group>`**，看是否已有有效 cookie。
4. **已授权 → 直接走 `/api/post-variant?slug=&locale=`** 拿正文 MDX（已签名 cookie 验证）。
5. **未授权 → 用户输入 TOTP**，客户端 POST `/api/protected-verify`。
6. **服务器验证 TOTP**（`lib/content/totp.ts`），通过后用 `ACCESS_GRANT_SECRET` 签名 HttpOnly cookie 写回响应。
7. **客户端再调 `/api/post-variant`** 拿正文。未授权直接 GET `/api/post-variant` 返回 `403`。

## 状态机

`hooks/useBlogPostState.ts` + `lib/blog-post-state.ts` 组合实现 state machine，包含这些状态（精简）：

- `idle` — 初始
- `checking` — 正在探测 grant
- `granted` — 已授权，准备 fetch 正文
- `required` — 需要 TOTP 验证
- `loading` — 正在 fetch `/api/post-variant`
- `ready` — 正文就绪
- `error`

`authResolved` action（granted 与 required 两条分支）**都必须**清掉 `activeRequestKey` 和 `loadingLocale`。只清 required 分支会留下 stale key，下一次合法 fetch 会被错误地 dedup，页面卡死。GOTCHAS.md 第 9 条是这条。

`useEffect` 的依赖列表必须包含 `state.authState`，否则在同 group 内切换受保护博文时，依赖引用没变，effect 不重跑，auth 检查卡住。GOTCHAS.md 第 8 条。

## 速率限制

`/api/protected-verify` 与 `/api/revalidate*` 走 `lib/content/rate-limit.ts` 的 `enforceRateLimit()`，默认 30 req / 60s per client key。

- 配置了 `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`：跨 serverless 实例的分布式限流（Vercel Marketplace Upstash 集成会自动注入）。
- 未配置：回退到进程内 `Map`，仅适合本地 dev 与单实例测试。

`getClientKey(req)` 在 `TRUST_PROXY=1|true|yes` 时读 `X-Forwarded-For` 第一段，否则回退到 `req.socket.remoteAddress`。

## 不变式验证清单

部署后逐项过：

1. 公开博文正常渲染
2. 受保护博文未授权时**不**显示正文（页面上看到 TOTP 输入框或空 body）
3. 浏览器直接抓 `https://arsvine.com/_next/data/<buildId>/<locale>/blog/<protected>.json` — body 字段是 `null` 或为空
4. 提交正确 TOTP 后正文加载
5. 直接 `curl /api/post-variant?slug=<protected>&locale=zh-CN`（无 cookie）返回 `403`

第 2 / 3 / 5 条任何一条失败都意味着 SSG 边界被穿透，需要回滚。
