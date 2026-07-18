# GitHub Pages 完整线上验收

日期：2026-07-18

线上地址：<https://magiicccc.github.io/11-52-arg/>

验收分支：`fix/github-pages-ui-realism`

已部署提交：`18458960a9c16b01f2cea3a45cfd71c820bab389`

Workflow：<https://github.com/Magiicccc/11-52-arg/actions/runs/29633877691>

## 结论

GitHub Pages 当前可直接游玩。三个要求视口均返回 HTTP 200；资源均留在 `/11-52-arg/` base 内；未发现 404、MIME、跨域、Windows 绝对路径、IndexedDB、字体、音频、视频或 JSON 错误。GitHub Actions 从公共网络直接访问正式地址，20/20 Playwright 通过，覆盖 P00、A1、A2、A3-10、两个手机视口、IndexedDB 与刷新恢复。

`github-pages` 环境已启用自定义分支策略，并精确允许 `main` 与 `fix/github-pages-ui-realism` 两条分支；功能分支策略 ID 为 `54967438`，没有放开通配符。

本机采集链路存在间歇性 `net::ERR_CONNECTION_RESET`。最终 after 采集中有 3 次首次请求失败，其中两张图标由运行时重试恢复，一次 HTML 导航由审计脚本重试恢复；所有最终截图中的图片 `naturalWidth` 均有效。该现象没有对应 HTTP 4xx/5xx，也未在 GitHub Actions 的 20/20 线上测试中复现，因此归类为本机到 GitHub Pages 的传输链路问题，而非站点资源缺失。

## 线上基线

| 视口 | HTTP | before 首屏可见 | after 首屏可见 | after FCP | IndexedDB |
| --- | ---: | ---: | ---: | ---: | --- |
| 402×874 | 200 | 1939 ms | 963 ms | 908 ms | `11-52-save` 可用 |
| 440×956 | 200 | 4237 ms | 821 ms | 764 ms | `11-52-save` 可用 |
| 1440×1000 | 200 | 749 ms | 1988 ms | 680 ms | `11-52-save` 可用 |

首屏可见时间包含导航重试和等待游戏入口的时间，不等同于 Navigation Timing 的 load event。桌面 after 的首屏可见时间受一次连接重置重试影响，其 Navigation Timing load event 为 629 ms。

| 检查项 | before | after | 判断 |
| --- | ---: | ---: | --- |
| 控制台 warning | 0 | 0 | 通过 |
| HTTP 4xx/5xx | 0 | 0 | 通过 |
| MIME 错误 | 0 | 0 | 通过 |
| base 路径逃逸 | 0 | 0 | 通过 |
| Windows 绝对路径 | 0 | 0 | 通过 |
| IndexedDB 错误 | 0 | 0 | 通过 |
| 字体错误 | 0 | 0 | 通过 |
| 音频/视频错误 | 0 | 0 | 通过 |
| JSON 错误 | 0 | 0 | 通过 |
| 截图中破损图片 | 14 | 0 | 已修复 |
| 本机链路请求失败 | 14 | 3 | 仍有外部链路波动 |

完整机器日志位于：

- `docs/qa/live-site/console-errors.json`
- `docs/qa/live-site/console-warnings.json`
- `docs/qa/live-site/failed-requests.json`
- `docs/qa/live-site/resource-audit.json`
- `docs/qa/live-site/performance-summary.md`
- 带 `-before`、`-after` 和 `-transient-reset` 后缀的阶段性原始记录

## Playwright 线上流程

GitHub Actions 的 `online-test` job 将 `PLAYWRIGHT_BASE_URL` 设为真实 GitHub Pages 地址，结果为 20 passed / 0 failed：

