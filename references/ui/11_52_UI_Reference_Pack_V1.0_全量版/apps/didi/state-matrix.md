# 页面状态矩阵

> 本包为一次性全量交付。所有游戏所需状态均在本表归类为 direct_real、derived_real 或 system_inherited；不存在“下一批再补”的状态。

| 游戏所需状态 | 覆盖类型 | 直接参考ID | 派生规则 |
|---|---|---|---|
| 首页 | direct_real | DIDI80-HOME-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 车型选择 | direct_real | DIDI80-VEH-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 叫车确认 | derived_real | — | 只从本App直接截图中的导航、字体、间距、卡片、按钮和弹层组件组合；禁止引用其他App风格。 |
| 进行中行程 | direct_real | DIDI80-TRIP-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 订单历史 | direct_real | DIDI80-HISTORY-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 行程详情 | system_inherited | — | 沿用同App已有结构，并继承本包iOS系统键盘/弹层/列表组件。 |
| 路线推荐 | direct_real | DIDI80-ROUTE-01 | 按直接截图复刻；剧情只替换内容字段。 |