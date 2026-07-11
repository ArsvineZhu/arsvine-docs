---
title: 概览
description: Arsvine Realm 是什么、技术画像、本节如何阅读。
---

# Arsvine Realm 概览

**Arsvine Realm** 是 Arsvine Zhu 的个人作品集与博客网站。视觉上以 post-apocalyptic HUD 风格呈现，技术上是一个自托管的 Next.js 多语言站点，媒体资源走腾讯云 COS，所有博文与 tweet 走外部 GitHub 私有内容仓库，受保护博文走 TOTP 验证 + 签名 cookie 流程。

本节从工程视角拆解 Realm 项目的实现，是给维护者和编码 agent 看的「运行手册」，不是面向访客的产品页。

## 在哪里

- 仓库：`https://github.com/Arsvine-Realm-Dev-Team/arsvine-realm`
- 线上：`https://arsvine.com`
- 文档站：`https://docs.arsvine.com`（即本站的 `Realm` 章节）
- 文档源：[`arsvine-realm/docs/`](https://github.com/Arsvine-Realm-Dev-Team/arsvine-realm/tree/master/docs) — 同一仓库内更短的维护说明

## 技术画像

| 维度 | 选型 |
|---|---|
| 框架 | Next.js 16（Pages Router，非 App Router） |
| UI | React 19 + TypeScript + SCSS Modules + 共享 SCSS 局部 |
| 3D / 动效 | Three.js、`@react-three/fiber`、`@react-three/drei`、`@react-three/cannon`、`cannon-es`、GSAP、Web Animations API |
| 内容 | `next-mdx-remote` 编译 MDX；外部内容走 GitHub Contents API |
| 本地化 | `next-intl` 4；UI locales `zh-CN` / `zh-TW` / `en`；可选内容 locale `ja` / `ru` / `fr` |
| 组件 | ~50 个组件文件，分布在 layout / effects / interactive / sections / detail / blog / cards / mdx / shared / telemetry 共 10 个子目录 |
| Hooks | 22 个自定义 hooks |
| Contexts | 4 个（App、Transition、LayoutAnchors、SiteAssets） |
| 测试 | Vitest + jsdom；用例按 `tests/lib`、`tests/components`、`tests/hooks`、`tests/i18n`、`tests/pages`、`tests/repo` 分目录 |
| 服务端 | 自定义 Node.js 服务 `server.js`（不是 `next start`） |
| 运行时 | Node.js 24.x（`package.json` 的 `engines.node`） |
| 包管理器 | pnpm 11.7.0 |

## 本节怎么读

按主题分篇，不分「用户视角」与「开发者视角」：

1. `routes-and-proxy` — 路由结构与 `proxy.ts` 中间件职责
2. `pages-tree` — `pages/[locale]/...` 下全部页面与动态路由
3. `content-sources` — 仓库内 `data/` 与外部 GitHub 内容仓库的双层结构
4. `protected-posts` — TOTP 验证 + 签名 cookie + 静态产物保护不变式
5. `api-endpoints` — 13 个 `pages/api/*` 路由的作用与边界
6. `performance-tiers` — `useAdaptivePerformance` 的四档自适应与采样规则
7. `component-architecture` — 50+ 组件的分类与职责
8. `hooks-and-contexts` — 22 个 hooks 与 4 个 contexts 的用途
9. `custom-server` — `server.js` 的详细实现
10. `development` — 本地命令、COS Referer 工作流、字体、媒体
11. `gotchas` — 历史回归点与脆弱约定

阅读顺序建议：先 `routes-and-proxy` 与 `pages-tree` 建立物理图，再读 `content-sources` 与 `protected-posts` 理解内容流；`api-endpoints` 与 `performance-tiers` 按需查阅；`gotchas` 是任何改动前的必读。
