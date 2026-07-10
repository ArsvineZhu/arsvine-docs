---
title: SEO 与安全
description: 站点元信息、revalidate secret、TOTP、access cookie、远端图片白名单。
---

# SEO 与安全

## 站点元信息

- 所有元信息（标题、描述、社交链接、字体、作者等）集中在 `data/site.ts`
- 多语言元信息走 `locales/<locale>.json`
- 修改站点 SEO 前先读 `data/site.ts`，再决定是否需要联动调整 `next-sitemap` / `og` 输出

## 远端图片白名单

- 任何远端图片域名必须先在 `config/image-hosts.js` 注册
- 不在白名单里的域名会被 Next 的 `next/image` 拒绝

## 路由级 revalidate

- `POST /api/revalidate-assets` 用于触发资源相关的 ISR 重生
- 通过共享密钥校验：`REVALIDATE_SECRET`
- 校验逻辑在 `pages/api/revalidate-assets.ts`，使用常量时间比较（避免时序侧信道）
- 失败路径：handler 用 `Promise.allSettled` 并行处理；200 表示全部成功，200 `{ partial: true }` 表示部分失败，500 表示全部失败

## 受保护博文

- TOTP：`TOTP_GROUPS_JSON` 描述哪些博文属于哪个分组
- Access cookie：`ACCESS_GRANT_SECRET` 用于签发短期签名 cookie
- 受保护博文**不进** `getStaticProps` 静态产物；它们走运行时 API + 签名 cookie
- 状态机在 `hooks/useBlogPostState.ts` 与 `lib/blog-post-state.ts`

## 内容安全

- MDX 中允许内嵌 React 组件，但默认沙箱不允许 `dangerouslySetInnerHTML`
- 用户提交内容（评论、留言）目前未启用；若启用，必须经过严格过滤
- `coscli` 注入的密钥只在子进程存活期间有效；任何子进程退出都会让环境变量失效

## CSP 与 Headers

- 站点默认带 `Strict-Transport-Security`、`X-Content-Type-Options: nosniff`、`Referrer-Policy`
- 启用 Cloudflare 代理后可以叠加 Cloudflare 的 WAF 规则
- 自定义 header 的源头应在 `next.config.js` 与 `server.js` 中显式声明，便于审查

## 私密内容清单（不要写进公开文档）

- `.env.local` 中的任何 secret
- GitHub Token / PAT
- COS `SecretId` / `SecretKey` / `SessionToken`
- TOTP 密钥
- 私有桶路径
- 真实高价值资源映射
- 未公开朋友信息
- Vercel / Cloudflare 后台截图中含敏感字段的部分
