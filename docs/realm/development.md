---
title: 开发维护
description: 本地命令、COS Referer 工作流、字体、媒体、提交前检查。
---

# 开发维护

## 运行时

- Node.js：`24.x`（生产与 Vercel 项目设置都是这个）。`package.json` 的 `engines.node` 是权威。
- 包管理器：pnpm（`packageManager: pnpm@11.7.0`）。
- 框架：Pages Router，**不要**换成 App Router。
- 服务端入口：`server.js`（dev 与 prod 都用它），不要用 `next dev` / `next start`。

`server.js` 加载 `.env.local`、准备 Next、处理 `PORT` 环境变量、跑 graceful shutdown。`proxy.ts` 才是 locale 中间件入口。

## 快速开始

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

打开 `http://localhost:3000`，`proxy.ts` 会把 `/` 308 重定向到 `/zh-CN`（取决于 `NEXT_LOCALE` cookie 与 `Accept-Language`）。

## 常用命令

```bash
pnpm dev           # node server.js
pnpm build         # next build
pnpm start         # cross-env NODE_ENV=production node server.js
pnpm lint          # eslint .
pnpm typecheck     # tsc --noEmit
pnpm test          # vitest run
pnpm check         # lint + typecheck + test + build
```

单测：

```bash
pnpm vitest run lib/blog-client.test.ts
pnpm vitest run -t "reading time"
```

Vitest 用 `jsdom`，匹配 `**/*.test.ts`。新单测统一放 `tests/<area>/`，已分 `lib` / `components` / `hooks` / `i18n` / `pages` / `repo` 六个目录（GOTCHAS.md 第 27 条）。不要再把 `.test.ts` 放在源码旁边。

## 本地 COS Referer 工作流

`cdn.arsvine.com` 桶只放行 Referer 匹配 `arsvine.com` / `*.arsvine.com`。localhost 与空 Referer 会被拒。

为了本地能用真 COS 资源，提供一个 Windows helper：

```powershell
scripts\dev-host-setup.cmd          # 全流程：UAC 提权 + 改 hosts + 启 dev server（端口 80）+ 退出清理
scripts\dev-host-setup.cmd -HostsOnly   # 只改 hosts，自己用 $env:PORT=80; pnpm dev 启
scripts\dev-host-setup.cmd -Remove      # 清理 hosts / proxy
```

`-HostsOnly` 模式后，浏览器开 `http://dev.arsvine.com` 即可命中本地 80 端口、且 Referer 是 `dev.arsvine.com`，COS 桶会放行。

## 本地 COS workspace

`cos-workspace/` 完全是本地工作目录，**必须**在 `.gitignore` 里。

```bash
pnpm assets:prepare      # 把 cos-workspace/public-root-legacy/ 镜像重写成 cos-workspace/public-root/
pnpm assets:build        # 处理图片/音频，产 dist/cos-upload/{public,private}-root + dist/local-manifest/manifest.generated.json
pnpm assets:build -- --publish-current   # 同时把 current.json 切到新版本（不写 current.next.json）
pnpm assets:publish      # 上传 + 触发 revalidate
pnpm assets:publish -- --dry-run
pnpm assets:publish -- --rollback 20260710T120000Z
pnpm assets:publish -- --force-full      # 一次性全量重传
```

`pnpm assets:prepare` 期望 `cos-workspace/public-root-legacy/` 是当前线上公开桶的镜像。详见 `website/asset-pipeline` 与 `website/cos-and-cdn`。

## 数据与文案编辑

改站点 / 作品 / 经历 / 生活 / 友链 / 技能 / 文案，优先动这些文件，**不要**绕到组件逻辑里写死：

```text
data/                 # 站点元信息、各 topic 三语数据
content/blog/init/    # 兜底博文
locales/              # next-intl UI 文案
public/               # 静态图、图标、本地音乐测试文件
config/               # 远端图床白名单等小配置
```

新增 locale 必须同步：

1. `i18n/config.ts`（locales + 各 map + helpers）
2. `locales/<locale>.json`
3. `data/<topic>/<locale>.ts`（每个 topic）
4. `lib/i18n-data.ts` 静态注册表
5. `proxy.ts` 的 locale 检测（如需支持新的 Accept-Language tag）

## 远端图床白名单

集中在 `config/image-hosts.js`，按 Next.js `images.remotePatterns` 规范写：

```js
{ protocol: 'https', hostname: 'cdn.arsvine.com', ... }
{ protocol: 'https', hostname: 'placehold.co', ... }
{ protocol: 'https', hostname: 'images.unsplash.com', ... }
```

加 / 删域名只动这一个文件，**不要**复制到 `next.config.js`。

默认白名单的来源：

- `cdn.arsvine.com` — 腾讯云 COS 香港桶 `arsvine-cdn`，承载所有自有图、封面、图集、字体、装饰
- `placehold.co` — `data/*.ts` 的占位图
- `images.unsplash.com` / `source.unsplash.com` — 模板示例图

大图走 `cdn.arsvine.com` + `unoptimized={true}`，避免烧 Vercel Hobby Image Optimization 配额。

## 字体托管

Realm 把 Google Fonts 搬到 `cdn.arsvine.com/shared/fonts/`，不在 `fonts.googleapis.com` 拉——国内访问 Google Fonts 不稳定。三个字族：

- `Dosis` 300/400/500（HUD UI 主力）
- `Noto Sans SC` 300/400/500/700（中文正文 + 部分粗体）
- `Noto Serif SC` 400/700（MDX 阅读体）

`data/site.ts` 的 `fonts.googleStylesheet` 是真理之源。改完后：

```bash
node scripts/fetch-google-fonts.mjs
# 然后按 website/font-hosting 通过 coscli 上传 public/_fonts-staging/ 到 cos://shared/fonts/
```

上传时 COS 元数据要严格：

| 对象 | Content-Type | Cache-Control |
|---|---|---|
| `google-fonts.css` | `text/css; charset=utf-8` | `public, max-age=86400, must-revalidate` |
| `*.woff2` | `font/woff2` | `public, max-age=31536000, immutable` |

COS 自定义 header 的 Value 字段**只能写值**，不能把 `Cache-Control: ...` 整个粘进去。写错会导致 `Cache-Control: Cache-Control: ...`，Firefox 会拒收字体，传统中文偶现「豆腐字」。GOTCHAS.md 第 3 条。

## 提交前

至少：

```bash
pnpm check
```

UI / 交互改动还要手验：

- 桌面、移动端布局
- 首页 → 内容聚合 → 详情的过渡
- 公开博文 + 受保护博文
- 移动端 hash 导航到 content 段
- 音乐播放器开关 / 切歌
- 自定义光标 hover label / BACK 状态
- CJK / 带音 Latin 字形渲染
