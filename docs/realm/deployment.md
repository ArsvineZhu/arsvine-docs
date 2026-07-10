---
title: Arsvine Realm 部署运行
description: Vercel + COS + ISR + 自定义 server 的运行模型。
---

# Arsvine Realm 部署运行

## Vercel

- 项目使用 Vercel 作为唯一的生产部署平台
- Framework Preset 选择 **Other**（不要选 Next.js），因为入口是 `server.js` 而非默认的 `next start`
- Install / Build / Start：
  - Install：`npm ci`
  - Build：`npm run build`
  - Start：`npm start`
- Node.js 版本固定为 `24.x`

## 自定义 server

- `server.js` 同时承担 dev 与 prod 入口，承担 locale 解析、回退、cookie 处理等 Pages Router 不便直接表达的事情
- 因此 Vercel 的 Build Output 与 `next start` 不一致，需要在 Vercel 配置里把 Start Command 设为 `npm start`，并把 `server.js` 显式加入 Vercel 的「包含文件」

## ISR 与 revalidate

- 资源发布成功后，发布脚本会 `POST /api/revalidate-assets`，对若干个公开路径触发 `res.revalidate`
- handler 用 `Promise.allSettled` 并行处理，失败时记录到日志并把失败路径写进响应体
- 发布脚本把「部分失败」视为告警，不会让整个发布失败；只有 5xx 才致命
- 受保护内容不参与 ISR

## COS

- 媒体资源统一走腾讯云 COS
- 公开桶：站点图片、字体、UI 资源
- 私有桶：受签名 cookie 保护的内容（音乐、博文附件等）
- 发布脚本使用临时环境变量注入的 `SecretId` / `SecretKey`，不写入任何 CLI 配置文件
- 资源版本通过 `current.json` 指针文件维护；`current.json` 走 `Cache-Control: no-cache, max-age=0, must-revalidate`

## 域名与 DNS

- 域名在腾讯云注册，DNS 解析走腾讯云 DNSPod
- 主域 `arsvine.com` 与文档子域 `docs.arsvine.com` 通过 CNAME 指向 Vercel 提供的目标
- 详见 `website/vercel-dnspod.md`

## 环境变量

- 真正的 secret 只放在 `.env.local`（不进仓库）
- `REVALIDATE_SECRET` 用于 `/api/revalidate-assets` 的简单共享密钥
- `TOTP_GROUPS_JSON` 用于受保护博文的 TOTP 分组
- `ACCESS_GRANT_SECRET` 用于受保护内容的签名 cookie
- `COS_SECRET_ID` / `COS_SECRET_KEY` 仅在运行 `scripts/assets-publish.mjs` 时通过 `node --env-file=.env.local` 注入
- `.env.example` 是脱敏后的占位文件
