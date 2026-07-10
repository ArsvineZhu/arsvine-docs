---
title: Vercel 与 DNSPod
description: Vercel 项目配置、域名绑定、腾讯云 DNSPod 解析记录与首次验证流程。
---

# Vercel 与 DNSPod

域名在腾讯云注册，DNS 也走腾讯云 DNSPod。本节记录 Vercel 项目与 DNSPod 之间的对接流程。

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

## Vercel 域名绑定

1. 登录 Vercel，进入对应项目
2. Settings → Domains → Add `arsvine.com` / `docs.arsvine.com`
3. Vercel 会分配一个 CNAME 目标（每个项目独立，形如 `cname.vercel-dns.com` 的子域）
4. Vercel 自动签发 Let's Encrypt 证书

## 腾讯云 DNSPod 解析

域名在腾讯云注册，DNS 解析走 DNSPod。配置步骤：

1. 登录 [DNSPod 控制台](https://console.dnspod.cn/)
2. 进入「域名解析」→ 选中 `arsvine.com`
3. 添加记录：
   - 主机记录：`@`（指向主域）
   - 记录类型：`CNAME`
   - 记录值：Vercel 给主站项目的 CNAME 目标
   - TTL：`600`（10 分钟）或自动
4. 再添加一条：
   - 主机记录：`docs`
   - 记录类型：`CNAME`
   - 记录值：Vercel 给文档站项目的 CNAME 目标
   - TTL：`600`
5. 保存后等待 DNSPod 同步（通常几十秒到几分钟）
6. 回到 Vercel 域名页，刷新状态直到显示 **Valid Configuration**

> DNSPod 的 CNAME 记录在主机记录为空时对应根域 `@`；子域填 `docs`、`blog` 等。

## 验证

```text
# 在本机终端验证解析是否生效
nslookup docs.arsvine.com
# 或
dig docs.arsvine.com CNAME +short
```

两条记录都应解析到 Vercel 给出的 CNAME 目标。

## HTTPS

- Vercel 自动签发并续期 Let's Encrypt 证书
- DNSPod 自身不参与证书签发，仅负责解析
- 不要在主站 / 文档站之间共享同一个 Vercel 项目

## 回滚

- Vercel → Deployments → 选旧版本 → Promote to Production
- COS 资源侧的回滚：发布脚本支持 `--rollback <version>`，回写 `current.json` 指针
