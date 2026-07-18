# GitHub Pages App 渲染架构审计

审计对象为当前运行时 `AppHost` 路由及正常玩家网址（不带 `?qa=1`）。评级含义：

- `READY`：已有专用结构、真实导航与至少一条可验证详情流程。
- `PARTIAL`：已脱离通用模板，但受正式内容数量、媒体或冻结参考缺口限制。
- `BLOCKED`：仍由 `GenericApp` 承载；本轮没有在缺少正式内容的情况下伪造页面。

| App | 运行时组件 | GenericApp | 专用页面 | 仅通用列表 | 开发标签 | 真实导航 | 真实详情页 | 内容密度 | 评级 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 微信 | `WeChatApp` | 否 | 是 | 否 | 正常模式无 | 是 | 是 | 足够 | READY |
| 照片 | `PhotosApp` | 否 | 是 | 否 | 正常模式无 | 是 | 是 | 随场景解锁 | PARTIAL |
| Safari | `SafariApp` | 否 | 是 | 否 | 正常模式无 | 是 | 是 | 正式网页有限 | PARTIAL |
| 百度地图 | `BaiduMapApp` | 否 | 是 | 否 | 正常模式无 | 是 | 是 | 地点令牌未绑定 | PARTIAL |
| 电话 | `PhoneApp` | 否 | 是 | 否 | 正常模式无 | 是 | 是 | 随场景解锁 | PARTIAL |
| 文件 | `FilesApp` | 否 | 是 | 否 | 正常模式无 | 是 | 是 | 正式文件有限 | PARTIAL |
| 备忘录 | `NotesApp` | 否 | 是 | 否 | 正常模式无 | 是 | 是 | 正式备忘录有限 | PARTIAL |
| 日历 | `GenericApp` | 是 | 否 | 是 | 仅 `?qa=1` | 否 | 否 | 1 条正式记录 | BLOCKED |
| 设置 | `SettingsApp` | 否 | 是 | 否 | 正常模式无 | 是 | 是 | 适用 | READY |
| 小红书 | `XiaohongshuApp` | 否 | 是 | 否 | 无 | 是，双列发现流 | 是，笔记详情 | 2 条正式笔记 | PARTIAL |
| 抖音 | `DouyinApp` | 否 | 是 | 否 | 无 | 是，沉浸视频导航 | 是，播放/收藏状态 | 1 条正式视频 | PARTIAL |
| 知乎 | `ZhihuApp` | 否 | 是 | 否 | 无 | 是 | 是，问题/评论/404/缓存 | 首屏 12 卡 | PARTIAL |
| 百度贴吧 | `TiebaApp` | 否 | 是 | 否 | 无 | 是 | 帖子楼层 | 3 条正式记录 | PARTIAL |
| 今日头条 | `ToutiaoApp` | 否 | 是 | 否 | 无 | 是，频道导航 | 是，文章详情 | 1 篇正式文章 | PARTIAL |
| QQ邮箱 | `QQMailApp` | 否 | 是 | 否 | 无 | 是，邮箱导航 | 是，邮件详情 | 2 封正式邮件 | PARTIAL |
| 百度网盘 | `BaiduNetdiskApp` | 否 | 是 | 否 | 无 | 是，文件导航 | 是，文件详情 | 1 个正式文件 | PARTIAL |
| 支付宝 | `AlipayApp` | 否 | 是 | 否 | 无 | 是，服务与底栏 | 是，账单详情 | 1 条正式账单 | PARTIAL |
| 滴滴出行 | `DidiApp` | 否 | 是 | 否 | 无 | 是，地图与行程卡 | 是，行程详情 | 1 条正式行程 | PARTIAL |
| 美团 | `MeituanApp` | 否 | 是 | 否 | 无 | 是，频道与底栏 | 是，订单详情 | 1 条正式订单 | PARTIAL |
| 淘宝 | `TaobaoApp` | 否 | 是 | 否 | 无 | 是，频道与底栏 | 是，订单详情 | 1–2 条正式订单 | PARTIAL |
| 网易云音乐 | `GenericApp` | 是 | 否 | 是 | 仅 `?qa=1` | 否 | 否 | 1 条正式记录 | BLOCKED |
| 微信读书 | `GenericApp` | 是 | 否 | 是 | 仅 `?qa=1` | 否 | 否 | 1 条正式记录 | BLOCKED |
| 铁路12306 | `GenericApp` | 是 | 否 | 是 | 仅 `?qa=1` | 否 | 否 | 1 条正式记录 | BLOCKED |
| 健康 | `GenericApp` | 是 | 否 | 是 | 仅 `?qa=1` | 否 | 否 | 1 条正式记录 | BLOCKED |
| 天气 | `GenericApp` | 是 | 否 | 是 | 仅 `?qa=1` | 否 | 否 | 1 条正式记录 | BLOCKED |
| 时钟 | `GenericApp` | 是 | 否 | 是 | 仅 `?qa=1` | 否 | 否 | 1 条正式记录 | BLOCKED |
| 计算器 | `CalculatorApp` | 否 | 是 | 否 | 无 | 适用 | 适用 | 适用 | READY |
| 相机 | `GenericApp` | 是 | 否 | 是 | 仅 `?qa=1` | 否 | 否 | 1 条正式记录 | BLOCKED |
| 语音备忘录 | `GenericApp` | 是 | 否 | 是 | 仅 `?qa=1` | 否 | 否 | 1 条正式记录 | BLOCKED |
| 指南针 | `GenericApp` | 是 | 否 | 是 | 仅 `?qa=1` | 否 | 否 | 1 条正式记录 | BLOCKED |

## 玩家可见开发文字

正常网址未发现“A级交互”“B级交互”“C级交互”“本地模拟账号”“临时页面”“占位组件”“参考不足”、内部 App ID、Scene ID 或 Trigger ID。`GenericApp` 的等级和本地账号说明继续受 `isQaMode()` 严格保护，仅在显式 `?qa=1` 时出现。

## 内容真实性边界

本轮没有为填满页面而新增帖子、新闻、邮件、订单或行程。专用页面只读取 `unlockedItemsForApp()` 与 `activeBody()` 返回的正式 ContentItem；服务入口、频道标签、搜索框和底部导航属于冻结平台结构，不作为世界事实。内容数量不足的 App 因此维持 `PARTIAL`，而不是用无 NarrativeMetadata 的随机条目掩盖缺口。

知乎当前 10 条生活向卡片是既有静态 UI 数据，具有 `narrativeFunction` 分类但尚未进入正式 Content Registry；因此本审计不将知乎评为 `READY`。后续若要把这些卡片升格为正式内容，必须由 Content Bible/内容团队补齐完整 NarrativeMetadata，本轮未擅自改写冻结内容。
