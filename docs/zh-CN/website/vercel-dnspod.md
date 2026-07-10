---
title: Vercel 与 DNSPod
description: Vercel 项目配置、域名绑定、腾讯云 DNSPod 解析记录、首次验证流程。
---

# Vercel 与 DNSPod

域名在腾讯云注册，DNS 走腾讯云 DNSPod。本节记录主站与文档站两个 Vercel 项目与 DNSPod 之间的对接流程。

## 两个独立 Vercel 项目

主站（`arsvine-realm`）和文档站（`arsvine-docs`）**必须**是两个独立 Vercel 项目，互不依赖，绑不同的子域。

### 主站

| 项 | 值 |
|---|---|
| Framework Preset | Other |
| Install Command | `pnpm install` |
| Build Command | `pnpm build` |
| Start Command | `pnpm start`（使用自定义 `server.js`） |
| Node.js | 24.x（与 `package.json#engines.node` 对齐） |

### 文档站

| 项 | 值 |
|---|---|
| Framework Preset | Other |
| Install Command | `pnpm install` |
| Build Command | `pnpm build` |
| Output Directory | `doc_build` |
| Node.js | 22.x |

文档站用 `vercel.json` 显式声明 `buildCommand` / `outputDirectory` / `installCommand` / `framework: null`，让 Vercel 跳过框架自动识别。

## Vercel 域名绑定

1. 登录 Vercel → 进入对应项目
2. Settings → Domains → Add `arsvine.com` / `docs.arsvine.com`
3. Vercel 分配一个 CNAME 目标（每个项目独立，形如 `cname.vercel-dns.com` 的子域）
4. Vercel 自动签发 Let's Encrypt 证书

## 腾讯云 DNSPod 解析

登录 [DNSPod 控制台](https://console.dnspod.cn/)，域名解析 → 选中 `arsvine.com`，添加两条 CNAME：

| 主机记录 | 记录类型 | 记录值 | TTL |
|---|---|---|---|
| `@` | CNAME | 主站 Vercel 给的 CNAME 目标 | 600 |
| `docs` | CNAME | 文档站 Vercel 给的 CNAME 目标 | 600 |

主机记录为空（`@`）表示根域。子域填 `docs`、`blog` 等。

保存后等待 DNSPod 同步（通常几十秒到几分钟）。回到 Vercel 域名页，刷新状态直到显示 **Valid Configuration**。

## 验证

```bash
# 在本机终端验证解析是否生效
nslookup docs.arsvine.com
dig docs.arsvine.com CNAME +short
```

两条记录都应解析到 Vercel 给出的 CNAME 目标。

## HTTPS

- Vercel 自动签发并续期 Let's Encrypt 证书
- DNSPod 不参与证书签发，仅负责解析
- **不要**在主站 / 文档站之间共享同一个 Vercel 项目

## 回滚

- Vercel → Deployments → 选旧版本 → Promote to Production
- COS 资源侧的回滚：`node --env-file=.env.local scripts/assets-publish.mjs --rollback <version>`，回写 `current.json` 指针（详见 `asset-pipeline`）
