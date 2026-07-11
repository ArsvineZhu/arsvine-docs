# AGENTS.md

你是一位熟悉 JavaScript、Rspress v2、Markdown/MDX 与文档站工程开发的专家。你编写的代码与文档保持可维护、可访问、事实准确。

本项目是 **ARSVINE REALM** 的公开文档站（Rspress v2 静态站点），部署在 `https://docs.arsvine.com`。它描述主站 `arsvine-realm` 的架构、部署、SEO、安全与内容流水线，但**不是**主站 `arsvine-realm/docs/` 的镜像--本站偏结构化、偏解释、偏长期索引。

## Commands

```bash
pnpm install      # 安装依赖
pnpm dev          # 开发服务器，http://localhost:5173
pnpm build        # 生产构建，产物输出到 doc_build/
pnpm preview      # 本地预览生产构建
pnpm format       # Prettier 格式化
```

包管理器是 **pnpm 11**。不要切换到 npm/yarn。

## Docs

- Rspress 官方文档（LLM 友好）：<https://rspress.rs/llms.txt>
- Rspress 全量文档：<https://rspress.rs/llms-full.txt>
- 本项目 README：`./README.md`（部署、DNS、内容红线、目录结构）
- 本站自带的 LLM 索引：`pnpm build` 后产物 `doc_build/llms.txt` 与 `doc_build/llms-full.txt`

## 项目结构

```text
arsvine-docs/
├─ docs/                  文档源（Markdown / MDX）
│  ├─ index.md            中文首页（默认语言）
│  ├─ realm/              主站工程与架构（中文）
│  ├─ website/            部署、DNS、COS、SEO、安全（中文）
│  ├─ ai/                 自适应性能、地理可见性、Agent 协作（中文）
│  ├─ design/             视觉语言与设计约定（中文）
│  └─ en/                 英文版（结构与中文一一对应）
├─ theme/                 Rspress 主题入口（仅 re-export theme-original + 全局 CSS）
├─ rspress.config.ts      站点配置（lang / locales / sidebar / llms / sitemap）
├─ vercel.json            Vercel 部署配置
└─ package.json
```

## i18n 约定（最重要）

`rspress.config.ts` 中 `lang: 'zh-CN'` 是**默认语言**。

- **默认语言（中文）的内容必须放在 `docs/` 根目录**，而不是 `docs/zh-CN/`。Rspress 会把默认语言的路由前缀去掉：`docs/realm/index.md` -> `/realm/`。
- **英文放在 `docs/en/`**，路由带前缀：`docs/en/realm/index.md` -> `/en/realm/`。
- 两个语言的目录结构、sidebar 项必须一一对应。
- **不要在 `nav` 里加「English」或「简体中文」链接**--Rspress 会根据 `locales` 配置自动渲染语言切换器。
- `i18nSource` 是一个**函数**，不是对象；它把 `zh` 文本拷贝到 `zh-CN` 键上。

## Frontmatter 约定与陷阱

- 每个内容页都应有 `title` 和 `description` frontmatter。首页用 `pageType: home` + `hero` + `features`。
- **YAML 陷阱：frontmatter 值里若含 ASCII `: `（冒号+空格），必须用双引号包起来。** 否则 js-yaml 解析失败，整块 frontmatter 会被当成正文渲染（首页会显示成裸的 `pageType: home` 文本）。中文用全角冒号 `：` 不受影响。

  ```yaml
  # 错误：会破坏解析
  description: Runtime: server.js entry, env vars.
  # 正确
  description: "Runtime: server.js entry, env vars."
  ```

- `description` 要和页面内容同语言，不重复 `title`，不出现密钥/真实路径/内部代号。
- 新增页面后，记得在 `rspress.config.ts` 的对应 `sidebar` 段（中文 `/realm/` 与英文 `/en/realm/` 都要）追加一项。

## 内容红线

**禁止**写进公开文档：`.env.local` 里的 secret、GitHub Token/PAT、COS `SecretId`/`SecretKey`/`SessionToken`、TOTP 密钥、私有桶路径、未公开的朋友信息、后台截图里的敏感字段。

可以写「流程」和「字段名」，不能写「真实密钥」和「私有路径」。

## 部署

- Vercel 独立项目，`vercel.json` 已配置：`buildCommand: pnpm build`、`outputDirectory: doc_build`、`cleanUrls: true`、`trailingSlash: false`。
- **不要在 `vercel.json` 里加 `rewrites`**（如 `/(.*) -> /$1.html`）--`cleanUrls` 已处理 `.html` 剥离，rewrite 会二次追加 `.html` 导致 404。
- 域名 `docs.arsvine.com` 通过腾讯云 DNSPod 做 CNAME 解析到 Vercel（**不是 Cloudflare**）。HTTPS 由 Vercel 自动签发。
- 推送到 `main` 分支后 Vercel 自动部署；本地可 `vercel --prod --yes` 手动触发。

## 验证

完成非平凡改动后，至少运行：

```bash
pnpm build        # 必须通过（首要成功标准）
pnpm dev          # 验证中文首页 / 与英文首页 /en/ 都正常渲染（非裸 frontmatter）
```

检查清单：首页 hero 是否渲染、sidebar 链接是否 404、语言切换器是否正常、`doc_build/llms.txt` 是否生成。
