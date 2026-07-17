# 《11:52》Media Production Pack V1.0

生成日期：2026-07-17

本包与《Media Asset Bible V1.0》共同构成非UI媒体资产的生产权威。它不包含最终图片、视频或音频文件，而是冻结人物身份包、地点几何、物件连续性、资产ID、R0—R5变体、镜头与声音脚本、提示模板和QA门禁。

## 使用顺序
1. 先批准 `characters/`、`locations/` 与 `objects/` 中的参考包。
2. 只从 `assets/media_manifest.json` 选择资产生产；不得临时新增剧情事实。
3. 先生成/拍摄R0母版，再用局部编辑制作R1—R5。
4. 关键媒体必须通过人物、地点、物理、证据、无障碍与跨版本QA。
5. 正式素材放入项目 `public/media/case-001/`，并保留本包中的sourceRoot与variant lineage。
