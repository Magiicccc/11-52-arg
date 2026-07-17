# CONTENT_AUTHORING_WORKFLOW.md

## 原则

普通内容可以没有线索，但不得没有叙事功能。内容生产顺序固定为：

1. 选择人物、关系或世界事实；
2. 确定现实App中的表面用途；
3. 选择 `primaryFunction` 与可选次要功能；
4. 填写 `firstReadValue`；
5. 决定 `clueRole`，默认优先使用 `none`；
6. 建立跨App连续性引用；
7. 如有修正版本，填写 `recontextualizedValue`；
8. 通过 Schema、引用和语义审计；
9. 再进入UI与交互实现。

## 禁止

- 为了填满瀑布流而随机生成帖子；
- 让每条内容都暗示417、潘博文或错层；
- 只写“增强真实感”而没有具体人物/世界事实；
- 把正式内容交给运行时大模型自由生成；
- 先写异常版本，后补普通生活母版。

## 最低内容卡

```yaml
id: content.daily.xxx
surfacePurpose: 现实App中的正常用途
primaryNarrativeFunction: relationship
secondaryNarrativeFunctions: [characterization]
clueRole: none
worldFactIds: []
characterTraitIds: []
relationshipBeatIds: [rel.xxx]
continuityLinkIds: []
firstReadValue: 玩家第一次看到时理解什么
recontextualizedValue: 可选
payoffPolicy: optional
```
