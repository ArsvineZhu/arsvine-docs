---
title: Arsvine Realm 开发维护
description: 本地命令、文件分布、约定与硬性约束。
---

# Arsvine Realm 开发维护

## 命令

```bash
npm run dev        # node server.js
npm run build      # next build
npm start          # cross-env NODE_ENV=production node server.js
npm run lint       # eslint .
npm run typecheck  # tsc --noEmit
npm run test       # vitest run
```

## 软规则

- 在 `pages/` 下加路由，不进 `app/`
- 自定义 `server.js` 是开发与生产共用的入口，不要替换
- 内部跳转用 `useTransition().navigateTo()`，不要直接 `router.push()`
- 修改站点元信息、SEO、字体、社交链接走 `data/site.ts`
- 远端图片域名白名单走 `config/image-hosts.js`
- UI 文案走 `locales/*.json`

## 资产发布

```bash
# 生成 manifest 与 COS 打包
npm run assets:build

# 上传到 COS 并触发受控 revalidate
node --env-file=.env.local scripts/assets-publish.mjs

# 一次性全量重传（仅在排障时使用）
node --env-file=.env.local scripts/assets-publish.mjs --force-full
```

`assets-publish` 默认走 `cos sync`（增量），只会上传内容发生变化的资源；用内容哈希的对象键确保同内容不同路径不会重复上传。

## 硬规则（务必保留）

1. 使用 Pages Router，不进 App Router
2. 不替换 `server.js`
3. 内部跳转走 `useTransition().navigateTo()`
4. 不基于 IP 选语言
5. 不动态 `require` locale 数据
6. 不重新引入 `reading-time`（CJK 不能用空白估时）
7. 不为翻译/用户内容挂 `--font-display`
8. `coscli` 只用临时环境变量注入的密钥
9. 受保护 MDX 不进静态产物
10. 保留 `useBlogPostState.ts` 与 `lib/blog-post-state.ts` 的 reducer/effect 竞态修复

## 验证

提交前至少跑：

```bash
npm run lint
npm run typecheck
npm run test
```

涉及 UI 或交互改动时，还要在桌面与移动端手验：路由过渡、博客详情页、保护型博文门禁、音乐播放器、Hash 导航、自定义光标状态。
