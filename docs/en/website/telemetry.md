---
title: Telemetry
description: Client telemetry is off by default, opt-in via env. Event API and isolation boundary.
---

# Telemetry

Realm's telemetry is **off by default and opt-in via env**. It does not participate in any business logic; providers are only mounted when enabled.

## Enabling

```dotenv
NEXT_PUBLIC_TELEMETRY_PROVIDER=vercel
```

- Empty → no provider mounted
- `vercel` → mount `@vercel/analytics` and `@vercel/speed-insights`

`components/telemetry/TelemetryRoot.tsx` renders a `<VercelTelemetry />` child (also in `components/telemetry/`). The child only imports provider packages when `NEXT_PUBLIC_TELEMETRY_PROVIDER === 'vercel'`.

## Event API

Business components **do not** import provider packages directly. They go through `trackTelemetryEvent` in `lib/telemetry.ts`:

```ts
trackTelemetryEvent('blog_protected_unlock', { group: 'friends-a' })
```

`trackTelemetryEvent` behavior:

- During SSR: `typeof window === 'undefined'` → return immediately
- Client provider not enabled → return
- Otherwise: dynamic `import('@vercel/analytics').then(({ track }) => track(name, properties))`
- Load failure: caught, `console.warn` (dev only), never pollutes the upper layer

`properties` must be `Record<string, string | number | boolean | null>`; objects / arrays / functions are not accepted.

## Interaction with protected posts

- The protected-post state machine (`useBlogPostState`) **does not** call `trackTelemetryEvent`. Post metadata such as group or slug does not leak via telemetry.
- Custom events from business code are only allowed after a TOTP unlock succeeds. Event payloads must not contain the cleartext TOTP code.

## Dev / preview

`/api/hitokoto` runs in dev too. Vercel Analytics / Speed Insights only fire in production (the `@vercel/analytics` package itself gates by environment).

## Privacy

- No PII is collected (no email, no IP persistence, no cookie identifier)
- The list of event names is not published in this doc to avoid leaking it as a reconnaissance surface
- Business components must not read `process.env.NEXT_PUBLIC_*` to decide whether to send events; they always go through `lib/telemetry.ts`

## Disabling

Empty / remove / set `NEXT_PUBLIC_TELEMETRY_PROVIDER` to anything other than `vercel` → no provider is mounted, effective on next deploy. Old events already collected remain in the Vercel console under separate management.
