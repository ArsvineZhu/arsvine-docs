---
title: Vercel 与 Cloudflare
description: Vercel 项目配置、域名绑定、Cloudflare DNS 记录与首次验证流程。
---

# Vercel 与 Cloudflare

## Vercel 项目

主站与文档站是**两个独立的 Vercel 项目**，互不依赖。

### 主站（arsvine-realm）

| 项 | 值 |
|---|---|
| Framework Preset | Other |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Start Command | `npm start`（使用自定义 `server.js`） |
| Output | 视自定义 server 而定；不要依赖 Next 默认输出 |
| Node | 24.x |

### 文档站（arsvine-docs）

| 项 | 值 |
|---|---|
| Framework Preset | Other |
| Install Command | `pnpm install` |
| Build Command | `pnpm build` |
| Output Directory | `doc_build` |
| Node | 22.x |

`vercel.json` 显式声明 `buildCommand` / `outputDirectory` / `installCommand`，让 Vercel 跳过框架自动识别。

## 域名绑定

1. Vercel → Settings → Domains → Add `arsvine.com` / `docs.arsvine.com`
2. Vercel 会给一个 `cname.vercel-dns.com` 目标（每个项目独立）

## Cloudflare DNS

```text
Type: CNAME
Name: arsvine / docs
Target: <Vercel 提供的 CNAME>
Proxy status: DNS only
```

- 首次绑定阶段保持 **DNS only**，等 Vercel 签发 HTTPS 后再考虑是否开橙云代理
- 静态站点本身已经被 Vercel CDN 覆盖，套 Cloudflare 代理的额外价值有限

## HTTPS 与回环

- Vercel 自动签发 Let's Encrypt 证书
- 若启用 Cloudflare 代理，证书由 Cloudflare 边缘处理，源站仍可保留 Vercel 证书
- 不要在主站/文档站之间共享同一个 Vercel 项目

## 回滚

- Vercel → Deployments → 选旧版本 → Promote to Production
- COS 资源侧的回滚：发布脚本支持 `--rollback <version>`，回写 `current.json` 指针
