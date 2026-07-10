# Arsvine Docs

> Technical notes, system manuals, and engineering records for Arsvine Realm and related experiments.

公开的 Arsvine 文档站，部署在 `https://docs.arsvine.com`。

## 这是什么 / 这不是 什么

- 这是面向**人**和**AI 读取**的工程手册：架构、部署、SEO、安全、内容流水线
- 这**不是**主站 `arsvine-realm/docs/` 的镜像。`arsvine-realm/docs/` 偏内部、偏实现细节、给维护者 / 编码 Agent 看；本站偏结构化、偏解释、偏长期索引

## 技术栈

- [Rspress](https://rspress.rs/) — 文档站框架，基于 Rspack
- pnpm 11
- TypeScript 配置
- Markdown / MDX
- `@rspress/plugin-sitemap`
- 部署：Vercel（独立项目）+ Cloudflare DNS

## 本地开发

```bash
pnpm install
pnpm dev          # 开发服务器，默认 http://localhost:5173
pnpm build        # 生产构建，产物在 doc_build/
pnpm preview      # 预览生产构建
pnpm format       # 运行 prettier
```

## 目录结构

```text
arsvine-docs/
├─ docs/                  文档源文件（Markdown / MDX）
│  ├─ index.md            首页
│  ├─ realm/              主站工程与架构
│  ├─ website/            部署、DNS、COS、SEO、安全
│  ├─ ai/                 Persona Runtime、视觉语义、Agent 工作流
│  └─ design/             视觉语言与设计约定
├─ theme/                 Rspress basic-theme 自定义入口
├─ rspress.config.ts      站点配置
├─ vercel.json            Vercel 部署配置
└─ package.json
```

## 添加一页文档

1. 在 `docs/<section>/` 下新建 `<slug>.md`
2. 顶部写 frontmatter：

   ```md
   ---
   title: 页面中文名
   description: 一句话说明，不重复 title，且不出现密钥 / 真实路径 / 内部代号
   ---
   ```

3. 在 `rspress.config.ts` 的对应 `sidebar.<section>` 中追加一项
4. `pnpm dev` 验证

## llms.txt

`llms: true` 会在 `pnpm build` 之后产出：

- `doc_build/llms.txt` — 页面索引（标题 + 描述）
- `doc_build/llms-full.txt` — 完整 Markdown
- 每个页面对应一份 `doc_build/<path>/index.md`

这些文件供 LLM / Agent 读取，无需爬 HTML。

## 内容红线

以下内容**禁止**写进公开文档：

- `.env.local` 中的任何 secret
- GitHub Token / PAT
- COS `SecretId` / `SecretKey` / `SessionToken`
- TOTP 密钥
- 私有桶路径
- 真实高价值资源映射
- 未公开朋友信息
- Vercel / Cloudflare 后台截图里带敏感字段的部分

可以写「流程」和「字段名」，不能写「真实密钥」和「私有路径」。

## 部署

### Vercel 项目设置

| 项 | 值 |
|---|---|
| Framework Preset | Other |
| Install Command | `pnpm install` |
| Build Command | `pnpm build` |
| Output Directory | `doc_build` |
| Node.js Version | 22.x |

> 这些也写在了 `vercel.json` 里，Vercel 应当自动读取。

### 域名绑定

1. Vercel → Project → Settings → Domains → 添加 `docs.arsvine.com`
2. Vercel 提供一个 CNAME 目标（形如 `cname.vercel-dns.com`）

### Cloudflare DNS

```text
Type: CNAME
Name: docs
Target: <Vercel 提供的 CNAME>
Proxy status: DNS only   # 首次验证阶段保持 DNS only
```

HTTPS 由 Vercel 自动签发。验证通过后可以视情况启用 Cloudflare 代理。

## 仓库

- GitHub: <https://github.com/ArsvineZhu/arsvine-docs>
- 主站: <https://arsvine.com>
