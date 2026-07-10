---
title: 易踩坑
description: 历史上的回归点与脆弱约定。修改相关代码前请先读。
---

# 易踩坑

> 这一节是「给未来的自己」的提醒：以下每一条都对应一次实际的事故。修改前请确认你的改动不会重新引入同样的问题。

## 受保护博文状态机

- 文件：`hooks/useBlogPostState.ts`、`lib/blog-post-state.ts`
- 历史问题：reducer 与 effect 之间的竞态曾导致解锁状态在切页时丢失或闪烁
- 规则：**保留** 现有的 reducer + effect 时序；不要把它们合并成单个 `useState`
- 任何修改都必须附带回放脚本或在 PR 描述里给出复现路径

## 路由加载浮层

- 全屏 loading overlay 的插入点必须在 `TransitionContext` 内部；放在 `document.body` 末尾会盖住 HUD
- 新增页面级 loading 时不要绕过这个约束

## 头像视差

- 头像区的视差是用 `transform` 实现的；任何在父级加 `will-change` 或 `overflow: hidden` 的改动都会破坏 transform 的覆盖
- 修改前先把 `transform` 的来源层固定下来

## 博客揭示动画与 `<Explain>` 工具提示

- 两者的 z-index 与 stacking context 需要在 Reveal 完成后才能升级
- 不要把 `<Explain>` 直接放进动画容器

## 音乐播放器切歌

- 切歌时不要直接重置 audio 元素的 `currentTime`，否则会触发不必要的缓冲
- 切歌前要 `pause()`，等 `canplay` 后再 `play()`

## 移动端音乐自动打开守卫

- 移动端在路由切换时不应自动打开播放器
- 守卫放在 `components/interactive/MusicPlayer.tsx`，不要删

## `AnimatedTitleChars` 大小写

- 该组件强制大写展示，**不要**对传入的中文/已是大写的内容再次 `toUpperCase()`，否则 CJK 字符会出现不可预期的渲染问题

## COS 字体响应头

- 字体对象必须带 `Cache-Control: public, max-age=31536000, immutable`；漏掉会导致反复跨域拉取
- 字体路径必须在 `config/image-hosts.js` 白名单里

## Google Fonts 去重

- 同一字族的不同字重不要重复引入；Rspress / Next 都会按 URL 维度去重，但 `<link rel="preload">` 仍可能引入重复
- 项目里只维护一个变量字体文件 + 单一引用入口
