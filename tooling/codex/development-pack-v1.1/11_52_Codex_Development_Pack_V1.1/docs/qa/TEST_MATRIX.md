# TEST_MATRIX.md

| 层级 | 重点 | 示例 |
|---|---|---|
| 单元 | 条件、动作、答案规范化、内容变体 | `normalizeMorseAnswer`, `applySetContentVariant` |
| 模型 | 状态图、幂等、证据可达、归并风险 | 重放事件日志得到同一GameState |
| 组件 | 锁屏、聊天行、照片信息、备忘录普通化 | 键盘输入、撤回、滑动、阅读阈值 |
| E2E | P00—A2-11完整路径与替代路径 | 新存档到417_index.json |
| 视觉 | 真实参考对比 | 402x874与440x956 |
| 持久化 | 刷新、崩溃恢复、迁移 | A2-09事务中断恢复 |
| 降级 | 离线、媒体失败、引用缺失 | carrier.wav失败时字幕/波形补救 |
| 全App | 所有桌面图标 | 打开、一次有效交互、返回、刷新 |

| 内容语义 | NarrativeMetadata、世界事实引用、孤儿内容、线索密度 | `verify_narrative_semantics.mjs` |
| 生活世界 | 角色案外生活、跨App连续性、修正前价值 | DAILY_CONTENT_AUDIT |
