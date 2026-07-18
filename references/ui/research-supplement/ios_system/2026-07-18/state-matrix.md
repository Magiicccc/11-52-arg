# iOS系统 state matrix supplement

This supplement does not merge or replace the frozen state matrix. It records the
2026-07-18 implementation audit against the same-app references only.

# 页面状态矩阵

> 本包为一次性全量交付。所有游戏所需状态均在本表归类为 direct_real、derived_real 或 system_inherited；不存在“下一批再补”的状态。

| 游戏所需状态 | 覆盖类型 | 直接参考ID | 派生规则 |
|---|---|---|---|
| 锁定屏幕 | direct_real | IOS26-LOCK-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 六位密码输入 | direct_real | IOS26-PASS-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 主屏幕 | direct_real | IOS26-HOME-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 通知中心 | system_inherited | — | 沿用同App已有结构，并继承本包iOS系统键盘/弹层/列表组件。 |
| App切换器 | direct_real | IOS26-SWITCH-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 系统键盘 | system_inherited | — | 沿用同App已有结构，并继承本包iOS系统键盘/弹层/列表组件。 |
| 系统警告/确认弹窗 | system_inherited | — | 沿用同App已有结构，并继承本包iOS系统键盘/弹层/列表组件。 |
| 分享面板 | system_inherited | — | 沿用同App已有结构，并继承本包iOS系统键盘/弹层/列表组件。 |
