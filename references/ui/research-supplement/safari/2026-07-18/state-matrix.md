# Safari state matrix supplement

This supplement does not merge or replace the frozen state matrix. It records the
2026-07-18 implementation audit against the same-app references only.

# 页面状态矩阵

> 本包为一次性全量交付。所有游戏所需状态均在本表归类为 direct_real、derived_real 或 system_inherited；不存在“下一批再补”的状态。

| 游戏所需状态 | 覆盖类型 | 直接参考ID | 派生规则 |
|---|---|---|---|
| 起始页 | direct_real | SAFARI26-START-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 地址输入/搜索 | direct_real | SAFARI26-SEARCH-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 网页浏览 | direct_real | SAFARI26-WEB-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 更多菜单 | direct_real | SAFARI26-MENU-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 无痕浏览 | direct_real | SAFARI26-PRIVATE-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 标签总览 | direct_real | SAFARI26-TABS-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 历史/收藏 | system_inherited | — | 沿用同App已有结构，并继承本包iOS系统键盘/弹层/列表组件。 |
| 知识页 | derived_real | — | 只从本App直接截图中的导航、字体、间距、卡片、按钮和弹层组件组合；禁止引用其他App风格。 |
| 404/缓存页 | derived_real | — | 只从本App直接截图中的导航、字体、间距、卡片、按钮和弹层组件组合；禁止引用其他App风格。 |
