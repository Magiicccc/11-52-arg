# 《11:52》Codex Development Pack V1.1

本包是第六册《Codex Development Bible V1.1》的可执行附件。它不包含前五册正文和 45MB 的视觉参考原图；使用前请把冻结输入复制到项目的 `docs/bibles/` 与 `references/ui/`。

## 必需输入

1. `11_52_World_Bible_V1.0_第一册_完整定稿.docx`
2. `11_52_Narrative_Bible_V1.1_第二册_日常叙事与生活世界修订版.docx`
3. `11_52_Systems_Bible_V1.3_第三册_内容语义与生活世界修订版.docx`
4. `11_52_Content_Bible_V1.2_第四册_日常叙事与生活世界修订版.docx`
5. `11_52_UI_Art_Bible_V1.4_第五册_全量现实界面冻结版.docx`
6. 解压后的 `11_52_UI_Reference_Pack_V1.0_全量冻结版/`

使用 `python scripts/verify_authority_inputs.py --project-root .` 校验文件名与 SHA-256。

## 首个实施目标

冻结垂直切片：`P00—A2-11`，预计 45—60 分钟。结束条件为玩家取得 `file.417_index`，并已经经历：

- 双手机开局；
- 调查手机六位密码 `230917`；
- 普通生活探索；
- 沈川姓名的多源证明；
- 第四张人脸；
- 玩家头像第一次短暂默认化；
- 潘博文搜索、416/417/418 楼层矛盾；
- 正常 404 下的旧雨17缓存入口；
- 摩斯密码 `FRAME 417`；
- `验证记录_07`被普通化；
- 文件传输助手收到 `417_index.json`。

## Codex 开始前

1. 阅读根目录 `AGENTS.md`。
2. 阅读 `PLAN.md`。
3. 校验冻结输入。
4. 不得先写剧情页面。先完成仓库基线、状态合同、事件引擎与中性 UI 复刻。
5. 每个任务结束时运行本任务规定的测试和截图回归。


## V1.1新增：日常叙事语义门禁

- 普通内容可以没有线索，但不得没有叙事功能。
- 每个正式 `ContentItem` 必须携带 `NarrativeMetadata`。
- 内容必须连接人物、关系、世界事实、时间、地点、职业、习惯、情绪对照或连续性节点。
- 不得使用随机闲聊、Lorem ipsum、运行时生成评论或“只为填满列表”的内容。
- 使用 `node scripts/verify_narrative_semantics.mjs content/case-001` 执行零孤儿内容审计。
