# 《11:52》ARG 整合开发仓库 V1.0

这是当前全部冻结设计、结构化数据、UI参考、媒体生产合同与可运行原型的统一仓库。

## 当前完成度

- 第一至第十册：已整合；
- 完整设计与数据：`P00—A5-07`；
- 当前可运行原型：`P00—A2-11`；
- 30个可见App：均可打开并完成基础交互；
- 本地存档、刷新恢复、事件与幂等：已实现；
- 第十一册QA试玩、第十二册发布运维：待完整Alpha后冻结。

## 首先阅读

```text
AGENTS.md
docs/authority/DOCUMENT_INDEX.md
docs/authority/INPUT_MANIFEST.json
docs/roadmap/REMAINING_WORK.md
```

## 目录

```text
docs/bibles/              第一至第十册最新权威文档
docs/audits/              跨册逻辑、谜题和媒体审计
data-packs/scene-event/    P00—A5-07场景、触发器、事务、结局与周目数据
data-packs/media/          人物、地点、物件、照片、视频和音频生产合同
references/ui/             全量现实App与iOS界面参考
source-packs/              原始ZIP包留档
tooling/codex/             Codex开发规则、Schema、提示词与测试合同
content/                   当前P00—A2运行时内容
src/                       当前React/TypeScript原型
tests/                     单元、模型和Playwright测试
```

## 启动

要求：Node.js 22.12+，pnpm 11.13.1。

```bash
corepack enable
pnpm install
pnpm verify
pnpm dev
```

访问：

```text
http://127.0.0.1:4173
```

完整校验：

```bash
pnpm qa
python3 scripts/verify_integrated_repository.py
```

## 下一开发阶段

1. 将`data-packs/scene-event/`接入运行时，扩展A3—A5；
2. 按`references/ui/`完成中性高保真复刻；
3. 绑定现实地点`LOC_RIVER_EDU_OLD_01`；
4. 按`data-packs/media/`制作正式媒体；
5. 形成完整Alpha后制作第十一册；
6. 公开发布前制作第十二册与风险清单。

当前界面仍是中性原型，不是最终视觉稿。