- P00-P03 回拨陈屿并用 `230917` 解锁；
- P00-A2-11 完整纵切；
- 新存档到 A3-10，并确认不提前泄露 A4 身份反转；
- A3-10 检查点与刷新恢复；
- IndexedDB 创建和存档恢复；
- 402×874 与 440×956；
- 全部玩家手机 App 可打开、返回；
- 主屏幕几何、数字角标；
- 知乎首页、搜索、问题、评论、404、缓存入口；
- 9 个支持型平台 App 的专用结构与详情跳转；
- 正常玩家模式不存在开发标签。

本地同版本构建的 `pnpm test:e2e` 和 `pnpm qa` 也各自通过 20/20。GitHub Actions 是线上流程的最终判据，因为它直接访问正式 URL，且不受本机不稳定链路影响。

## 截图证据

线上 before 与 after 各 37 张：

- `test-results/live-before/`
- `test-results/live-after/`

覆盖入口、桌面视口、两部手机、锁屏、密码、通知、两页主屏幕、微信、照片、Safari、地图、文件、备忘录、电话、小红书、抖音、知乎、贴吧、头条、支付宝、淘宝、美团、滴滴、QQ 邮箱和百度网盘。主屏幕与知乎的逐项对照分别见：

- `docs/qa/HOME_SCREEN_VISUAL_DIFF.md`
- `docs/qa/ZHIHU_VISUAL_DIFF.md`

## 修复内容

- 第三方主屏幕图标改用冻结图标的像素一致无损 WebP 运行时副本。
- 图标外层只承担点击热区，不再绘制白底、padding、border 或二次圆角；图片使用 `object-fit: cover`。
- 图标请求增加浏览器优先级和有限重试，应对 GitHub Pages 首访的传输重置。
- 通知角标继续由 GameState 的 `badgeCount` 驱动；零值不渲染，正值显示白色数字。
- 小红书、抖音、今日头条、QQ 邮箱、百度网盘、支付宝、滴滴、美团和淘宝脱离 `GenericApp`，建立平台专用页面与详情跳转。
- 知乎继续使用专用 `ZhihuApp`，线上验证首页、搜索、问题详情、评论、404 和缓存入口。
- 正常玩家网址隐藏交互等级、本地模拟账号、内部 ID 与调试标签；`?qa=1` 保留 QA 信息。

没有修改剧情、谜题、场景、触发器、GameState、正式台词或 A3 逻辑。

## 未完成与技术债务

- `GenericApp` 仍承载日历、网易云音乐、微信读书、铁路 12306、健康、天气、时钟、相机、语音备忘录和指南针。它们只有少量正式 ContentItem；本轮没有用无 NarrativeMetadata 的虚构内容填满页面。
- 小红书、抖音、头条、网盘、支付、出行、电商等专用页面的正式内容数量仍少，视觉结构已专用化，但内容密度尚未达到生产级真实账号。
- 知乎“想法流、个人主页、AI 模块”未覆盖完整冻结状态矩阵；既有 10 条生活向静态卡片尚未进入正式 Content Registry。
- 百度地图地点令牌仍未绑定；正式照片、音频和视频仍受 temporary 媒体限制。
- GitHub Actions 对部分 Action 发出 Node.js 20 运行时弃用提示；工作流当前成功，但应在官方 Action 发布兼容版本后升级。
- 本机到 GitHub Pages 的偶发连接重置仍存在，原始日志已保留。运行时与审计工具均只做有限重试，没有掩盖 HTTP 错误。

## 验证结果

| 命令 | 结果 |
| --- | --- |
| `pnpm verify:content` | 通过：354 ids，679 references |
| `pnpm verify:narrative` | 通过：56 items，orphan=0 |
| `pnpm verify:scenes` | 通过：49 scenes / 49 triggers / 49 tx |
| `pnpm typecheck` | 通过 |
| `pnpm test` | 通过：17/17 |
| `pnpm build` | 通过：输出 `dist` |
| `pnpm test:e2e` | 通过：20/20 |
| `pnpm qa` | 通过：冻结输入、引用、叙事、类型、单测、E2E 全部通过 |
| GitHub Pages online-test | 通过：20/20 |
| `git diff --check` | 提交前执行并记录 |
