---
description: "Use when editing game runtime integration, scene/item/rule registration, or host app wiring with the engine. Enforce public API boundaries and platform adapter usage."
name: "Engine Public Boundary"
applyTo:
  - "app/**/*.ts"
  - "app/**/*.tsx"
  - "lib/**/*.ts"
  - "lib/**/*.tsx"
---

# Engine Integration Boundary

- Treat app/lib/engine/publicApi.ts and app/lib/platform-web.ts as the only stable integration surface for host-app code.
- In host-facing code, import runtime state/actions/components from publicApi, not from internal engine paths.
- Avoid introducing imports from app/lib/engine/runtime/_, app/lib/engine/render/_, or app/lib/engine/movement/\* in feature/UI code. If a task requires internal engine work, allow exceptions with explicit justification in the change description.
- Keep browser interoperability behind platform-web adapters. Prefer ports/adapters over direct window, document, navigator, localStorage, and fetch usage in shared runtime logic.
- Preserve SSR-safe behavior: any browser-dependent logic must have safe fallback behavior when window is unavailable.
- If you change publicApi exports or platform-web contracts, treat it as contract-sensitive work:
  - update docs/LIBRARY_API_CONTRACT_V1.md and docs/LIBRARY_CONSUMPTION_GUIDE.md when needed
  - ensure npm run lint, npm run test, and npm run build succeed

# Next.js Version Guardrail

- This repository uses a Next.js version with breaking changes compared to common defaults.
- Before applying framework-level patterns, verify current guidance in node_modules/next/dist/docs/ and heed deprecations.
