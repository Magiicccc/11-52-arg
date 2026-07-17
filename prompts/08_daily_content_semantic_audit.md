# 08 日常内容语义审计

## 目标

审计P00—A2-11全部可见内容，确保普通帖子、聊天、订单、照片、收藏和浏览历史均具有明确人物/关系/世界功能，同时避免把所有内容都改成线索。

## 必须读取

- Narrative Bible V1.1 第57—62章
- Systems Bible V1.3 第74—79章
- Content Bible V1.2 第12A—12H、75—76章
- `docs/implementation/CONTENT_AUTHORING_WORKFLOW.md`
- `docs/qa/DAILY_CONTENT_AUDIT.md`

## 任务

1. 为全部ContentItem补齐NarrativeMetadata。
2. 建立worldFacts、characterTraits、relationshipBeats与continuityLinks注册表。
3. 删除或重写无法连接任何叙事节点的孤儿内容。
4. 保持早期普通生活内容约65%以上，direct clue保持少数。
5. 不得新增剧情事实或自由创作正式文本；缺失内容登记TODO-CONTENT。
6. 运行Schema、引用和叙事语义校验。

## 验收

- `node scripts/verify_content_references.mjs content/case-001`
- `node scripts/verify_narrative_semantics.mjs content/case-001`
- 输出`DAILY_CONTENT_AUDIT_REPORT.md`
