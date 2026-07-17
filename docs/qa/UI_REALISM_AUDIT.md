# UI 真实性基线审计

审计日期：2026-07-17

分支：`fix/ui-realism-pass-1`

冻结视觉权威：`references/ui/11_52_UI_Reference_Pack_V1.0_全量版`

## 审计范围与基线

本轮第一阶段只实施主屏幕、通知角标、状态栏、玩家可见开发标签清理和知乎专用页面。其余现实 App 的通用模板问题在本报告登记，但不在本轮第一阶段扩展实现。

仓库原先缺少任务指定的两张当前实现截图。审计前已从未修改的 `main@046801e` 运行时补采：

- `docs/qa/ui-current/current-home-screen.png`
- `docs/qa/ui-current/current-zhihu-screen.png`

这属于 QA 基线补采，不改变运行时代码。截图视口为 402×874。

## 1. 主屏幕图标组件位置

- 组件：`src/shell/HomeScreen.tsx`
- 图标按钮：`.app-icon-button`
- 尺寸/点击热区容器：`.icon-wrap`
- 图片元素：`.icon-wrap img`
- 样式：`src/styles/global.css`
- App 清单与图标路径：`content/case-001/apps/app-manifests.json`

当前图标 DOM 为：

`button.app-icon-button > span.icon-wrap > img + i`

其中 `i` 被无条件渲染为角标。

## 2. 图标资源来源

运行时 `public/icons/**` 与冻结包 `references/ui/.../icons/**` 的 SHA-256 一致。第三方图标来自冻结包的现实品牌当前分发图标镜像；系统图标来自冻结包所列的 iOS 26 官方图标图谱裁切。

因此当前问题不是运行时误用了另一套未登记资源，而是两类问题叠加：

1. 14 个系统图标的冻结裁切 PNG 保留了图谱的白色不透明画布；
2. CSS 对已经完成圆角/透明处理的图标再次统一施加圆角裁切。

## 3. 哪些源文件本身包含白色背景

像素检查结果：

- `public/icons/system/*.png` 共 14 个文件均为 100×100、全画布不透明，四角为白色或近白色。图标主体的光学边界小于文件画布，因此会形成明显第二层白色底板。
- 对应文件为：`calculator.png`、`calendar.png`、`camera.png`、`clock.png`、`compass.png`、`files.png`、`health.png`、`notes.png`、`phone.png`、`photos.png`、`safari.png`、`settings.png`、`voice_memos.png`、`weather.png`。
- `public/icons/third_party/*.png` 共 16 个文件四角为透明像素。贴吧、头条、网盘、百度地图、滴滴等图标内部使用白色是品牌图标本身的视觉，不属于额外 CSS 外壳。

源头不是 App Store 宣传截图，而是系统图标图谱裁切时把图谱白底一起保留。修复不能靠运行时 `transform: scale()` 或 `object-fit` 放大掩盖；应生成可追踪的透明背景运行时派生资产，并保留冻结母版路径和哈希。

## 4. 哪些白边来自 CSS

当前 `.icon-wrap` 本身没有 `background`、`border` 或额外 `padding`，因此它不是白色底板来源。

存在的 CSS/浏览器层问题：

- `.icon-wrap img { border-radius: 14px; }` 对已经是完整 App 图标的资源进行了第二次裁切；
- `.icon-wrap img { object-fit: cover; }` 虽未产生留白，但与完整方形图标资源的直接 100% 显示合同不一致；
- `.app-icon-button` 没有显式清除浏览器按钮默认 `padding`，点击热区和网格视觉边界不够可控；
- 所有系统图标的白色不透明画布被上述统一圆角裁成 58×58 白色 squircle，形成截图中的“图标外再套白壳”。

## 5. 通知角标由哪个组件生成

角标在 `src/shell/HomeScreen.tsx` 内由每个 App 按钮直接生成，不是独立组件：

`<i>{state.devices[deviceId].unreadByApp[app.id] || ""}</i>`

数据源本身已经来自统一 `GameState.devices[deviceId].unreadByApp`，方向正确；问题在渲染条件。

## 6. 为什么所有 App 都显示相同红点

`<i>` 对所有 App 都无条件存在。没有未读数量时，元素文本为空，但 `.icon-wrap i` 仍固定拥有红色背景、19px 最小宽高和绝对定位，因此所有 App 都出现相同的空白红点。

实际初始未读状态只有：

- 玩家手机：微信 3；
- 调查手机：微信 2、百度网盘 1。

修复应只在 `badgeCount > 0` 时创建角标 DOM，并显示数字；超过 99 显示 `99+`。不得用空元素表示未读。

## 7. App 页面是否由 GenericApp 或统一模板渲染

是。`src/apps/AppHost.tsx` 对未登记专用组件的 App 使用：

`<AppChrome title={...}><GenericApp appId={appId}/></AppChrome>`

`src/apps/GenericApp.tsx` 固定输出“统一标题栏 + App 名横幅 + 两行/少量列表 + 灰色文字头像 + 通用详情字段表 + 通用有效交互按钮”。这正是当前所有现实 App 看起来像同一个网页模板的根因。

## 8. 哪些现实 App 尚未使用专用页面组件

已有专用组件：

- 微信、照片、Safari、百度地图、电话、文件、备忘录、设置、百度贴吧、计算器。

仍由 `GenericApp` 渲染：

