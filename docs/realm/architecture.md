---
title: Arsvine Realm 架构说明
description: 路由结构、内容来源、渲染模型与维护边界。
---

# Arsvine Realm 架构说明

## 路由形态

- 全站使用 **Pages Router**，不引入 App Router
- 用户可见 URL 形态：`/<locale>/...`，locale 取 `zh-CN`、`zh-TW`、`en`
- 实际文件分布在 `pages/<locale>/...`；Pages Router 顶层有自定义的 locale 跳转与回退处理
- 不在路由层做基于 IP 的语言选择；locale 解析顺序为 `NEXT_LOCALE` cookie > `Accept-Language` > `zh-CN`

## 内容来源

- 静态内容（项目、生活、友链、技能、站点元信息等）放在 `data/<topic>/*.ts`
- 博客/动态内容走两层：
  - 兜底/初始化内容放在仓库内 `content/blog/init/`
  - 运行时内容走外部 GitHub content 仓库，通过 `.env.local` 中的变量指定
- 媒体资源（图片、音频、字体）走 COS（Tencent Cloud Object Storage），由发布脚本统一管理
- 保护型博文（受 TOTP 与 access cookie 双重保护）**不进入** `getStaticProps` 静态产物；它们走运行时 API + 签名 cookie 路径

## 渲染与 ISR

- 大部分公开页面用 `getStaticProps` + `getStaticPaths` 预渲染
- 资源版本变更后，发布脚本会调 `POST /api/revalidate-assets` 触发受控 ISR 重生
- 受保护内容与运行时 API 不参与 ISR

## 状态与过渡

- 路由级过渡由 `contexts/TransitionContext.tsx` 与 `useTransition().navigateTo()` 共同管理
- **不要**直接调 `router.push()`，否则会破坏过渡时序
- 局部 UI 状态（受保护博文的解锁/锁闭、CDN 资源版本读取）通过 reducer + effect 的组合管理

## 关键模块

| 模块 | 位置 |
|---|---|
| 站点元信息、SEO、社交链接 | `data/site.ts` |
| 远端图片域名白名单 | `config/image-hosts.js` |
| 音乐目录与播放 | `lib/assets/catalog-provider.ts`、`components/interactive/MusicPlayer.tsx` |
| 全局 HUD / 侧栏 | `components/layout/` |
| MDX 渲染与样式 | `components/mdx/`、`styles/MDXContent.module.scss` |
| 自定义 server | `server.js` |

## 维护边界

- 新增可见页面：写 `data/` 里的数据 + `pages/<locale>/...` 里的页面文件
- 新增资源：丢进源目录，跑 `npm run assets:build` 生成 manifest，然后 `node --env-file=.env.local scripts/assets-publish.mjs`
- 不要绕过 `useTransition().navigateTo()`；不要把受保护内容塞进静态产物；不要在 `lib/i18n-data.ts` 里引入动态 `require` 加载 locale 数据
