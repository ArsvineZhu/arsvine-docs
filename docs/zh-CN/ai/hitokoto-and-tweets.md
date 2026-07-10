---
title: Hitokoto 与 Tweets
description: 一言代理、tweet 月份归档、压测模式、合成数据生成。
---

# Hitokoto 与 Tweets

Realm 在「内容采集」侧接了两个第三方源：Hitokoto 一言（首页打字机签名）、Tweet 月份归档（tweets 页面）。两者都通过 Pages Router API 端点代理，避免 CORS 并加上超时保护。

## `/api/hitokoto`

服务端代理 `v1.hitokoto.cn`。首页打字机签名用中俄两句固定文本（来自 Zamyatin《我们》），`/api/hitokoto` 是**额外**的一句话轮播源，按 design 决定是否接入。

handler 行为：

- GET-only
- `AbortController` 设 5s 超时
- 命中内存 LRU 缓存 60s
- 错误（网络 / 超时 / 5xx）→ 返回空 body，**不**让上游超时挂住 SSR

页面侧只展示有内容的部分，空 body 静默 fallback。

## Tweets 归档

### 数据源

`/api/tweet-months` 从外部 GitHub 内容仓库的 `tweets/index.json` 读月份索引，分页返回。仓库未配置时返回 `[]`。

`tweets/index.json` 结构：

```json
[
  { "year": 2025, "month": 12, "tweetCount": 24 },
  { "year": 2025, "month": 11, "tweetCount": 18 }
]
```

`tweets/YYYY-MM.json` 是当月 tweet 数组，schema 见 `lib/tweets/types.ts`。

### 客户端渲染

`pages/[locale]/tweets.tsx` 在 SSG 期间生成当前 locale 的初始月份列表；后续月份通过 `useSWRInfinite` 风格的 fetch 增量加载（`/api/tweet-months?offset=N&limit=12`）。

### 压测模式（dev only）

生产**绝不开**。`TWEETS_STRESS_TEST=1` 启用：

```dotenv
TWEETS_STRESS_TEST=1
TWEETS_STRESS_YEARS=6
TWEETS_STRESS_MONTHS_PER_YEAR=12
TWEETS_STRESS_TWEETS_PER_MONTH=24
```

合成数据用 `lib/tweets/parse-explain.tsx` 与 `lib/tweets/resolve.ts` 的工具从固定模板生成，仅用于本地调通分页 / 滚动 / 空态。

## 安全与边界

- 第三方 tweet 内容是**只读**的：用户不能从 Realm 内部发推
- tweet 内容可能含外链。`lib/safe-external-href.ts` 解析外链时强制 `https` / `http` 协议白名单，丢弃其他协议（如 `javascript:`）
- tweet 富文本里的 `@user` `#tag` 链接走 `lib/tweets/parse-explain.tsx`，不直接渲染 HTML

## 离线 / 仓库空

外部仓库未配置 + 压测未启用：

- tweets 页面渲染空态（`components/sections/TweetsSection.tsx` 的空态分支）
- `/api/tweet-months` 返回 `{ months: [], total: 0 }`

这不视为错误，是正常回退。

## 监控

- tweet 拉取失败写 `console.error`（带 URL 与 status code）
- `/api/tweet-months` 受 `enforceRateLimit()` 限流（默认 30/min per client key）
- 客户端「加载更多」按钮的失败态有重试入口，不静默吞
