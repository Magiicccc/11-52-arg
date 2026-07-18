# 小红书真实性验收

- 评级：**PASS**
- 运行时组件：`XiaohongshuApp`
- 部署 commit：`worktree`
- Workflow：`local`
- 线上地址：http://127.0.0.1:4173/
- 内容规模：24 篇笔记 / 48 条评论 / 24 名作者
- 交互覆盖：68 个控件；有效 67；合理禁用 1；失效 0

## 视觉证据

- before：[402×874 首页](../../../../test-results/full-realism/before/xiaohongshu/home-402x874.png)
- 冻结参考：[contact sheet](../../../../references/ui/11_52_UI_Reference_Pack_V1.0_全量版/apps/xiaohongshu/contact-sheet.jpg)
- after：[402×874 首页](../../../../test-results/full-realism/after/xiaohongshu/home-402x874.png)
- after 详情：[402×874 详情](../../../../test-results/full-realism/after/xiaohongshu/detail-402x874.png)

## 门禁结果

- 使用专用首页、导航、详情与交互状态，不经过 GenericApp。
- 正常玩家模式不显示内部 ID、场景 ID、交互等级或临时开发说明。
- 可见控件全部有效、合理禁用或提供世界内反馈；没有静默失败。
- 页面可滚动或具有与原生 App 相符的分页/手势结构；关键状态写入统一存档投影。
- 普通内容使用静态可复现数据与 NarrativeMetadata；未改写冻结主线内容。

## 剩余差异

- 正式媒体、浏览器字体栅格和原生系统动画仍可能与真实 iOS 存在像素级差异。
- 地点与 temporary 媒体继续遵循生产令牌边界；未用虚构现实地址或 AI 瑕疵补线索。
