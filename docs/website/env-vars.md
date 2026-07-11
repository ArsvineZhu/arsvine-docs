---
title: 环境变量
description: 所有 .env.example 字段、用途、安全分级、必备 vs 可选。
---

# 环境变量

仓库根的 `.env.example` 完整列出了所有 env var。每行注释说明用途与是否 server-only。本节按域分组。

## 安全分级

| 级别 | 含义 | 例 |
|---|---|---|
| public | 出现在浏览器 bundle，**绝不**放 secret | `NEXT_PUBLIC_SITE_URL` |
| server-only | 仅服务端可见 | `GITHUB_READ_TOKEN`、`ACCESS_GRANT_SECRET` |
| dev-only | 只在本地 / dev 用，生产关掉 | `TWEETS_STRESS_TEST=1` |

`NEXT_PUBLIC_*` 前缀意味着注入到客户端 bundle。**永远不要**把 secret 放进 public 变量。

## Core

```dotenv
PORT=3000                                        # server.js 监听端口
NEXT_PUBLIC_SITE_URL=https://arsvine.com          # sitemap / RSS / robots / og:url / canonical
```

`NEXT_PUBLIC_SITE_URL` 是 canonical URL，缺省值在 `data/site.ts` 兜底为 `https://arsvine.com`。

## Public

```dotenv
# NEXT_PUBLIC_TELEMETRY_PROVIDER=vercel            # 留空 = 关闭遥测；设 vercel 才启用
NEXT_PUBLIC_CDN_BASE=https://cdn.arsvine.com      # realm/...、shared/... 的 CDN base
```

## Content（外部 GitHub 仓库）

```dotenv
# GITHUB_OWNER=ArsvineZhu
# GITHUB_REPO=arsvine-content
# GITHUB_BRANCH=main
# GITHUB_READ_TOKEN=github_pat_xxx
```

全部未设置时：

- 博文回退到 `content/blog/init/`（内置 6 个 locale 兜底）
- tweets 回退到空状态（除非 dev 开了 `TWEETS_STRESS_TEST=1`）
- 受保护博文自然不可用

## Security

```dotenv
# ACCESS_GRANT_SECRET=replace-with-a-random-long-string
# TOTP_GROUPS_JSON={"friends-a":{"current":"JBSWY3DPEHPK3PXP","period":30,"digits":6,"window":1}}
# REVALIDATE_SECRET=replace-with-a-random-long-string
# TRUST_PROXY=1
```

`ACCESS_GRANT_SECRET` 签 HttpOnly access-grant cookie；`TOTP_GROUPS_JSON` 是 group → TOTP 密钥映射；`REVALIDATE_SECRET` 守 `/api/revalidate*`；`TRUST_PROXY=1|true|yes` 时受信任的代理可以传 `X-Forwarded-For`，否则 rate limit 用 `req.socket.remoteAddress`。

## Infra

```dotenv
# UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
# UPSTASH_REDIS_REST_TOKEN=your-token
# COS_PRIVATE_BUCKET=your-private-bucket
# COS_PRIVATE_REGION=ap-hongkong
# COS_SECRET_ID=AKIDxxx
# COS_SECRET_KEY=xxxx
# COS_PRIVATE_CATALOG_PREFIX=
```

`UPSTASH_*` 在 Vercel Marketplace 集成 Upstash 后会自动注入。配置后 `lib/content/rate-limit.ts` 走 Redis 跨实例限流；未配置回退进程内 `Map`。

`COS_*` 仅供 `scripts/assets-publish.mjs` 用，平时 dev 不需要。运行时通过 `node --env-file=.env.local` 临时注入，**不要**写进 coscli 配置文件。

## Tweets Dev（仅 dev）

```dotenv
# TWEETS_STRESS_TEST=1
# TWEETS_STRESS_YEARS=6
# TWEETS_STRESS_MONTHS_PER_YEAR=12
# TWEETS_STRESS_TWEETS_PER_MONTH=24
```

合成数据让 tweets 页面在外部仓库未配置时也能看到分页与组件。生产**绝不**开。

## Advanced

```dotenv
# ANALYZE=true                # 打开 @next/bundle-analyzer
# NEXT_BUILD_DIR=.next        # 部署包装器可改 .next 输出目录
```

## 加入新 env var 的清单

1. 在 `.env.example` 加注释完整的行
2. `pnpm env:sync` 同步（如果你让 sync 脚本管这一份）
3. 任何 server-only 的 env 走 `process.env.<NAME>`，public 必须 `NEXT_PUBLIC_` 前缀
4. 任何 dev-only 的 env 在生产代码里要有 `process.env.NODE_ENV !== 'production'` guard
5. 文档里只写**变量名**与**用途**，绝不写真实值
