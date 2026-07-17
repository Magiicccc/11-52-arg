# 《11:52》全量真实界面参考包 V1.0

冻结日期：2026-07-16  
交付模式：一次性全量版  
目标环境：Dynamic Island iPhone / iOS 26.5.2 / 简体中文 / 浅色模式 / 402×874

## 交付范围

- 可见App与系统族：31
- 真实界面参考：108
- 游戏所需页面/状态：232
- 直接真实截图覆盖：81个状态
- 同App派生覆盖：92个状态
- iOS系统继承覆盖：59个状态

本包不采用“V0.3、V0.4以后再补”的路线。所有第五册和Content Bible中实际会出现的App，均已在同一包中建立：真实截图、来源日志、页面状态矩阵、实现合同、尺寸元数据和联系图。

## Codex权威规则

1. `raw/`中的真实截图是视觉第一权威。
2. 精确页面没有直接截图时，只能依据同一App的`state-matrix.md`和`implementation-contract.md`派生。
3. 键盘、弹窗、通知、分享面板等跨App系统组件从`iOS系统`继承。
4. Codex不得从零搜索并自行决定界面样式；网络只能核验版本变化。
5. 不得把截图整页当作背景；必须用DOM/CSS和真实交互组件重建。
6. 先完成中性复刻与Playwright视觉比较，再注入剧情内容和R0—R5异常版本。

## 目录

- `apps/<slug>/raw/`：原始真实截图
- `apps/<slug>/annotated/`：带参考ID与版本标记的副本
- `apps/<slug>/contact-sheet.jpg`：该App视觉图谱
- `apps/<slug>/state-matrix.md`：全部游戏所需状态及覆盖方式
- `apps/<slug>/implementation-contract.md`：Codex实现边界
- `apps/<slug>/measurements.json`：目标视口与源图尺寸
- `icons/third_party/`：16个现实第三方App图标PNG
- `icons/system/`：iOS 26系统图标图谱及14个系统App图标裁切
- `icons/icon-source-map.csv`：全部图标文件、来源、尺寸与SHA-256
- `index/reference-index.csv`：全部真实截图索引
- `index/coverage-matrix.csv`：全部游戏状态覆盖矩阵
- `CURRENT_VERSION_MATRIX.md`：冻结日核验版本与视觉语料版本差异
