---
title: 内容来源
description: data/ 类型化数据 + content/ 兜底 + 外部 GitHub 仓库的运行时层。
---

# 内容来源

Realm 项目把「内容」明确分成三层，**任何一层都不是完整的 source of truth**——它们互相补全、互相回退。

## 1. 仓库内类型化数据（`data/`）

所有结构化内容（作品、经历、生活、友链、技能、站点元信息）都在 `data/` 下，每个 topic 按 locale 切分：

```text
data/
├── site.ts                 # 站点元信息（站名、author、tagline、social、fonts、locale）
├── music.ts                # 音乐播放列表（早期遗留，运行时走 COS 目录）
├── projects/
│   ├── index.ts            # zh-CN 兜底
│   ├── en.ts
│   └── zh-TW.ts
├── experience/
│   ├── index.ts
│   ├── en.ts
│   └── zh-TW.ts
├── life/
│   ├── index.ts
│   ├── en.ts
│   └── zh-TW.ts
├── skills/
│   ├── index.ts
│   ├── en.ts
│   └── zh-TW.ts
└── friendLinks/
    ├── index.ts
    ├── en.ts
    └── zh-TW.ts
```

### 静态注册

`lib/i18n-data.ts` 是 locale → 模块的显式静态注册表，提供：

| 函数 | 行为 |
|---|---|
| `loadProjects(locale)` | 返回 `webProjects` / `gameProjects` / `earlyProjects` / `copyableTokens` |
| `loadLife(locale)` | 返回 `gameData` / `travelData` / `otherData` / `alsoPlayGames` / `artPlaceholderText` |
| `loadExperience(locale)` | 返回 `experienceData` |
| `loadFriendLinks(locale)` | 返回 `friendLinksData` |
| `loadSkills(locale)` | 返回 `skillCategories` / `skillsData` |
| `loadServices()` | 单语（友链页底部致谢区，从 `data/site.ts` 的 `pages.friends.services` 读） |
| `loadMessages(locale)` | 异步，加载 `locales/<locale>.json` 的 UI 文案 |

`resolveWebProject(id, locale)` 与 `resolveLifeItem(slug, locale)` 提供单条解析的 fallback 链：

```text
当前 locale 命中 → source / translated
当前 locale 缺译、origin locale 可读 → 走 origin locale → fallback
否则 → 走 defaultLocale → fallback
```

返回的 `TranslationStatus`（`'source' | 'translated' | 'fallback'`）让详情页能展示 LocaleFallbackBanner。

### 为什么用静态注册表

不要把显式注册替换成动态 `require`。Pages Router 在 Node 侧做数据加载，动态 `require` 会触发 webpack 的 Critical dependency 警告，并让打包结果变得不可预测。GOTCHAS.md 与 CLAUDE.md 都显式标注了这条。

## 2. 仓库内兜底（`content/`）

只有 `content/blog/init/` 一项：六个 locale 的内置兜底文章（`zh-CN.mdx` `zh-TW.mdx` `en.mdx` `ja.mdx` `ru.mdx` `fr.mdx`），在外部内容仓库未配置时充当博客的占位内容。

## 3. 外部 GitHub 内容仓库

当以下环境变量齐全时，**运行时**从私有 GitHub 仓库拉取：

```dotenv
GITHUB_OWNER=ArsvineZhu
GITHUB_REPO=arsvine-content
GITHUB_BRANCH=main
GITHUB_READ_TOKEN=github_pat_xxx
```

期望仓库结构：

```text
blog-index.json
blog/<slug>/
  zh-CN.mdx
  zh-TW.mdx
  en.mdx
  ja.mdx    # 可选
  ru.mdx    # 可选
  fr.mdx    # 可选
tweets/
  index.json
  YYYY-MM.json
```

UI locales 与内容 locales 是**两套**。UI locales 只有 `zh-CN` / `zh-TW` / `en`；内容 locales 在此基础上可叠加 `ja` / `ru` / `fr`。多出来的内容 locale 走博文详情页内的语言切换器，不改变 UI 语言。

缺译时仍走 `lib/i18n-data.ts` 的 fallback 链，并在详情页渲染 LocaleFallbackBanner。

## 4. Tweet 压测模式

开发期可以开 `TWEETS_STRESS_TEST=1`，让 tweets 页面渲染合成数据（不再依赖外部仓库），可用 knob：

- `TWEETS_STRESS_YEARS`
- `TWEETS_STRESS_MONTHS_PER_YEAR`
- `TWEETS_STRESS_TWEETS_PER_MONTH`

生产环境**绝不要**开。

## 安全约束

`lib/content/github.ts` 在拼 GitHub Contents API 路径前会严格 normalize：

- 拒绝绝对 URL、协议相对 URL
- 拒绝前缀 `/`、反斜杠、query、hash、traversal、编码后的 traversal
- 按段切分后逐段编码
- URL 由固定可信的 GitHub API base 拼装

GOTCHAS.md 第 22 条专门强调这点。任何把用户输入直接喂进 `lib/content/github.ts` 的改动都要先重新阅读。
