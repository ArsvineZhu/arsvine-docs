---
title: SEO 与安全
description: 站点元信息、revalidate secret、TOTP、access cookie、远端图床、HTTP 头。
---

# SEO 与安全

## 站点元信息

`data/site.ts` 的 `siteConfig` 是 SEO 文案与社交链接的单一信息源。修改后会同步更新：

- HUD / Loading 站名
- Contact 邮箱与点击复制
- About 页脚版权
- `<title>` / `og:title` / `<meta description>` / `og:description`
- sitemap / RSS / robots 的 base URL 与标题
- 首页打字机签名（俄文 + 中文两句，来自 Zamyatin《我们》）
- `og:image` / `twitter:image`
- 字体外链与 preconnect 目标
- `<html lang>` / `og:locale` / RSS `<language>`
- `/content` 与 `/friends` 页的 SEO 与 heading 文案

`package.json` 的 `name` / `author` / `description` **不**在 import 范围，模板使用者克隆后需手动同步。

## `<html lang>` 与 og:locale

按 locale 切换：

| Locale | `<html lang>` | `og:locale` | RSS `<language>` |
|---|---|---|---|
| `zh-CN` | `zh-Hans-CN` | `zh_CN` | `zh-CN` |
| `zh-TW` | `zh-Hant-TW` | `zh_TW` | `zh-TW` |
| `en` | `en-US` | `en_US` | `en-US` |

BCP-47 走 `htmlLangMap`，Facebook 风格 underscore 走 `ogLocaleMap`。映射在 `i18n/config.ts` 集中。

## 远端图床白名单

集中在 `config/image-hosts.js`：

- `cdn.arsvine.com` — 自有 CDN（腾讯云 COS 香港桶）
- `placehold.co` — `data/*.ts` 占位图
- `images.unsplash.com` / `source.unsplash.com` — 模板示例

新增域名只动这一个文件，**不**要复制到 `next.config.js`。

## 受保护博文

- `ACCESS_GRANT_SECRET` 签 HttpOnly access-grant cookie
- `TOTP_GROUPS_JSON` 描述 group → 密钥映射
- 受保护博文的 `mdxSource` 在 SSG 是 `null`，正文只在运行时 `/api/post-variant` 出
- 部署后必须验证「`_next/data/.../<slug>.json` 不含 body」

## ISR 共享密钥

`REVALIDATE_SECRET` 守 `/api/revalidate*`：

- `/api/revalidate` 重建 `/<locale>/tweets`（GET / POST 都接受，secret 走 body 或 querystring）
- `/api/revalidate-content` 重建 `/<locale>/content` 与（可选）`/<locale>/blog/<slug>`（仅 POST，rate-limited 30/min per client）
- `/api/revalidate-assets` 重建主页与作品 / 生活 / 友链路径（仅 POST，并行，partial OK）

`REVALIDATE_SECRET` 未设置时这些端点应被视作禁用。所有端点的比较都是 `constantTimeEqual`，防时序侧信道。

## Trust Proxy

`TRUST_PROXY=1|true|yes` 让 revalidate / protected-verify 端点读 `X-Forwarded-For` 第一段作为 rate-limit key；否则用 `req.socket.remoteAddress`。生产部署在 Vercel 之后默认应该设。

## HTTP 头

`next.config.js` 与 `server.js` 共同声明：

- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`

任何新增 header 必须在两处显式声明，便于审查。

## WAF / 速率限制

- 受保护端点走 `enforceRateLimit()`（Upstash 或进程内 `Map`）
- Vercel 自带 WAF 与 rate limiting 在 Vercel 项目层配置
- DNSPod 提供 DNS 防护；细规则建议放 Vercel

## 受限内容清单（绝对不要写进公开文档）

- `.env.local` 中的任何 secret
- GitHub Token / PAT
- COS `SecretId` / `SecretKey` / `SessionToken`
- TOTP 密钥（base32 字面量）
- 私有桶路径
- 真实高价值资源映射
- 未公开朋友信息
- Vercel / 腾讯云 DNSPod 后台截图中含敏感字段的部分
