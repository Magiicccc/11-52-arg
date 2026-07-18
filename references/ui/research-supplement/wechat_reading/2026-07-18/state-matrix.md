# 微信读书 state matrix supplement

This supplement does not merge or replace the frozen state matrix. It records the
2026-07-18 implementation audit against the same-app references only.

# 页面状态矩阵

> 本包为一次性全量交付。所有游戏所需状态均在本表归类为 direct_real、derived_real 或 system_inherited；不存在“下一批再补”的状态。

| 游戏所需状态 | 覆盖类型 | 直接参考ID | 派生规则 |
|---|---|---|---|
| 书架 | direct_real | WEREAD102-BOOK-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 发现 | direct_real | WEREAD102-DISC-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 阅读器 | direct_real | WEREAD102-READ-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 目录/进度 | derived_real | — | 只从本App直接截图中的导航、字体、间距、卡片、按钮和弹层组件组合；禁止引用其他App风格。 |
| 划线批注 | derived_real | — | 只从本App直接截图中的导航、字体、间距、卡片、按钮和弹层组件组合；禁止引用其他App风格。 |
| 笔记 | derived_real | — | 只从本App直接截图中的导航、字体、间距、卡片、按钮和弹层组件组合；禁止引用其他App风格。 |
| 个人主页 | direct_real | WEREAD102-PROFILE-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 阅读历史 | system_inherited | — | 沿用同App已有结构，并继承本包iOS系统键盘/弹层/列表组件。 |
