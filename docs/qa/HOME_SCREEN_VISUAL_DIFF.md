# GitHub Pages 主屏幕视觉差异

日期：2026-07-18

测试地址：<https://magiicccc.github.io/11-52-arg/>

测试视口：402×874、440×956

## 三方证据

| before 线上截图 | 冻结参考 | after 线上截图 |
| --- | --- | --- |
| `test-results/live-before/player-home-402x874.png` | `references/ui/11_52_UI_Reference_Pack_V1.0_全量版/apps/ios_system/raw/IOS26-HOME-01__ios_home_screen.png` | `test-results/live-after/player-home-402x874.png` |
| `test-results/live-before/investigation-home-402x874.png` | 同上 | `test-results/live-after/investigation-home-402x874.png` |
| `test-results/live-before/entry-440x956.png` | 同上 | `test-results/live-after/entry-440x956.png` |

before 是从当时线上 GitHub Pages 直接截取的实际失败状态：主 CSS 请求遭本机链路重置后，浏览器呈现未样式化的大图标纵向列表。这不是 localhost 或本地旧图。after 同样来自线上，并由审计脚本确认生产样式已经应用后才截图。

## 图标白边根因

根因有两层：

1. 旧运行时在 GitHub Pages 首访中并发加载较大的 PNG，遇到本机链路 `ERR_CONNECTION_RESET` 时会留下 `complete=false` 的图标。
2. 旧截图在 CSS 请求同样被重置时，图标尺寸、网格、圆角和外壳规则全部失效，原始 256×256 图像以浏览器默认布局出现，看起来像巨大的白底图标。

资产审计没有发现冻结源图标本身带额外透明边缘或错误白色底板。修复因此没有用 CSS 放大裁切掩盖资源，而是：

- 系统图标继续使用冻结 atlas 裁出的 256×256 PNG；
- 16 个第三方图标使用冻结 PNG 的像素一致 lossless WebP 运行时副本；
- 外层 `padding: 0`、`border: 0`、`background: transparent`；
- 图片 `object-fit: cover`，不进行二次圆角；
- 首屏图标设置高加载优先级，并只对连接失败做有限 URL 重试。

逐 App 像素、格式、Alpha、透明边缘和 CSS 结果见：

- `docs/qa/live-site/ICON_ASSET_AUDIT.md`
- `docs/qa/live-site/icon-asset-audit.json`

## 已修复

- 402×874 和 440×956 均为四列网格。
- 图标外层不再绘制第二层白色外壳。
- 没有额外 padding、border、`object-fit: contain` 或二次圆角。
- 所有图标使用统一尺寸；标签位置、字号、行高和阴影由测量文件驱动。
- Dynamic Island、状态栏、安全区、页面圆点、Dock 和底部手势条已恢复。
- 壁纸使用冻结裁切方式填充整个手机屏幕，下半部不再是 DOM 布局空白。
- 只有微信在当前状态显示数字角标 `3`；其他 App 不渲染空白红点。
- 正常网址未显示“A级交互”“B级交互”“C级交互”“本地模拟账号”、内部 App/Scene/Trigger ID。
- 最终线上资源审计的截图破损图片为 0。

## 仍未完全复刻

- 冻结 iOS 参考是单一设备/系统版本；402 与 440 视口的部分响应式插值仍是测量后的工程近似，不是 Apple 原生 SpringBoard。
- 图标长标签的字距与真实系统字体存在轻微差异。
- 主屏幕手势、文件夹缩放和系统动画没有逐帧复刻。
- 本机网络仍偶发重置首次图标请求；运行时重试后截图可用，GitHub Actions 线上 20/20 未复现。

运行时几何测量位于 `references/ui/runtime-measurements/home-screen.json`。
