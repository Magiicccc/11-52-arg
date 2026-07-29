# 平台文章完整性审计

审计对象为正常玩家界面中可进入详情页的知乎回答、今日头条文章、小红书笔记与百度贴吧帖子。本轮不改写权威标题、摘要、正式线索句或 NarrativeMetadata；补充正文通过既有 `contentId` 关联原内容项。

## 结果

- 知乎：12 篇普通长回答保持 6 段完整正文；早期“网页存档与当前页面为什么会不同？”回答由原答案句扩展为 6 段，完整覆盖问题定义、记录条件、控制变量、存档差异与结论边界。
- 今日头条：20 篇普通文章保持导语加 4 段正文；10 条早期记录补齐 4 段正文，不再打开标题与一句摘要组成的空详情。
- 小红书：24 篇普通生活笔记保持 4 段正文；15 条早期账号记录补齐 4 段正文，原 `text` 作为首段或首段核心句保留。
- 百度贴吧：16 篇普通帖子继续保持 4 段正文和至少 3 条独立回复。

补充正文共覆盖 26 个既有 Content ID；所有段落只展开已存在的城市日常、摄影、用户研究、文件归档和既有支持线索，不新增角色、现实地点、谜题答案或剧情结论。

## 自动门槛

- 早期平台详情至少 4 段；
- 正文合计超过 140 个汉字；
- 每段以完整句末标点结束；
- 首段与末段不得重复；
- 知乎普通长回答至少 6 段、正文超过 300 字；
- 今日头条普通长文固定 4 段并保留来源、日期；
- 贴吧普通帖固定 4 段、正文超过 250 字并至少 3 条回复。

## 浏览器证据

- `test-results/visual/platforms/zhihu-early-complete-detail-402.png`
- `test-results/visual/platforms/zhihu-early-complete-detail-440.png`
- `test-results/visual/platforms/xiaohongshu-early-complete-detail-402.png`
- `test-results/visual/platforms/xiaohongshu-early-complete-detail-440.png`
- `test-results/visual/platforms/toutiao-long-form-detail-402.png`
- `test-results/visual/platforms/toutiao-long-form-detail-440.png`

## 验证

- 内容引用：681 个 ID、1090 个引用，全部通过；
- 叙事语义：127 个内容项，孤立项 0；
- Vitest：35 项通过；
- Playwright：52 项、两个目标视口全部通过；
- 严格交互审计：30 个 App，858 个控件，失效 0；
- P00—A3-10：两个目标视口完整通过。