- 日历、小红书、抖音、知乎、今日头条、QQ邮箱、百度网盘、支付宝、滴滴出行、美团、淘宝、网易云音乐、微信读书、铁路12306、健康、天气、时钟、相机、语音备忘录、指南针。

本轮第一阶段将先把知乎移出该清单。其余 19 个页面继续作为已确认技术债务，不在本轮擅自扩展。

## 9. 玩家界面中的开发说明、等级和临时标签

正常网址当前可见的开发信息包括：

- `src/app/GameRoot.tsx`：`可运行仓库 V0.1 · 视觉层待按冻结截图精修`；
- `src/app/GameRoot.tsx`：场景 ID、修正阶段、revision；
- `src/apps/GenericApp.tsx`：`A级/B级/C级交互 · 本地模拟账号`；
- `src/apps/FilesApp.tsx`：`A3-01`、`REFERENCE-GAP`、内部地点令牌；
- `src/apps/BaiduMapApp.tsx`：`模拟在线地图 · 临时几何`、生产令牌/参考缺口说明；
- `src/apps/PhotosApp.tsx`：`TEMPORARY`、槽位号、占位媒体开发说明；
- 若干媒体 `alt` 文本含 `temporary/临时素材`，虽通常不可见，但不应作为正常玩家文案暴露。

处理原则：保留必要的剧情内失败降级和事实状态，但将开发状态、内部 ID 与生产说明收进 `?qa=1` 模式；正常模式只呈现世界内可理解的文案。本轮不改动这些状态背后的 GameState、触发器、场景或冻结内容。

## 10. 当前页面与冻结参考的主要差异

### 主屏幕

- 当前系统图标呈现第二层白色外壳；冻结参考中图标资源自身就是完整视觉。
- 当前 58px 图标、18px 水平页内边距和 `1fr` 网格未依据 `IOS26-HOME-01` 的真实列中心与光学尺寸记录。
- 当前首屏连续放置 20 个 App、没有 Dock；冻结 Content Bible 规定高频 Dock，冻结 iOS 参考也显示独立 Dock。
- 当前 Dynamic Island 为 104×30、距顶 8px；冻结参考中的等比几何更宽、更低，并与 59px 状态安全区共同布局。
- 当前状态栏右侧用文本 `5G ◉ 78%` 模拟图标，不符合 iOS 蜂窝、Wi‑Fi/飞行模式和电池图形。
- 当前开发设备切换条覆盖 Dynamic Island/主屏顶部。
- 当前页面圆点、图标标签字号/行高/阴影、行距和底部安全区均未记录测量来源。
- 当前壁纸是简单蓝灰渐变，裁切和冻结主屏参考的蓝/暖色模糊层次不一致。

### 知乎

- 当前由 `GenericApp` 渲染，只有两条剧情相关条目和大片空白。
- 顶部是通用 iOS 返回栏与重复“知乎”标题，不是冻结知乎参考的应用导航。
- 没有首页标签、搜索入口、合理问题卡密度、作者信息、赞同/评论数据、底部导航。
- 没有问题描述、话题、关注问题、回答数量、作者卡、长回答操作、评论层级、展开全文、分享和收藏。
- 404 只是普通内容行，不像知乎失效页，也没有按冻结规则隐藏缓存入口。
- 直接剧情内容占 100%，与 Content Bible 的普通生活 68%、人物塑造 18%、线索 10%、明确异常 4% 基线严重冲突。
- 列表中的灰色方块文字头像和字段表详情均来自通用模板，不来自知乎真实组件。

## 审计结论

主屏白边由“系统图标图谱白底裁切 + 统一二次圆角”共同造成；空白红点由无条件渲染角标元素造成；知乎失真由 `GenericApp` 路由造成。三者都是视觉/页面结构工程问题，可在不触碰剧情、事件、触发器、GameState 语义和 A3 逻辑的前提下修复。

## 第一阶段实施回填

- 系统图标从 `public/icons/system/<name>.png` 切换为 `public/icons/system/runtime/<name>.png`。14 个运行时文件均从冻结图谱 `references/ui/11_52_UI_Reference_Pack_V1.0_全量版/icons/system/ios26_official_icon_grid.webp` 重新裁取并写入透明圆角 Alpha；没有用 CSS 放大遮盖。
- 主屏测量值和替换路径记录于 `references/ui/runtime-measurements/home-screen.json`。
- `.icon-wrap` 仅负责 65px 尺寸与点击定位；图片按 100% 尺寸直接显示，不再由 CSS 添加背景、padding、边框或第二次圆角。
- 角标只在 `GameState.devices[deviceId].unreadByApp[appId] > 0` 时渲染，并显示白色数字；初始玩家手机仅微信显示 `3`。
- 状态栏、Dynamic Island、四列网格、Dock、页面圆点、壁纸裁切和手势条按冻结参考测量重排。
- 正常网址隐藏设备切换条、场景/修正/revision、交互等级、本地模拟账号、TEMPORARY、REFERENCE-GAP、内部地点令牌和媒体槽位；这些信息仅在 `?qa=1` 模式保留。
- 知乎已经从 `GenericApp` 路由移除，改由 `src/apps/ZhihuApp.tsx` 专用渲染。
- `GenericApp` 当前仍承担 19 个已登记页面：日历、小红书、抖音、今日头条、QQ邮箱、百度网盘、支付宝、滴滴出行、美团、淘宝、网易云音乐、微信读书、铁路12306、健康、天气、时钟、相机、语音备忘录、指南针。本轮按收窄范围不扩展这些页面。
