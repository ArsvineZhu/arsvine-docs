---
title: 易踩坑
description: 历史回归点与脆弱约定。修改相关代码前请先读。
---

# 易踩坑

> 仓库 `arsvine-realm/docs/GOTCHAS.md` 收录 27 条同样的踩坑记录。这里挑与维护者最相关的、并补充对外公开可见的视角。

## 受保护博文

1. **`useBlogPostState` 的 auth-probe effect 必须依赖 `state.authState`**。否则在同 group 内切换受保护博文时，effect 不重跑，页面卡在 auth checking。`hooks/useBlogPostState.ts`。
2. **`authResolved` 的两条分支（granted / required）都要清 `activeRequestKey` 和 `loadingLocale`**。只清 required 分支会留 stale key，下一次 fetch 被错误 dedup。`lib/blog-post-state.ts`。
3. **受保护博文的 `mdxSource` 永远在 SSG 是 `null`**。绝不能把密文 / 隐藏 MDX 塞进 `_next/data/.../...json`。直接 `GET /api/post-variant?slug=<protected>&locale=zh-CN` 不带 cookie 必须返回 `403`。

## 路由过渡与导航

4. **内部跳转一律走 `useTransition().navigateTo(url)`**。`router.push()` 会跳过过渡动画，破坏 home / content / detail 的运动编排。
5. **`useRouteLoadingKind` 按「离开的路径」决定 loading 变体**，不是「目标路径」。改成目标路径会破坏 home→detail 或 detail→detail 中的一种方向。
6. **左侧 HUD 的 loading overlay 必须在 `TransitionContext` 内部**。放到 `document.body` 末尾会盖住 HUD。

## 自定义光标与头像

7. **CustomCursor 的 hover 状态必须走 reset helper**。直接动内部 ref 会在路由切换、滚动、blur、visibilitychange、DOM 卸载后留下状态残渣。
8. **头像视差 mousemove 必须用 `style.setProperty('transform', value, 'important')`**。直接 `style.transform = ...` 会被头像入场 keyframe 的 `forwards` 终态 transform 静默盖掉。

## MDX 渲染

9. **`<Explain>` 不可放进动画容器**。z-index 与 stacking context 一起被覆盖，工具提示会陷到下面。
10. **博文 reveal 动画结束后 transform 必须写 `'none'`**，不能写空串。任何非 `none` 的 transform 会创建 stacking context，把 `<Explain>` 工具提示困住。
11. **`<AnimatedTitleChars uppercase={false}>` 显式传**。该组件默认 uppercase，但 CJK / 已是大写的字符串再 `toUpperCase()` 会出现不可预期的渲染问题。
12. **`<Term>` 与 `<Explain>` 的语义**：
    - `<Term note="...">word</Term>`：rubification 注释，proper noun / 缩写 / 短注
    - `<Explain note="...">phrase</Explain>`：tooltip / 移动端底部 sheet，长句注
    - `<Explain>` 用 focusable span 而非 button，避免内联换行与居中问题；移动端变 fixed bottom panel

## 字体

13. **`--font-display` 是 Latin-only（ZELDA Free）**。不要给 CJK、带音 Latin、blog title、翻译字符串、用户内容用。HUD 用 `--font-hud`，长文用 `--font-reading`。
14. **Google Fonts variable font 去重是预期行为**。同一 `.woff2` 可能被多个 `@font-face` 块引用（不同 `font-weight`）。**不要**重写 `scripts/fetch-google-fonts.mjs` 强制一个 weight 一个文件。
15. **COS 自定义 header Value 字段只写值**。`Cache-Control: public, ...` 整段塞进去会拼出 `Cache-Control: Cache-Control: ...`。

## 音乐播放器

16. **track click 直接表达 play intent**。**不要**加「仅当已经在播放才自动播放」之类的 guard。`useMusicPlayerState` 用 play-intent flag 串起 `audio.load()` → `audio.play()`。
17. **移动端绝不能自动打开播放器**。`MusicPlayer` 的 mobile auto-open guard 删掉就完蛋。

## 媒体 / 资源

18. **`cdn.arsvine.com` 桶只放行 `arsvine.com` 与 `*.arsvine.com` Referer**。localhost 与空 Referer 被拒。本地必须用 `scripts/dev-host-setup.cmd`。
19. **COS 流量是计费的**。流量包不是硬上限，超出后按用量继续扣费。务必开预算告警。
20. **大资源**（高清图、原图、音频）**绝不要**提交到 Git。`public/music/` 仍允许本地测试文件，但生产音频必须从 `cdn.arsvine.com/realm/audio/...` 拉。
21. **不要假设 `/[locale]/game` 存在**。`useLayoutRouteMode` 与 prefetch 匹配里仍有这个分支作为历史遗留，但 `pages/[locale]/game` 文件并不存在。
22. **GitHub content 路径必须做 repo-relative 校验**。`lib/content/github.ts` 已实现：拒绝绝对 URL、协议相对、前缀 `/`、反斜杠、query、hash、traversal、编码 traversal。按段切分后逐段编码。
23. **外部链接必须用 `new URL()` 解析**，不能用 `includes('github.com')` 这种子串匹配。`lib/safe-external-href.ts` 是统一 helper。

## Locale 与 proxy

24. **locale 解析顺序固定为 `NEXT_LOCALE cookie > Accept-Language > zh-CN`**。不要用 IP / 国家推断语言。`GEO_COUNTRY` cookie 仅供 UI 微调。
25. **proxy.ts 已经处理「形似 locale 但不支持」的情况**（`/fr/web/1`）。不要再加重复逻辑。

## 提交与依赖

26. **pnpm workspace 设置写在 `pnpm-workspace.yaml`**，不要写在 `package.json#pnpm`。pnpm 11 忽略 package-level 的 `pnpm` key。
27. **新单测统一放 `tests/<area>/`**。不要再把 `.test.ts` 放在源码旁边。

## 测试覆盖现状

```text
tests/
├── lib/           # 纯逻辑：blog-client、format-reading-time、i18n-data 等
├── components/    # 组件快照 / 渲染断言
├── hooks/         # useBlogPostState、useAdaptivePerformance 等
├── i18n/          # proxy 助手、locale helpers
├── pages/         # 页面级 SSG / revalidate 行为
└── repo/          # 仓库内 fixtures + 内容回放
```

跑全套需要 Node 24 + pnpm 11，CI 通过 `pnpm check` 串 lint / typecheck / test / build。
