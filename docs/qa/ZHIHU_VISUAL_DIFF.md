# GitHub Pages 知乎视觉差异

日期：2026-07-18

测试地址：<https://magiicccc.github.io/11-52-arg/>

测试视口：402×874、440×956

## 三方证据

冻结参考根目录：

`references/ui/11_52_UI_Reference_Pack_V1.0_全量版/apps/zhihu/`

主要冻结截图：

`raw/ZH-HOME-01__ZHIHU_11.1.0_01_home_or_answer.jpg`

| 状态 | before 线上截图 | 冻结参考 | after 线上截图 |
| --- | --- | --- | --- |
| 首页 | `test-results/live-before/zhihu-home-402x874.png` | `raw/ZH-HOME-01__ZHIHU_11.1.0_01_home_or_answer.jpg` | `test-results/live-after/zhihu-home-402x874.png` |
| 搜索结果 | `test-results/live-before/zhihu-search-402x874.png` | `measurements.json`、`implementation-contract.md` | `test-results/live-after/zhihu-search-402x874.png` |
| 问题详情 | `test-results/live-before/zhihu-question-402x874.png` | `state-matrix.md` | `test-results/live-after/zhihu-question-402x874.png` |
| 评论区 | `test-results/live-before/zhihu-comments-402x874.png` | `state-matrix.md` | `test-results/live-after/zhihu-comments-402x874.png` |
| 404 | `test-results/live-before/zhihu-404-402x874.png` | `implementation-contract.md` | `test-results/live-after/zhihu-404-402x874.png` |
| 缓存入口 | `test-results/live-before/zhihu-cache-after-402x874.png` | `implementation-contract.md` | `test-results/live-after/zhihu-cache-after-402x874.png` |

before 与 after 均由 Playwright 直接访问 GitHub Pages 生成。before 截图记录了 CSS 请求遭连接重置后的真实未样式化状态；after 截图仅在审计脚本确认 `.prototype-stage` 的生产 CSS 已应用后生成。

## 专用结构

知乎不经过 `GenericApp`。运行时使用 `ZhihuApp`，其内部具有以下独立视图状态：

- 首页推荐流；
- 搜索结果；
- 问题详情；
- 评论区；
- 404 失效页；
- 页面底部归档元数据与缓存入口。

首页具有顶部导航、关注/推荐/热榜、问题卡片、作者与身份、摘要、赞同、评论、收藏和底部导航。详情具有问题标题、描述、话题、关注、回答数量、作者、正文、展开、赞同、评论、收藏、分享。404 首先呈现平台失效页，隐藏入口位于页面底部归档元数据，不是显眼谜题按钮。

## 已修复

- 不再是“标题 + 两条列表 + 大片空白”的通用模板。
- 内容卡片密度、分隔、字体层级、作者身份和互动信息接近冻结 iPhone 结构。
- 首页、搜索、详情、评论、404 和缓存入口都能在线打开。
- 点赞、收藏、返回滚动位置和刷新恢复由 Playwright 覆盖。
- 正常玩家模式不显示交互等级、本地模拟账号、Content ID、Scene ID 或 Trigger ID。
- `zhihu.answer.01` 与 `page.zhihu.deleted.01` 的冻结正文继续从现有内容选择器读取，没有改写正式内容。

## 内容真实性边界

现有知乎首页含 10 条生活向静态 UI 卡片和少量正式内容，主题覆盖互联网、缓存、用户研究、城市生活、摄影和文件管理。静态卡片有 `narrativeFunction` 分类，但尚未进入正式 Content Registry，也没有完整 NarrativeMetadata。因此本轮保留其既有结构，不新增或随机生成帖子，并将知乎评级保持为 `PARTIAL`。

## 尚未达到冻结参考

- “想法流、个人主页、AI 模块”没有覆盖冻结 state matrix 的完整状态。
- 评论层级、长回答排版、图片媒体和部分操作动画未逐像素复刻。
- 中性字标头像不是正式人物媒体；本轮没有生成或引入未授权人物正脸。
- 生活向静态卡片需要内容团队依据 Content Bible 补齐正式 NarrativeMetadata 后，才能作为生产内容验收。
- 部分图标与平台字体使用系统替代字形，存在细微视觉差异。

## 自动验证

以下检查在 402×874 与 440×956 均通过：

- 知乎首页、搜索、问题详情、评论、404、缓存入口；
- 点赞、收藏和滚动位置刷新恢复；
- 正常玩家模式开发标签扫描；
- GitHub Pages online-test 20/20 总体通过。
