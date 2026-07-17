# AGENTS.md — 《11:52》整合开发仓库最高规则

## 0. 启动顺序

任何任务开始前必须依次读取：

1. `docs/authority/DOCUMENT_INDEX.md`
2. `docs/authority/FROZEN_DECISIONS.md`
3. `docs/authority/INPUT_MANIFEST.json`
4. 当前任务涉及的权威册次或数据包
5. `docs/roadmap/REMAINING_WORK.md`

不得读取或引用仓库外的旧版设计文档作为权威输入。

## 1. 权威顺序

发生冲突时按以下顺序裁决：

1. 当前用户明确的新指令；
2. `docs/authority/FROZEN_DECISIONS.md`；
3. 第一册 World Bible；
4. 第二册 Narrative Bible；
5. 第七册 A3/A4/A5 内容生产分册；
6. 第八册 Puzzle & Evidence Bible；
7. 第三册 Systems Bible；
8. 第四册 Content Bible；
9. 第十册 Scene & Event Data Bible 及 `data-packs/scene-event/`；
10. 第九册 Media Asset Bible 及 `data-packs/media/`；
11. 第五册 UI / Art Bible 及 `references/ui/`；
12. 第六册 Codex Development Bible、本文件、PLAN与任务提示；
13. 临时搜索结果与实现推测。

剧情正史冲突时，上位叙事文档优先；数据字段冲突时，第十册可机读包优先；视觉冲突时UI原始参考图优先。

## 2. 当前状态

- 完整设计与结构化数据覆盖：`P00—A5-07`。
- 当前运行时完成：`P00—A2-11`中性可玩原型。
- 第十一册与第十二册尚未冻结，Codex不得自行补写。
- 现实地点令牌 `LOC_RIVER_EDU_OLD_01` 尚未绑定，正式A3/A4地图媒体不得发布。

## 3. 禁止擅自创作

除非用户明确授权，不得修改或新增：

- 世界真相、错层规则、身份锚点规则；
- 人物关系、动机、日期、密码`230917`；
- 正式对白、帖子、新闻、谜题答案；
- 场景ID、结局条件、周目规则；
- 现实App导航结构与页面语法。

发现缺口必须记录为 `TODO-CONTENT`、`REFERENCE-GAP` 或 `CONFLICT_REPORT`，不得用自创内容掩盖。

## 4. 数据实施规则

- `GameState`是运行时唯一剧情事实源。
- 所有关键行为归一化为`StoryEvent`。
- 所有剧情变化由Trigger + Condition + Action原子事务产生。
- `data-packs/scene-event/`是A3—A5接入的正式结构化输入。
- 关键事务必须幂等并支持刷新恢复。
- UI组件不得保存无法从GameState、事件日志或内容包重建的隐藏剧情状态。

## 5. 世界响应来源

所有响应必须标记：

- `H`：人物主动行为；
- `A`：沈川预设程序；
- `P`：潘博文异常接口；
- `C`：现实修正副作用。

NPC只能依据自身知识状态和已收到材料回应，不能凭空知道玩家点击了什么。

## 6. 内容语义规则

- 所有可见App必须可打开并产生合理反馈。
- 普通生活内容不少于约65%，但每条正式内容必须承担人物、关系、时空、职业、社会背景、主题或修正基线中的至少一种功能。
- `clueRole: none`是正常状态，不能把所有日常内容变成谜题。
- 每个ContentItem必须具有NarrativeMetadata，并连接世界事实、人物特征、关系节拍或跨App连续性节点。
- 同源副本不能被计为多个独立见证。

## 7. 视觉规则

- `references/ui/11_52_UI_Reference_Pack_V1.0_全量版/`是唯一视觉事实。
- 不得凭记忆制作“像iPhone/微信/小红书”的通用页面。
- 先完成中性DOM/CSS复刻与Playwright截图对比，再注入剧情内容。
- 不得用整张截图作为不可交互背景。
- 目标主视口：`402x874`；回归视口：`440x956`。

## 8. 媒体规则

- `data-packs/media/`中的人物、地点、物件与资产ID为正式合同。
- 先制作正常母图，R0—R5必须从同一母图局部编辑。
- AI偶然瑕疵不得升级为新线索。
- 人物、地点与关键物件必须跨资产连续一致。
- 媒体失败时必须存在字幕、关键帧、冻结镜像或其他补救路径。

## 9. 测试门禁

每个任务至少运行适用的：

- TypeScript typecheck；
- JSON/Schema/引用校验；
- 单元与模型测试；
- Playwright主路径；
- 刷新恢复；
- 视觉快照；
- 谜题可达性与幂等检查。

不得通过删除断言、跳过场景、清空存档或写死状态让测试通过。

## 10. 变更控制

修改冻结内容前必须更新：

- `docs/authority/CHANGE_REQUEST.md`
- `docs/authority/CONFLICT_REPORT.md`

说明受影响册次、场景、数据迁移与测试范围。不得为了代码方便改变正史。

## 11. 完成定义

任务只有在以下条件同时满足时才算完成：

1. 使用权威数据合同；
2. 页面可交互并可正确返回；
3. 刷新后状态正确；
4. 关键行为产生规范事件；
5. 视觉符合参考；
6. 自动测试通过；
7. 无未记录逻辑缺口；
8. 无无意义填充内容；
9. 未越过现实地点与未完成册次的生产门禁。
