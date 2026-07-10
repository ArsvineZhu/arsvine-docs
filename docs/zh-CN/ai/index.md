---
title: 概览
description: AI 相关系统：自适应性能、地理信号、内容采集。
---

# AI Systems 概览

「AI」一词在 Realm 语境里指**智能 / 自适应系统**，不是 chatbot。Realm 没有对话式 persona；它的「智能」是隐式的：

- 客户端自适应性能分层（根据设备与运行时 FPS 切换能力位）
- Vercel 边缘地理信号驱动 UI 微调
- 第三方内容源（Hitokoto / Tweets）的内容采集与渲染

本节按子系统分篇。**没有**神秘的内部 AI 模型。

## 阅读顺序

1. `adaptive-performance` — `useAdaptivePerformance` 的四档、采样、档位迁移
2. `geo-and-region` — GEO_COUNTRY cookie 与 region-only UI 微调
3. `hitokoto-and-tweets` — Hitokoto 一言代理与 Tweet 月份归档
4. `agent-workflow` — 维护者侧 AI 编码 agent 的协作约定（CLAUDE.md / AGENTS.md / docs/ 的分工）
