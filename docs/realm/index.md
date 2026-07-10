---
title: Arsvine Realm 概览
description: Arsvine Realm 是 post-apocalyptic HUD 主题的个人作品集与博客，记录路由结构、内容来源、渲染模型与维护边界。
---

# Arsvine Realm 概览

Arsvine Realm 是本系列文档对应的「主站」，以末世 HUD 风格呈现个人作品集与博客。本节是给阅读者与维护者准备的工程视角记录，不是面向终端用户的产品页。

## 在哪里

- 仓库：`ArsvineZhu/arsvine-realm`（GitHub）
- 线上：`https://arsvine.com`
- 文档站：`https://docs.arsvine.com`（即本站）

## 一句话技术画像

Next.js 16 Pages Router + React 18 + TypeScript + SCSS Modules + Three.js + GSAP + MDX + `next-intl` 4，部署在 Vercel，运行时 Node 24。

## 这一节会讲什么

- `architecture.md`：路由、内容系统、ISR 边界
- `development.md`：本地命令、文件分布、约束
- `deployment.md`：Vercel + COS + ISR
- `gotchas.md`：踩过的坑与必须保留的写法

阅读顺序建议：先 architecture，再 development，最后 gotchas。
