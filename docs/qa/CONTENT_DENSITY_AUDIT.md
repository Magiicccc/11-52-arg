# 内容密度审计

审计日期：2026-07-18

当前线上 commit：`d0f6ab5d165b63979eb6bc108bbd96e73fc566df`

线上地址：<https://magiicccc.github.io/11-52-arg/>

## 视觉证据

| App | before 线上截图 | 冻结参考 | after 线上截图 |
| --- | --- | --- | --- |
| 小红书 | [before](../../test-results/ui-pass-2/before/xiaohongshu-home-402x874.png) | [contact sheet](../../references/ui/11_52_UI_Reference_Pack_V1.0_全量版/apps/xiaohongshu/contact-sheet.jpg) | [after](../../test-results/ui-pass-2/after/xiaohongshu-home-402x874.png) |
| 今日头条 | [before](../../test-results/ui-pass-2/before/toutiao-home-402x874.png) | [contact sheet](../../references/ui/11_52_UI_Reference_Pack_V1.0_全量版/apps/toutiao/contact-sheet.jpg) | [after](../../test-results/ui-pass-2/after/toutiao-home-402x874.png) |
| 知乎 | [before](../../test-results/ui-pass-2/before/zhihu-home-402x874.png) | [contact sheet](../../references/ui/11_52_UI_Reference_Pack_V1.0_全量版/apps/zhihu/contact-sheet.jpg) | [after](../../test-results/ui-pass-2/after/zhihu-home-402x874.png) |

完整 402×874 与 440×956 首页/详情证据位于 `test-results/ui-pass-2/before/` 和 `test-results/ui-pass-2/after/`。

## 正式内容数据

本轮新增 [ui-pass2-content-items.json](../../content/case-001/apps/ui-pass2-content-items.json)，共 39 个 ContentItem；每项均包含 `NarrativeMetadata`、来源根、初始变体与世界事实/人物/连续性链接，没有运行时随机生成填充。

| App | 本轮新增 | 当前正式 ContentItem 总数 |
| --- | ---: | ---: |
| 小红书 | 13 | 15 |
| 抖音 | 4 | 5 |
| 今日头条 | 9 | 10 |
| QQ邮箱 | 3 | 5 |
| 百度网盘 | 4 | 5 |
| 支付宝 | 3 | 4 |
| 滴滴 | 3 | 4 |
| 合计 | 39 | 58 |

仓库当前共有 95 个正式 ContentItem。内容校验结果为：

- `95 content items`
- `orphan=0`
- 当前可见内容 `78`
- 当前可见直接线索 `3`，占 `3.8%`

## 本轮新增内容构成

| NarrativeMetadata 分类 | 数量 | 比例 |
| --- | ---: | ---: |
| `world_context` | 26 | 66.7% |
| `habit` | 5 | 12.8% |
| `profession` | 4 | 10.3% |
| `relationship` / `emotional_contrast` | 2 | 5.1% |
| `continuity` / `theme` | 2 | 5.1% |
| `clueRole: direct` | 0 | 0% |
| `clueRole: supporting` | 14 | 35.9% |
| `clueRole: none` | 25 | 64.1% |

普通世界背景达到建议区间下沿。新增内容没有直接线索，避免在 UI 修复轮擅自增加剧情；全量当前可见直接线索 3.8% 略低于建议的 5%—10%，该差异被保留为内容权威约束，而不是用新谜题补齐。

## 运行时密度与状态

- 小红书：15 个正式卡片，首页滚动高度超过 2 个视口；
- 抖音：5 个正式媒体条目，可连续切换；
- 今日头条：10 个正式条目，首屏后可继续滚动；
- QQ邮箱、百度网盘、支付宝、滴滴：分别有 5 / 5 / 4 / 4 个正式条目，并与平台功能区、搜索区或汇总区混排；
- 知乎：12 个推荐问答卡片，另有 8 条想法流和独立个人主页；
- 美团、淘宝使用 Content Bible 已有正式订单/商品，并以已有世界事实中的普通类目补足平台结构，没有增加案件事实。

小红书和今日头条的 Playwright 测试明确验证滚动、进入详情、返回后滚动位置恢复。其他平台的点赞、收藏、浏览或打开动作继续通过统一 StoryEvent 和现有 UI 状态存储，不在组件中写剧情布尔值。

## 已解决

- 不再只有两条案件内容或大片空白；
- 普通生活、职业习惯、人物关系与少量既有异常混排；
- 不同平台使用不同标题长度、作者、时间和互动数据；
- 所有新增正式内容都有 NarrativeMetadata；
- 小红书与今日头条已验证详情返回滚动恢复；
- 知乎新增想法流、个人主页、普通问答与不同作者头像；
- 未加入冻结参考中未确认的 AI 模块。

## 尚未完全解决

- QQ邮箱、百度网盘、支付宝和滴滴当前正式条目数量足以形成可信首屏，但尚未达到 Content Bible 中面向最终产品的完整历史规模；继续扩充必须由冻结内容输入驱动。
- 当前可见直接线索占比 3.8%，低于建议值，但本轮禁止新增剧情，因此没有人工制造线索。
- 一些普通卡片使用色块封面而非正式媒体；这是媒体生产债务，不应由随机图片替代。
- 除小红书和今日头条外，全部平台的“返回后精确滚动位置”仍需在后续测试矩阵中逐个加入专门断言。
