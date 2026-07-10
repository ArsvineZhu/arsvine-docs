---
title: 外部内容仓库
description: GitHub Contents API、私有仓库结构、UI locale vs 内容 locale、回退链。
---

# 外部内容仓库

Realm 在生产环境从私有 GitHub 仓库 `arsvine-content` 拉博文与 tweet。仓库未配置时回退到内置兜底。

## 启用

`.env.local` 完整配置：

```dotenv
GITHUB_OWNER=ArsvineZhu
GITHUB_REPO=arsvine-content
GITHUB_BRANCH=main
GITHUB_READ_TOKEN=github_pat_xxx
```

`GITHUB_READ_TOKEN` 必须能读私有仓库。`GITHUB_BRANCH` 默认 `main`；切换 preview / production 时改这里。

仓库未配置：

- 博文回退到 `content/blog/init/`（内置 6 个 locale 兜底）
- tweets 回退到空状态
- 受保护博文自然不可用

## 期望仓库结构

```text
arsvine-content/
├── blog-index.json
├── blog/
│   └── <slug>/
│       ├── zh-CN.mdx
│       ├── zh-TW.mdx
│       ├── en.mdx
│       ├── ja.mdx        # 可选内容 locale
│       ├── ru.mdx        # 可选内容 locale
│       └── fr.mdx        # 可选内容 locale
└── tweets/
    ├── index.json
    └── YYYY-MM.json
```

`blog-index.json` 是 slug → 元数据 + access 信息的索引；`<locale>.mdx` 是单篇正文，含 frontmatter（`title`、`date`、`tags`、可选 `access`）。

`tweets/index.json` 是月份倒序索引；每月一份 `YYYY-MM.json` 是当月 tweet 数组。

## UI locale vs 内容 locale

- **UI locales**：`zh-CN` / `zh-TW` / `en`（来自 `i18n/config.ts`）
- **内容 locales**：UI locales + 可选 `ja` / `ru` / `fr`

可选内容 locale 走博文详情页内的语言切换器，**不**改变 UI 语言。也就是说 `/zh-CN/blog/<slug>` 可以看 `ja.mdx` 版本的正文，但 UI 仍是简体中文。

## GitHub API 路径安全

`lib/content/github.ts` 在拼 Contents API 路径前严格 normalize：

- 拒绝绝对 URL（`http://`、`https://`、`//`）
- 拒绝前缀 `/`、反斜杠 `\`
- 拒绝 query string、hash fragment
- 拒绝 traversal（`..`、编码后的 `%2e%2e` 等）
- 按段切分后逐段 URL encode
- 固定 base `https://api.github.com/repos/{owner}/{repo}/contents/...`

任何把用户输入直接喂进 `lib/content/github.ts` 的改动都要先重读 GOTCHAS.md 第 22 条。

## 回退链

`lib/i18n-data.ts` 的 `resolveWebProject` / `resolveLifeItem` 提供 fallback：

```text
请求 (id, locale)
  → 当前 locale 命中 → 'source' (locale === origin) 或 'translated'
  → 当前 locale 缺译、origin locale 可读 → 走 origin locale → 'fallback'
  → 否则 → 走 defaultLocale (zh-CN) → 'fallback'
```

返回的 `TranslationStatus` 让详情页能渲染 LocaleFallbackBanner（`components/shared/LocaleFallbackBanner.tsx`），提示用户「此 locale 没有翻译，显示的是源语言」。

## 触发 ISR

外部仓库更新后，**必须**调一次：

```bash
curl -X POST https://arsvine.com/api/revalidate-content \
  -H 'content-type: application/json' \
  -d '{"secret":"<REVALIDATE_SECRET>","slug":"<blog-slug>"}'
```

不传 `slug` 时只重建 `/{locale}/content`；传了 `slug` 还会重建 `/<locale>/blog/<slug>` 全部 locale。该端点 rate-limited 30/min per client。

Tweet 仓库更新：

```bash
curl -X POST https://arsvine.com/api/revalidate \
  -H 'content-type: application/json' \
  -d '{"secret":"<REVALIDATE_SECRET>"}'
```

## 兜底文章

`content/blog/init/` 内的 6 个 locale 文件是「仓库未配置 / 拉取失败」时的兜底：

- `zh-CN.mdx` 是 source
- 其他 locale 的兜底是简版或外文版，按团队维护

兜底不参与 ISR trigger；它走 SSG `getStaticProps` 直接产出。
