# 知乎视觉差异报告

日期：2026-07-17

分支：`fix/ui-realism-pass-1`

测试视口：402×874、440×956

## 对照范围

冻结参考以 `references/ui/11_52_UI_Reference_Pack_V1.0_全量版/apps/zhihu/` 为准，主要结构参考为：

- `raw/ZH-HOME-01__ZHIHU_11.1.0_01_home_or_answer.jpg`
- `annotated/ZH-HOME-01__annotated.jpg`
- `manifest.json`
- `measurements.json`
- `state-matrix.md`
- `implementation-contract.md`

改动前基线为 `docs/qa/ui-current/current-zhihu-screen.png`。该页面由 `GenericApp` 生成，仅有重复标题、两条剧情内容、灰色文字头像和大片空白。

## 改动后截图

自动截图由 `tests/e2e/ui-realism.spec.ts` 生成，位于 `test-results/visual/zhihu/`：

| 状态 | 402×874 | 440×956 |
| --- | --- | --- |
| 首页 | `home-402.png` | `home-440.png` |
| 搜索结果 | `search-402.png` | `search-440.png` |
| 问题详情 | `detail-402.png` | `detail-440.png` |
| 评论区 | `comments-402.png` | `comments-440.png` |
| 404 | `404-402.png` | `404-440.png` |
| 缓存入口出现 | `cache-entry-before-402.png` | `cache-entry-before-440.png` |
| 缓存记录展开 | `cache-entry-after-402.png` | `cache-entry-after-440.png` |

主屏幕前后对照：

- 改动前：`docs/qa/ui-current/current-home-screen.png`
- 改动后：`test-results/visual/home/home-402.png`、`home-440.png`

## 结构差异

| 项目 | 改动前 | 改动后 |
| --- | --- | --- |
| 页面宿主 | `GenericApp` 通用模板 | `ZhihuApp` 专用页面 |
| 首页导航 | 通用返回栏和重复标题 | 知乎顶部栏、关注/推荐/热榜、底部导航 |
| 内容密度 | 2 条主线条目 | 12 条混合内容，可继续滚动 |
| 卡片语法 | 统一灰色方块和两行列表 | 标题、作者、身份、摘要、赞同、评论、收藏 |
| 内容比例 | 直接剧情内容占全部 | 普通技术/用户研究/城市生活/摄影/文件管理为主体，正式内容占少数 |
| 详情层级 | 字段表 | 问题、描述、话题、关注/回答、作者、正文、相关推荐、底部操作 |
| 评论 | 无 | 独立评论页和排序栏 |
| 搜索 | 无 | 搜索输入、结果分类和平台式结果列表 |
| 404 | 普通列表项 | 独立失效页；缓存入口位于首屏以下的存档元数据 |
| 状态保存 | 组件内临时状态 | 点赞、收藏与滚动位置写入现有统一状态并在刷新后恢复 |

## 内容与权威约束

- `zhihu.answer.01` 的冻结问题和回答正文通过内容选择器读取，没有改写。
- `page.zhihu.deleted.01` 的冻结失效页标题和归档时间通过内容选择器读取，没有改写。
- 普通内容只用于复刻信息密度和生活世界，不创建新谜题、答案、角色关系、异常或剧情门。
- 所有内容打开、点赞和收藏行为继续发出规范 StoryEvent；UI 状态复用现有 `world.flags` 与 `scrollByRoute`，未改变 GameState 合同。
- 缓存入口不再是首屏显眼的谜题按钮，必须先进入 404 再向下滚动到页面存档元数据。

## 自动检查结果

`tests/e2e/ui-realism.spec.ts` 在两个视口共 8 项通过，覆盖：

- 主屏幕四列几何、Dock、页面圆点和数字角标；
- 知乎首页、搜索、详情、评论、404、缓存入口前后；
- 点赞、收藏、返回滚动位置与刷新恢复；
- 30 个玩家手机 App 的正常模式开屏、返回及开发标签扫描。

## 尚未达到冻结包完整状态矩阵的部分

本轮按用户明确收窄的第一阶段只完成主屏幕与知乎核心路径。知乎冻结 manifest 中的“想法流、个人主页、AI 模块”尚未制作专用页面；首页头像目前为本地生成的中性字标，未引入未授权人物照片；评论层级和长回答展开已具备结构，但仍未达到逐像素官方素材复刻。上述缺口不影响本轮要求的首页、搜索、详情、评论、404 与缓存入口流程。
