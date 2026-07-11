---
title: 概览
description: Arsvine 网站对外可见的运行底座：DNS、部署、对象存储、SEO、安全。
---

# Website Infrastructure 概览

这一节是「运行层」手册：域名、DNS、部署平台、对象存储、字体、SEO、遥测、安全约束。所有内容都是公开可查的事实，不涉及 secret value。

## 顶层位置

| 资产 | 位置 |
|---|---|
| 主站 | `https://arsvine.com` |
| 文档站 | `https://docs.arsvine.com` |
| 静态媒体域 | `https://cdn.arsvine.com`（自有 CDN，源在腾讯云 COS 香港桶 `arsvine-cdn`） |
| 域名注册 | 腾讯云（DNSPod 控制台） |
| DNS | 腾讯云 DNSPod |
| 部署 | Vercel 独立项目（主站与文档站互不依赖） |
| 媒体存储 | 腾讯云 COS（公开桶 + 私有桶） |
| 外部内容 | 私有 GitHub 仓库（`arsvine-content`） |

## 阅读顺序

1. `server-and-stack` — `server.js` 入口与构建命令
2. `next-config` — `next.config.js` 详细配置
3. `env-vars` — `.env.example` 全字段解释与安全分级
4. `vercel-dnspod` — Vercel 项目设置、域名绑定、DNSPod 解析
5. `cos-and-cdn` — COS 桶结构、对象键命名、版本指针
6. `font-hosting` — 自托管 Google Fonts 的抓取与上传
7. `asset-pipeline` — 资源发布流水线（`assets:prepare` → `build` → `publish`）
8. `rss-sitemap-robots` — 动态 SEO 文件
9. `telemetry` — 遥测（默认关闭，按 env 启用）
10. `seo-and-security` — 站点元信息、revalidate secret、TOTP、access cookie、远端图床
11. `content-pipeline` — 外部 GitHub 内容仓库结构

## 内容红线

以下内容**禁止**写进公开文档：

- `.env.local` 中的任何 secret value
- GitHub Token / PAT
- COS `SecretId` / `SecretKey` / `SessionToken`
- TOTP 密钥（base32 字面量）
- 私有桶路径、API endpoint 完整 URL
- 真实高价值资源映射
- 未公开朋友信息
- Vercel / DNSPod 后台截图中含敏感字段的部分

可以写「流程」与「字段名」，不写「真实密钥」与「私有路径」。
