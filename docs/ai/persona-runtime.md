---
title: Persona Runtime
description: 站点内「人设层」的总体设计、输入边界与可解释性约束。
---

# Persona Runtime

## 定位

Persona Runtime 是 Arsvine Realm 中可见的「人设层」运行时。它不是聊天机器人，而是一组在 UI、过渡、内容生成之间共享的「人设约束 + 状态」。

## 关键约束

- **不写私密内容**：Persona 的输入与输出都在「可以公开」的红线内
- **可降级**：Persona 失效时页面仍能正常展示；不允许把任何关键渲染路径绑死在 Persona 上
- **可观察**：每个 Persona 决策都附带可解释的「为什么」，方便事后审计

## 输入边界

- 用户输入：评论、博客订阅、TOTP 校验结果
- 系统输入：当前路由、当前语言、当前资源版本
- 静态输入：站点文案（`locales/*.json`）、站点元信息（`data/site.ts`）

## 输出边界

- UI 文案：走 `locales/`，不直接生成
- 过渡决策：只影响 HUD 与过渡，不修改路由
- 解释性文本：必须走「先落库，再发布」的链路，不允许动态内联到静态产物

## 与受保护博文的关系

- Persona 不读取受保护博文的具体内容
- 仅消费「这篇博文是否解锁、属于哪个 TOTP 分组」这两条元信息

## 安全红线

- Persona 任何上下文都不允许出现 COS secret、TOTP 密钥、access cookie 密钥
- Persona 的「个性化回复」必须先经过内容审核通道

## 后续

视觉语义管线与 Agent 工作流分别在 `visual-semantic-pipeline.md` 与 `agent-workflow.md`。
