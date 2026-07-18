# 主屏幕几何差异报告 V2

审计日期：2026-07-18

线上地址：<https://magiicccc.github.io/11-52-arg/>

before commit：`c30147c25de9b6aecaad8f16c9b3e22cdb3185a7`

after / 当前线上 commit：`d0f6ab5d165b63979eb6bc108bbd96e73fc566df`

after Workflow：<https://github.com/Magiicccc/11-52-arg/actions/runs/29640396718>

## 对照证据

| 类型 | 402×874 | 440×956 |
| --- | --- | --- |
| before 线上截图 | [player-home-page1-402x874.png](../../test-results/ui-pass-2/before/player-home-page1-402x874.png) | [player-home-page1-440x956.png](../../test-results/ui-pass-2/before/player-home-page1-440x956.png) |
| 冻结参考 | [IOS26-HOME-01](../../references/ui/11_52_UI_Reference_Pack_V1.0_全量版/apps/ios_system/raw/IOS26-HOME-01__ios_home_screen.png) | 同左 |
| after 线上截图 | [player-home-page1-402x874.png](../../test-results/ui-pass-2/after/player-home-page1-402x874.png) | [player-home-page1-440x956.png](../../test-results/ui-pass-2/after/player-home-page1-440x956.png) |
| 测量文件 | [home-screen-402.json](../../references/ui/runtime-measurements/home-screen-402.json) | [home-screen-440.json](../../references/ui/runtime-measurements/home-screen-440.json) |

截图元数据分别位于 [before capture-metadata.json](../../test-results/ui-pass-2/before/capture-metadata.json) 和 [after capture-metadata.json](../../test-results/ui-pass-2/after/capture-metadata.json)，记录了真实 Pages URL、commit、Workflow、截图时间、视口和 GameState。

## 像素测量

### 402×874

| 项目 | before | 冻结测量目标 | after |
| --- | ---: | ---: | ---: |
| 四列中心点 | 61.5 / 154.5 / 247.5 / 340.5 | 60.5 / 153.5 / 246.5 / 339.5 | 60.5 / 153.5 / 246.5 / 339.5 |
| 第一排中心 Y | 123.5 | 123.5 | 123.5 |
| 行步长 | 96 | 96 | 96 |
| 图标画布 | 65 | 65 | 65 |
| Dock x / y / w / h | 14 / 765 / 374 / 91 | 14 / 765 / 374 / 91 | 14 / 765 / 374 / 91 |
| 页面圆点距底 | 120 | 120 | 120 |
| Home Indicator | 134 / 861 / 134 / 5 | 同左 | 同左 |

before 使用 `justify-content:center`，在 344px 网格与 346px 可用内容宽度之间产生 1px 光栅偏移；after 改为明确起点排列，四列整体左移 1px。

### 440×956

| 项目 | before | 冻结测量目标 | after |
| --- | ---: | ---: | ---: |
| 四列中心点 | 67 / 169 / 271 / 373 | 66.5 / 168.5 / 270.5 / 372.5 | 66.5 / 168.5 / 270.5 / 372.5 |
| 第一排中心 Y | 123.5 | 123.5 | 123.5 |
| 行步长 | 98 | 98 | 98 |
| 图标画布 | 65 | 65 | 65 |
| Dock x / y / w / h | 17 / 842 / 406 / 94 | 同左 | 同左 |
| 页面圆点距底 | 124 | 124 | 124 |
| Home Indicator | 153 / 943 / 134 / 5 | 同左 | 同左 |

before 的剩余宽度产生 0.5px 居中偏移；after 使用测量文件中的明确中心点。

## 令牌与图标光学校准

主屏使用统一令牌：

- `--ios-status-height`
- `--ios-icon-size`
- `--ios-icon-optical-scale`
- `--ios-grid-column-gap`
- `--ios-grid-row-gap`
- `--ios-label-gap`
- `--ios-dock-height`
- `--ios-dock-bottom`
- `--ios-page-indicator-bottom`

运行时逐图标资源审计结果：

- 画布均为 `256×256`；
- 非透明包围盒均为 `[0, 0, 256, 256]`；
- 文件边缘透明宽度为 `0`；
- 本轮没有发现应替换的错误宣传图，也没有替换图标文件；
- 外层容器保持 `background: transparent`、`padding: 0`、`border: 0`；
- 图片使用 `object-fit: cover`；
- 每个 App 已具备独立的 `opticalScale`、`opticalOffsetX`、`opticalOffsetY` 字段，当前审计值均为 `1 / 0 / 0`，未用统一白底或放大裁切掩盖资源。

## 已解决

- 402px 和 440px 两个视口的四列中心点与冻结测量一致；
- 图标、标签、行步长、Dock、页面圆点和 Home Indicator 均由统一令牌约束；
- 图标容器没有二次白底、padding 或边框；
- badge 仅在 `badgeCount` 大于 0 时出现，显示白色数字，微信当前显示 `3`；
- 两页/三页主屏可滑动，页面圆点与当前页同步；
- 两个视口的几何断言已纳入 Playwright。

## 尚未完全解决

- 当前玩家手机第一页只有 8 个非 Dock App，因此下半屏仍有较大壁纸留白；这是当前 App 分页数据的结果，本轮没有复制 Dock App 或虚构 App 填满页面。
- 浏览器字体栅格与真实 iOS 的 San Francisco 字体仍可能出现亚像素差异。
- 壁纸是冻结氛围的 CSS 重建，不是系统原始壁纸文件，色彩与模糊半径仍属于 P2 视觉债务。
