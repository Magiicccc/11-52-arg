# 抖音 state matrix supplement

This supplement does not merge or replace the frozen state matrix. It records the
2026-07-18 implementation audit against the same-app references only.

# 页面状态矩阵

> 本包为一次性全量交付。所有游戏所需状态均在本表归类为 direct_real、derived_real 或 system_inherited；不存在“下一批再补”的状态。

| 游戏所需状态 | 覆盖类型 | 直接参考ID | 派生规则 |
|---|---|---|---|
| 推荐视频流 | derived_real | — | 只从本App直接截图中的导航、字体、间距、卡片、按钮和弹层组件组合；禁止引用其他App风格。 |
| 视频详情 | system_inherited | — | 沿用同App已有结构，并继承本包iOS系统键盘/弹层/列表组件。 |
| 评论抽屉 | derived_real | — | 只从本App直接截图中的导航、字体、间距、卡片、按钮和弹层组件组合；禁止引用其他App风格。 |
| 搜索 | direct_real | DY-SEARCH-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 直播 | direct_real | DY-LIVE-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 个人主页 | derived_real | — | 只从本App直接截图中的导航、字体、间距、卡片、按钮和弹层组件组合；禁止引用其他App风格。 |
| 收藏/历史 | system_inherited | — | 沿用同App已有结构，并继承本包iOS系统键盘/弹层/列表组件。 |
| 草稿 | derived_real | — | 只从本App直接截图中的导航、字体、间距、卡片、按钮和弹层组件组合；禁止引用其他App风格。 |
