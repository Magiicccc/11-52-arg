# 状态栏差异报告

审计日期：2026-07-18

当前线上 commit：`d0f6ab5d165b63979eb6bc108bbd96e73fc566df`

线上地址：<https://magiicccc.github.io/11-52-arg/>

## 对照证据

| 状态 | before 线上截图 | 冻结参考 | after 线上截图 |
| --- | --- | --- | --- |
| 蜂窝网络 | [status-cellular-402x874.png](../../test-results/ui-pass-2/before/status-cellular-402x874.png) | [iOS system contact sheet](../../references/ui/11_52_UI_Reference_Pack_V1.0_全量版/apps/ios_system/contact-sheet.jpg) | [status-cellular-402x874.png](../../test-results/ui-pass-2/after/status-cellular-402x874.png) |
| 飞行模式 | [status-airplane-402x874.png](../../test-results/ui-pass-2/before/status-airplane-402x874.png) | 同左 | [status-airplane-402x874.png](../../test-results/ui-pass-2/after/status-airplane-402x874.png) |
| 440px 蜂窝网络 | [status-cellular-440x956.png](../../test-results/ui-pass-2/before/status-cellular-440x956.png) | 同左 | [status-cellular-440x956.png](../../test-results/ui-pass-2/after/status-cellular-440x956.png) |

## 几何

| 项目 | 402×874 | 440×956 |
| --- | ---: | ---: |
| 状态栏高度 | 59px | 59px |
| Dynamic Island | x138 / y9 / 126×37 | x157 / y9 / 126×37 |
| Dynamic Island 圆角 | 22px | 22px |
| 时间左侧基准 | 49px | 55px |
| 右侧图标边距 | 20px | 23px |

## 状态投影

before 的图标样式已接近冻结参考，但网络状态由页面上下文零散决定。after 新增单一状态栏投影模型，状态栏只读取统一 GameState：

| GameState 条件 | 状态栏结果 |
| --- | --- |
| `simulated-online` | 蜂窝信号 + `5G` |
| `local-only` | 飞行模式 |
| `offline` | 无服务 |
| 已有 Wi-Fi 覆盖标志 | Wi-Fi |
| 电量小于等于 20% | 低电量样式 |

所有页面共用同一 shell 级投影；同一设备、同一 GameState 不再因打开不同 App 而显示冲突网络状态。状态节点同时提供 `data-network`、`data-low-battery` 和可访问文本，例如“5G，电量 78%”或“飞行模式，电量 78%”。

## 测试

- Vitest 状态快照覆盖：飞行模式、蜂窝网络、Wi-Fi、无服务、低电量；
- Playwright 验证玩家手机为蜂窝网络；
- Playwright 通过真实设备切换手势验证调查手机为飞行模式；
- 402×874 与 440×956 均保存独立线上截图。

## 已解决

- 状态栏成为统一 GameState 投影；
- 飞行模式、蜂窝、Wi-Fi、无服务、低电量五种状态均有明确模型；
- 状态栏安全区、Island 和左右边距在两个目标视口固定；
- 深色 App 与浅色 App 使用对比色变体；
- 页面切换不改变网络事实。

## 尚未完全解决

- 浏览器环境无法复刻真实 iOS 的系统字体 hinting、电池内部动画和实时射频强度。
- Wi-Fi、无服务、低电量已由单元快照覆盖，但当前 R0 线上故事状态没有自然触发这些三种组合，因此没有伪造对应剧情截图。
