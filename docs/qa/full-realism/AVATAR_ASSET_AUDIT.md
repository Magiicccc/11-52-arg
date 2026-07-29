# 头像资产与运行时真实性审计

## 结论

- 已移除玩家可见联系人、作者、发件人和账户页中的单字头像占位。
- 当前通用头像包包含 128 个本地生成的写实 PNG，文件路径、seed 与 SHA-256 均唯一；另有 47 个按身份语义定制的写实头像。
- 128 个运行时头像经过精确重复与感知近重复扫描：精确重复 0，aHash 距离不超过 3 的近重复 0。
- 头像在构建时由固定 slot 映射，不依赖运行时随机数或外部网络；GitHub Pages 离线缓存与子路径部署均可正常加载。
- 头像仅承担视觉身份区分，不是线索，也不改变任何 StoryEvent、GameState、剧情文本或触发器。

## 生成与许可

- 生成方式：本机 NVIDIA RTX 4070 Laptop GPU 直接运行公开 Stable Diffusion 权重；不使用图像生成 API，不需要 OpenAI API Key 或 Hugging Face Token。
- 模型：`SG161222/Realistic_Vision_V5.1_noVAE`，固定 revision `1e9f017a7b1eaefb63a1900ea6c5953d2739fd21`，CreativeML Open RAIL-M。
- 采样：Euler Ancestral，24 steps，CFG 5.25，固定 seed；512×512 生成后以 Lanczos 缩至 192×192 PNG。
- 生成脚本：`scripts/generate_local_avatar_pack.py`。
- 审核与接入脚本：`scripts/promote_local_avatar_pack.py`。
- 资产目录：`public/media/case-001/avatars/`。
- 可机读清单：`content/case-001/media/generated-avatar-manifest.json`。
- 内容构成：56 张普通人物随手拍、24 张宠物、24 张日常场景、24 张食物或生活物件；避免把所有账户处理成同一种 AI 证件照。
- 每个文件的类别、seed、尺寸与 SHA-256 均记录在 manifest。
- 联系表：`test-results/full-realism/avatar-local-generation/local-avatar-contact-sheet-1.jpg` 至 `local-avatar-contact-sheet-4.jpg`。
- 模型卡：https://huggingface.co/SG161222/Realistic_Vision_V5.1_noVAE

## 无 API 路线实测

- Codex 内置 `imagegen`：不需要 API Key，但本轮调用 `https://chatgpt.com/backend-api/codex/images/generations` 返回网络错误，未产生新文件。
- 本机公开模型：成功；首次匿名下载公开权重，随后本机 CUDA 推理，128 张全部完成。
- inference.sh skill：需要 `infsh login`，其设备授权仍会在本地保存服务会话凭据，因此不属于本轮要求的纯本地无凭据路线，未接入。
- 旧 DiceBear 头像只保留为历史 SVG 生产母版，不再由玩家运行时加载；`capture_avatar_visuals.mjs` 已改为审计 PNG。

## Slot 分配

| 范围 | 用途 |
| --- | --- |
| 0—19 | 微信联系人、普通会话与周岚 |
| 20—51 | 小红书作者、评论与消息 |
| 52—67 | 抖音作者 |
| 68—91 | QQ邮箱发件人 |
| 96—111 | 知乎作者与评论 |
| 112—119 | 贴吧用户、调查手机账户与普通静物头像 |
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
- 本轮本机写实头像包复验：`test-results/full-realism/avatar-local-v2/`
  - 28 张来自实际运行页面的双视口截图；
  - 头像专项 Playwright 4/4 通过；
  - `runtime-audit.json` 中两个视口的 console error 与 failed request 均为 0。
- 本轮完整生产预览：`pnpm qa` 通过，单元测试 30/30、Playwright 38/38；包含 P00—A3-10、IndexedDB、Service Worker 与刷新恢复。
- 真实 GitHub Pages 复验：`https://magiicccc.github.io/11-52-arg/`，部署提交 `311bddae0f4134d3bf100c14bcfa3b216e67adc9`。
- GitHub Actions：run `30446207107`（attempt 2），build、deploy 与 online-test 全部通过。
- 线上头像专项 Playwright：402×874 与 440×956 共 4/4 通过。
- 线上截图与运行时日志：`test-results/full-realism/avatar-local-v2-online/`
  - 共 28 张真实 GitHub Pages 页面截图；
  - `runtime-audit.json` 中两个视口的 console error 与 failed request 均为 0；
  - 已人工复核 QQ邮箱、抖音、知乎页面，头像图片均完成解码且未回退为单字、统一色块或旧 SVG。

## 视觉复核

头像均使用写实人物、宠物、风景、食物或日常物件图片，统一 `object-fit: cover`，圆形账户头像与微信方圆头像分别遵循各自页面结构。联系表人工检查未发现恐怖元素、剧情异常或明显五官畸变；未再通过单字、首字母、问号、统一卡通脸或统一灰色方块模拟人物头像。
