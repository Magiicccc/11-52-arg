# App 真实性修复第二轮

审计日期：2026-07-18

当前线上 commit：`d0f6ab5d165b63979eb6bc108bbd96e73fc566df`

Workflow：<https://github.com/Magiicccc/11-52-arg/actions/runs/29640396718>

线上地址：<https://magiicccc.github.io/11-52-arg/>

## GenericApp 处理结论

`src/apps/GenericApp.tsx` 已删除。运行时 30 个可见 App 均由专用组件路由；未知 App ID 只进入中性的不可用状态，不再进入通用成品页面。

before 的典型问题可见于 [日历 before](../../test-results/ui-pass-2/before/calendar-home-402x874.png)：页面只有统一标题、一条列表和大片空白。after 的 [日历月视图](../../test-results/ui-pass-2/after/calendar-home-402x874.png) 已包含月份、日期网格、日程列表和详情入口。冻结基准为 [日历 contact sheet](../../references/ui/11_52_UI_Reference_Pack_V1.0_全量版/apps/calendar/contact-sheet.jpg)。

## 本轮移除 GenericApp 的 10 个 App

| App | after 专用结构 | 最低可信交互 | before / after 证据 | 冻结参考 | 当前评级 |
| --- | --- | --- | --- | --- | --- |
| 日历 | 月视图、日程列表、日程详情 | 日期选择、打开日程 | [before](../../test-results/ui-pass-2/before/calendar-home-402x874.png) / [after](../../test-results/ui-pass-2/after/calendar-home-402x874.png) | [参考](../../references/ui/11_52_UI_Reference_Pack_V1.0_全量版/apps/calendar/contact-sheet.jpg) | READY |
| 网易云音乐 | 我的、推荐歌单、播放器、历史 | 打开歌单/播放页 | [before](../../test-results/ui-pass-2/before/netease-music-home-402x874.png) / [after](../../test-results/ui-pass-2/after/netease-music-home-402x874.png) | [参考](../../references/ui/11_52_UI_Reference_Pack_V1.0_全量版/apps/netease_music/contact-sheet.jpg) | PARTIAL |
| 微信读书 | 书架、阅读页、批注、进度 | 打开书籍/切换批注 | [before](../../test-results/ui-pass-2/before/wechat-reading-home-402x874.png) / [after](../../test-results/ui-pass-2/after/wechat-reading-home-402x874.png) | 冻结 App 目录 | PARTIAL |
| 铁路12306 | 首页、行程、订单详情、乘车人 | 查询/打开历史行程 | [before](../../test-results/ui-pass-2/before/railway12306-home-402x874.png) / [after](../../test-results/ui-pass-2/after/railway12306-home-402x874.png) | [参考](../../references/ui/11_52_UI_Reference_Pack_V1.0_全量版/apps/railway12306/contact-sheet.jpg) | READY |
| 健康 | 摘要、步数、活动、趋势 | 打开趋势/切换周期 | [before](../../test-results/ui-pass-2/before/health-home-402x874.png) / [after](../../test-results/ui-pass-2/after/health-home-402x874.png) | [参考](../../references/ui/11_52_UI_Reference_Pack_V1.0_全量版/apps/health/contact-sheet.jpg) | READY |
| 天气 | 当前天气、小时预报、七日预报、城市 | 切换城市 | [before](../../test-results/ui-pass-2/before/weather-home-402x874.png) / [after](../../test-results/ui-pass-2/after/weather-home-402x874.png) | [参考](../../references/ui/11_52_UI_Reference_Pack_V1.0_全量版/apps/weather/contact-sheet.jpg) | READY |
| 时钟 | 世界时钟、闹钟、秒表、计时器 | 标签切换/闹钟开关 | [before](../../test-results/ui-pass-2/before/clock-home-402x874.png) / [after](../../test-results/ui-pass-2/after/clock-home-402x874.png) | [参考](../../references/ui/11_52_UI_Reference_Pack_V1.0_全量版/apps/clock/contact-sheet.jpg) | READY |
| 相机 | 取景器、模式条、快门、最近照片 | 模式切换/快门反馈 | [before](../../test-results/ui-pass-2/before/camera-home-402x874.png) / [after](../../test-results/ui-pass-2/after/camera-home-402x874.png) | [参考](../../references/ui/11_52_UI_Reference_Pack_V1.0_全量版/apps/camera/contact-sheet.jpg) | PARTIAL |
| 语音备忘录 | 录音列表、播放器、波形、新录音 | 播放/新录音反馈 | [before](../../test-results/ui-pass-2/before/voice-memos-home-402x874.png) / [after](../../test-results/ui-pass-2/after/voice-memos-home-402x874.png) | [参考](../../references/ui/11_52_UI_Reference_Pack_V1.0_全量版/apps/voice_memos/contact-sheet.jpg) | READY |
| 指南针 | 罗盘、方向、角度、位置状态 | 旋转反馈 | [before](../../test-results/ui-pass-2/before/compass-home-402x874.png) / [after](../../test-results/ui-pass-2/after/compass-home-402x874.png) | [参考](../../references/ui/11_52_UI_Reference_Pack_V1.0_全量版/apps/compass/contact-sheet.jpg) | READY |

“PARTIAL”表示已脱离通用模板并具备正确的信息架构，但媒体或像素级品牌细节仍未达到冻结参考的完整复刻；它不表示功能入口为空。

## 已有专用 App 的第二轮改进

- 小红书：首页改为可滚动双列瀑布流，卡片进入笔记详情，返回后恢复滚动位置；
- 抖音：使用纵向媒体流和独立操作层，当前索引可恢复；
- 今日头条：频道导航、新闻密集列表、详情与返回恢复；
- QQ邮箱、百度网盘、支付宝、滴滴：使用各自平台的导航、搜索/功能区、列表和详情结构；
- 美团、淘宝：保留平台类目、订单/商品卡片与详情；
- 知乎：推荐问答之外新增想法流和个人主页；问题详情、评论、404 与缓存入口继续由专用组件承载；未加入冻结参考之外的 AI 模块。

## 玩家可见开发文字

正常页面不显示 `A级交互`、`B级交互`、`C级交互`、`本地模拟账号`、`临时页面`、`占位组件`、`参考不足`、内部 App/Scene/Trigger/Content ID。构建 commit 和 Workflow 仅在 `?qa=1` 中显示。

## 自动验证

- 10 个原 GenericApp App 逐一打开；
- 每个 App 首屏非空；
- 每个 App 至少执行一次有效交互；
- 页面中 `.generic-app` 和 `.generic-detail` 数量均为 0；
- 全仓 Playwright：30 passed / 0 failed；
- 线上 after 工件：140 张截图 + 1 份元数据，覆盖 402×874、440×956 的全部可见 App 首页与详情。

## 尚未达到真实复刻标准

- 网易云音乐、微信读书和相机使用可信结构与冻结色彩/密度，但正式封面、真实取景媒体和更完整的品牌微交互仍是 P2。
- 多个 App 使用冻结允许的几何/色块媒体占位；本轮没有生成真实人物正脸、现实地点或新异常。
- 12306、支付宝等平台的图标细节以本地 CSS 符号表达，尚非逐像素官方资源。
- 本轮没有开始 A4，也没有改变剧情、谜题、触发器或 GameState 语义。
