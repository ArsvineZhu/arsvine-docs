---
title: Agent 协作
description: 维护者与 AI 编码 agent 协作时的输入约定、决策边界、PR 模板、CI 关卡。
---

# Agent 协作

Realm 是「AI 编码 agent 友好」的项目。维护者侧（人类）与编码 agent 协作时，遵循以下分工。

## 文档分工

| 文件 | 角色 | 谁能动 |
|---|---|---|
| `CLAUDE.md` | 入口索引，必须短 | 仅维护者改动 |
| `AGENTS.md` | 硬规则 + 「常见危险区」清单 | 仅维护者改动 |
| `docs/DEVELOPMENT.md` | 本地命令、COS Referer、字体、媒体 | 维护者 / agent 协同 |
| `docs/ARCHITECTURE.md` | 路由 / 内容 / 保护博文 / API / 过渡 / 样式 / 3D | 维护者 / agent 协同 |
| `docs/OPERATIONS.md` | 部署 / env / CDN / COS / ISR / Upstash / SEO | 维护者 / agent 协同 |
| `docs/PERFORMANCE.md` | 自适应性能分层 | 维护者 / agent 协同 |
| `docs/ASSETS.md` | COS 发布流水线 | 维护者 / agent 协同 |
| `docs/GOTCHAS.md` | 27 条历史回归点 | 维护者 / agent 协同 |
| `docs/superpowers/specs/...` | 设计 spec（设计阶段输出） | agent 在 spec 阶段可写 |
| `tests/<area>/` | 测试代码 | agent 可写 |

## 硬规则（agent 必须遵守）

1. Pages Router，**不**进 App Router
2. **不**替换 `server.js`
3. 内部跳转用 `useTransition().navigateTo()`
4. **不**基于 IP / 国家选语言
5. **不**动态 `require` locale 数据
6. **不**重新引入 `reading-time`
7. **不**为翻译 / 用户内容挂 `--font-display`
8. `coscli` 只用临时环境变量注入的密钥
9. 受保护 MDX **不**进静态产物
10. 保留 `useBlogPostState.ts` / `lib/blog-post-state.ts` 的 reducer / effect 竞态修复

修改相关代码前必读 `docs/GOTCHAS.md` 对应条目。

## 决策边界

agent **可以**直接做的事：

- 改 `data/<topic>/<locale>.ts` 内容
- 改 `locales/<locale>.json` 文案
- 改 `data/site.ts` SEO / 字体 / 社交
- 加 `tests/<area>/<name>.test.ts` 测试
- 修 `components/...` 内部实现（不改对外接口）
- 改 `scripts/...` 内部实现
- 修 `docs/...` 内容（不改结构）

agent **必须先报告**的事：

- 新增 / 删除 env var
- 改 `package.json` 的 dependencies / devDependencies
- 改 `next.config.js` / `server.js` / `proxy.ts` / `i18n/config.ts`
- 改 `pages/[locale]/_app.tsx` / `_document.tsx`
- 改 `hooks/useBlogPostState.ts` / `lib/blog-post-state.ts`（受保护博文状态机）
- 改 `scripts/assets-publish.mjs`（涉及 coscli 凭据 + 指针切换）
- 改 `data/site.ts` 的 `fonts.googleStylesheet`（需同步抓取与上传）

agent **绝不做**的事：

- 提交 COS secret、GitHub PAT、TOTP 密钥、access-grant secret 到任何位置
- 移除 GOTCHAS.md 已记录的脆弱约定的对应 fix
- 改 locale 解析顺序
- 跳过 `enforceRateLimit()` 把 revalidate / protected-verify 暴露成无限制端点
- 在 `_next/data/...` JSON 里塞受保护博文正文（即便加密过）

## PR 模板

任何改动发 PR 时，描述必须包含：

1. **意图**（一句话）
2. **影响面**（哪些文件 / 哪些路由 / 哪些 locale）
3. **手动验证**（dev 端 + 桌面 / 移动）
4. **关联 issue**（如有）
5. **CI 通过截图**（`pnpm check` 输出 + 4 个 SSR 路径 200 截图）
6. **回滚步骤**（如发版后需要）

## CI 关卡

```bash
pnpm check
```

= `pnpm lint` + `pnpm typecheck` + `pnpm test` + `pnpm build`。四关全过才合并。

Vercel 部署会自动跑 SSG 预渲染；任何 SSG 错误（缺 `getStaticPaths`、locale 不匹配、循环依赖）会直接挂在 build 阶段。

## 设计 spec

复杂改动（多文件 / 多日 / 多 locale 影响）必须先有 `docs/superpowers/specs/<date>-<topic>-design.md`。spec 包含：

- 现状（参考当前实现 + 已有 docs）
- 目标（要解决的 user-visible / maintenance-visible 问题）
- 设计（API shape + 数据流 + 关键决策）
- 验证（dev 端、prod 端、回滚）

agent 可以在 spec 阶段写初稿，但 spec 最终签字由维护者做。
