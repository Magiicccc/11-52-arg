# STACK_AND_COMMANDS.md

## 技术栈

- React + TypeScript strict + Vite
- CSS Modules + CSS Custom Properties
- Zustand（UI订阅与轻量Store外壳）
- Immer（事务性不可变更新）
- Zod（运行时Schema）
- Dexie（IndexedDB）
- Vitest + Testing Library
- Playwright

## 初始化原则

使用执行时的当前稳定版本初始化，立即提交 `pnpm-lock.yaml`。后续除非有明确任务，不升级依赖。

## 预期脚本

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "typecheck": "tsc -b --pretty false",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:visual": "playwright test --grep @visual",
    "validate:content": "tsx scripts/validate-content.ts",
    "validate:authority": "python scripts/verify_authority_inputs.py --project-root .",
    "qa": "pnpm typecheck && pnpm test && pnpm test:e2e && pnpm build"
  }
}
```

## 权限建议

优先在项目工作区内使用可写沙箱，并对网络访问或工作区外写入采用按需批准。不要在普通开发机上使用绕过审批与沙箱的危险模式。

## V1.1内容语义命令

- `pnpm verify:narrative` → `node scripts/verify_narrative_semantics.mjs content/case-001`
- `pnpm qa`必须包含Schema、引用与叙事语义三类门禁。
