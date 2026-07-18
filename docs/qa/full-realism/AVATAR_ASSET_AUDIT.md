# 头像资产与运行时真实性审计

## 结论

- 已移除玩家可见联系人、作者、发件人和账户页中的单字头像占位。
- 当前头像包包含 128 个本地 SVG 图片，文件路径、seed 与 SHA-256 均唯一。
- 头像在构建时由固定 slot 映射，不依赖运行时随机数或外部网络；GitHub Pages 离线缓存与子路径部署均可正常加载。
- 头像仅承担视觉身份区分，不是线索，也不改变任何 StoryEvent、GameState、剧情文本或触发器。

## 生成与许可

- 生成服务：DiceBear 10.x HTTP avatar generation API。
- 生成脚本：`scripts/generate_avatar_assets.mjs`。
- 资产目录：`public/media/case-001/avatars/`。
- 可机读清单：`content/case-001/media/generated-avatar-manifest.json`。
- 生成风格：Avataaars、Lorelei、Adventurer、Personas。
- 每个文件的 creator、license、source URL、seed 与 SHA-256 均记录在 manifest。
- 文档：
  - https://www.dicebear.com/how-to-use/http-api/
  - https://www.dicebear.com/licenses/

## Slot 分配

| 范围 | 用途 |
| --- | --- |
| 0—19 | 微信联系人、普通会话与周岚 |
| 20—51 | 小红书作者、评论与消息 |
| 52—67 | 抖音作者 |
| 68—91 | QQ邮箱发件人 |
| 96—111 | 知乎作者与评论 |
| 112—119 | 贴吧用户与调查手机账户 |
| 120 | 玩家本人跨 App 统一头像 |
| 121 | 沈川跨 App 统一头像 |

同一人物在不同 App 中保持同一 slot；普通平台用户不复用相同 slot。微信聊天气泡通过同一联系人 slot 显示对方头像，自己的消息使用 slot 120。

## 覆盖页面

- 微信：会话列表、通讯录、聊天信息、普通聊天气泡、周岚聊天、朋友圈、个人页。
- 小红书：首页、详情、评论、消息、个人页。
- 抖音：视频作者。
- 知乎：首页、想法、详情、评论、个人页。
- QQ邮箱：账户、邮件列表、邮件详情。
- 百度网盘：账户。
- 设置、锁屏回拨、网易云音乐、铁路12306、健康、百度贴吧。

## 自动验证

- 单元测试：`tests/unit/avatar-assets.test.ts`
  - 128 个 manifest 条目；
  - 路径、seed、SHA-256 全部唯一；
  - slot 到生产 URL 的映射完整。
- Playwright：`tests/e2e/avatar-realism.spec.ts`
  - 402×874 与 440×956；
  - 微信、小红书、QQ邮箱、知乎、设置、网易云、健康、贴吧；
  - 所有检查到的图片均满足 `complete`、`naturalWidth > 0`、`naturalHeight > 0`；
  - 微信联系人列表资源 URL 不重复。
- 截图与运行时日志：`test-results/full-realism/avatar-pass/`
  - 28 张双视口页面及头像联系表截图；
  - `runtime-audit.json` 中 console error 为 0、failed request 为 0。
- 真实 GitHub Pages 复验：`test-results/full-realism/avatar-pass-online/`
  - 28 张直接来自 `https://magiicccc.github.io/11-52-arg/` 的双视口截图；
  - 线上头像专项 Playwright 4/4 通过；
  - console error 为 0、非导航取消类 failed request 为 0。

## 视觉复核

头像均使用真实图片元素或聊天气泡的本地图片背景，统一 `object-fit: cover`，圆形账户头像与微信方圆头像分别遵循各自页面结构。未再通过单字、首字母、问号或统一灰色方块模拟人物头像。
