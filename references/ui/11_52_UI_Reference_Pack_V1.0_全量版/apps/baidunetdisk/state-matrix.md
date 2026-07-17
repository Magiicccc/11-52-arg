# 页面状态矩阵

> 本包为一次性全量交付。所有游戏所需状态均在本表归类为 direct_real、derived_real 或 system_inherited；不存在“下一批再补”的状态。

| 游戏所需状态 | 覆盖类型 | 直接参考ID | 派生规则 |
|---|---|---|---|
| 首页 | direct_real | NETDISK1329-HOME-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 文件列表 | system_inherited | — | 沿用同App已有结构，并继承本包iOS系统键盘/弹层/列表组件。 |
| 搜索/AI搜索 | direct_real | NETDISK1329-SEARCH-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 文件详情 | system_inherited | — | 沿用同App已有结构，并继承本包iOS系统键盘/弹层/列表组件。 |
| 分享 | system_inherited | — | 沿用同App已有结构，并继承本包iOS系统键盘/弹层/列表组件。 |
| 下载/传输 | derived_real | — | 只从本App直接截图中的导航、字体、间距、卡片、按钮和弹层组件组合；禁止引用其他App风格。 |
| 在线解压 | derived_real | — | 只从本App直接截图中的导航、字体、间距、卡片、按钮和弹层组件组合；禁止引用其他App风格。 |
| 扫描 | direct_real | NETDISK1329-SCAN-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 转写 | direct_real | NETDISK1329-TRANS-01 | 按直接截图复刻；剧情只替换内容字段。 |
| 笔记 | direct_real | NETDISK1329-NOTES-01 | 按直接截图复刻；剧情只替换内容字段。 |