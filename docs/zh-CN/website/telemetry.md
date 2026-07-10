---
title: 遥测
description: 客户端遥测默认关闭；按 env 启用。事件 API 与隔离边界。
---

# 遥测

Realm 的遥测是**默认关闭、按 env 启用**。它不参与任何业务逻辑，只在「被打开」时挂载 provider。

## 启用

```dotenv
NEXT_PUBLIC_TELEMETRY_PROVIDER=vercel
```

- 留空 → 不挂载任何 provider
- 设 `vercel` → 挂载 `@vercel/analytics` 与 `@vercel/speed-insights`

`components/telemetry/TelemetryRoot.tsx` 渲染一个 `<VercelTelemetry />` 子组件（同样在 `components/telemetry/`），后者在 `NEXT_PUBLIC_TELEMETRY_PROVIDER === 'vercel'` 时才真正 import provider 包。

## 事件 API

业务组件**不**直接 import provider 包，统一走 `lib/telemetry.ts` 的 `trackTelemetryEvent`：

```ts
trackTelemetryEvent('blog_protected_unlock', { group: 'friends-a' })
```

`trackTelemetryEvent` 行为：

- SSR 阶段：`typeof window === 'undefined'` → 直接 return
- 客户端 provider 未启用 → return
- 真正发：动态 `import('@vercel/analytics').then(({ track }) => track(name, properties))`
- 加载失败：catch 里 `console.warn`（仅 dev），不污染上层

`properties` 必须是 `Record<string, string | number | boolean | null>`，不接对象 / 数组 / 函数。

## 与受保护博文的交互

- 受保护博文的状态机（`useBlogPostState`）**不**调 `trackTelemetryEvent`。博文元数据包含的 group / slug 不会通过遥测泄露。
- 仅在 TOTP 验证成功后才允许业务侧发自定义事件；事件 payload 也不能包含明文 TOTP code。

## dev / preview

`/api/hitokoto` 在 dev 也会跑。Vercel Analytics / Speed Insights 仅在 production 生效（`@vercel/analytics` 包内自己判断环境）。

## 隐私

- 不采 PII（无邮箱、无 IP 持久化、无 cookie 标识）
- 事件 name 列表不写到公开文档——避免被滥用为侦察入口
- 业务组件禁止直接读 `process.env.NEXT_PUBLIC_*` 来判断是否发事件，统一走 `lib/telemetry.ts`

## 关闭

把 `NEXT_PUBLIC_TELEMETRY_PROVIDER` 留空 / 删掉 / 设为其他非 `vercel` 值 → 不挂载任何 provider，下次部署生效。已发出的旧事件留在 Vercel 控制台里，单独管理。
