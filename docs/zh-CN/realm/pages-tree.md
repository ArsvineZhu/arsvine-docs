---
title: 页面树与动态路由
description: pages/[locale] 下所有页面文件、动态路由参数、redirect 跳转。
---

# 页面树与动态路由

## 完整文件清单

`pages/[locale]/` 下 22 个文件，按职责分组：

### 入口与聚合

| 文件 | URL | 说明 |
|---|---|---|
| `index.tsx` | `/{locale}` | HUD 首页，五个主导航栏 |
| `content.tsx` | `/{locale}/content` | 内容聚合页，支持 hash 段（`#works` `#experience` `#blog` `#life`） |

### 章节页

| 文件 | URL | 说明 |
|---|---|---|
| `works.tsx` | `/{locale}/works` | 作品列表 |
| `experience.tsx` | `/{locale}/experience` | 经历时间线 |
| `life.tsx` | `/{locale}/life` | 生活记录（game / travel / other） |
| `friends.tsx` | `/{locale}/friends` | 友链 + 致谢区 |
| `about.tsx` | `/{locale}/about` | 关于 |
| `contact.tsx` | `/{locale}/contact` | 联系（社交链接 + 邮箱） |
| `tweets.tsx` | `/{locale}/tweets` | 推文归档，支持月份分页 |
| `copyright.tsx` | `/{locale}/copyright` | 许可证与版权 |

### 详情页

| 文件 | URL | 说明 |
|---|---|---|
| `web/[id].tsx` | `/{locale}/web/{id}` | 作品详情，SSG + `getStaticPaths` 覆盖 `data/projects` |
| `life/[slug].tsx` | `/{locale}/life/{slug}` | 生活详情，SSG 覆盖 `data/life` |
| `blog/[slug].tsx` | `/{locale}/blog/{slug}` | 博文详情，SSG `fallback: 'blocking'` + ISR |

### 跳转

| 文件 | 行为 |
|---|---|
| `blog.tsx` | 临时跳转别名 → `/{locale}/content#blog` |
| `posts.tsx` | legacy 跳转 → `/{locale}/content#blog` |
| `posts/[slug].tsx` | legacy 跳转 → `/{locale}/blog/{slug}` |
| `license.tsx` | 永久跳转 → `/{locale}/copyright` |

注意 `/[locale]/game` **不存在**。`useLayoutRouteMode` 等 hook 的 prefetch 匹配里仍把它当作独立分支，但 `pages/[locale]/game` 实际没有对应文件——这是 GOTCHAS.md 第 21 条记录的「历史遗留匹配」。

### 受保护与 feed

| 文件 | URL | 说明 |
|---|---|---|
| `access/[group].tsx` | `/{locale}/access/{group}` | TOTP 门禁页 |
| `rss.xml.tsx` | `/{locale}/rss.xml` | 每 locale 一份 RSS |

## `getStaticPaths` 行为

- `web/[id].tsx`：`paths` 从 `data/projects`（按 locale 切）三组（web / game / early）展平。`fallback: false`。
- `life/[slug].tsx`：`paths` 从 `data/life` 展平（gameData / travelData / otherData）。`fallback: false`。
- `blog/[slug].tsx`：`paths` 从 `blog-index.json` 拉取 slug 列表（在外部内容仓库配置时）或回退到 `content/blog/init/` 的内置文章。`fallback: 'blocking'` 让新增 slug 在被请求时实时生成（ISR）。

## 状态与布局上下文

详见 `routes-and-proxy` 之外的几个 context：

- `contexts/AppContext.tsx` — 站级交互态与效果：loading 序列、power/battery/inversion、实时统计、首页打字机、column hover 状态。
- `contexts/TransitionContext.tsx` — 控制路由过渡动画。**所有内部跳转必须用 `useTransition().navigateTo(url)`**，不能用 `router.push()`。支持 `setBackOverride()` 让 detail view 和 lightbox 拦截 BACK 行为。
- `contexts/LayoutAnchorsContext.tsx` — 注册 active scroll container。因为 layout 用锁定高度的内容容器，深链 scroll 必须打到那个容器而不是 document viewport。
- `contexts/SiteAssetsContext.tsx` — 提供 site-shell 资源（如 `favicon`、`og:image`、`avatar`）的解析结果。

## 路由 loading 覆盖层

`useRouteLoadingKind(router)` 从「**离开的路径**」而不是「目标路径」决定 loading 变体：

- `home/content → blog detail`：用右侧默认 overlay，左侧 HUD 仍可见
- `blog detail → blog detail`：用 standalone overlay，左侧 HUD 已隐藏

不能改成「按目标路径」判断——会破坏其中一种方向。这是 GOTCHAS.md 第 7 条。
