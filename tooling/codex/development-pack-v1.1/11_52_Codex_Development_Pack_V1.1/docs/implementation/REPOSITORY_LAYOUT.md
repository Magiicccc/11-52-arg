# REPOSITORY_LAYOUT.md

```text
11-52/
├── AGENTS.md
├── PLAN.md
├── package.json
├── pnpm-lock.yaml
├── vite.config.ts
├── playwright.config.ts
├── docs/
│   ├── bibles/
│   ├── authority/
│   ├── implementation/
│   └── qa/
├── references/
│   └── ui/11_52_UI_Reference_Pack_V1.0_全量版/
├── public/
│   └── media/case-001/
├── content/
│   └── case-001/
│       ├── manifest.json
│       ├── scenes/
│       ├── apps/
│       ├── triggers/
│       ├── evidence/
│       ├── variants/
│       └── localization/
├── src/
│   ├── app/
│   ├── shell/
│   ├── apps/
│   ├── engine/
│   ├── persistence/
│   ├── content/
│   ├── media/
│   ├── contracts/
│   └── styles/
├── tests/
│   ├── unit/
│   ├── model/
│   ├── e2e/
│   ├── visual/
│   └── fixtures/
└── scripts/
```

原则：内容数据与React组件分离；事件引擎与视觉组件分离；真实参考资产与剧情媒体分离。

## V1.1新增内容语义文件

```text
content/case-001/context/
  world-facts.json
  character-traits.json
  relationship-beats.json
  continuity-links.json
scripts/verify_narrative_semantics.mjs
docs/qa/DAILY_CONTENT_AUDIT.md
```
