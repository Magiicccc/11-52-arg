# GitHub Pages Validation

验证日期：2026-07-17

## 部署目标

- 仓库：`Magiicccc/11-52-arg`
- 可见性：`PUBLIC`
- Production Branch：`main`
- Pages Source：GitHub Actions
- 站点：https://magiicccc.github.io/11-52-arg/
- 验证提交：`2bb1b44afef4c980e8f7e528c8ca41c0979f8367`
- Workflow：https://github.com/Magiicccc/11-52-arg/actions/runs/29576705160

## 构建配置

- Node.js：最新 Node 22.x
- pnpm：由 `package.json#packageManager` 固定为 `pnpm@11.13.1`
- 安装：`pnpm install --frozen-lockfile`
- Vite base：`/11-52-arg/`
- 构建：`pnpm build`
- 上传目录：`dist`
- Pages artifact 未包含 `docs`、`data-packs`、`references`、`source-packs` 或 source map。

## 构建前门禁

GitHub Actions `build` job 已通过：

- 内容引用验证；
- 叙事语义验证；
- 场景数据验证：49 scenes / 49 triggers / 49 transactions / 3 endings / 4 runs；
- TypeScript strict；
- Vitest：17 passed；
- Vite production build；
- Pages artifact 上传。

本地 `pnpm qa` 同样通过：17 个 Vitest 与 10 个 Playwright 测试全部成功。

## 真实线上 Playwright

GitHub Actions 在 Pages 部署完成后，直接以
`PLAYWRIGHT_BASE_URL=https://magiicccc.github.io/11-52-arg/`
执行完整 Playwright 套件。

结果：`10 passed (19.2s)`。

覆盖视口：

- `402 × 874`
- `440 × 956`

覆盖内容：

- 首屏与生产 JS/CSS 加载；
- App 图标和临时媒体路径使用 `/11-52-arg/` base；
- manifest 与 service worker scope；
- 调查手机进入、陈屿来电和密码解锁；
- IndexedDB `11-52-save` 建立；
- 刷新后从存档恢复；
- P00—A2-11 完整流程；
- 新存档推进至可恢复的 A3-10；
- A3 不提前泄露 A4 身份反转；
- 所有当前可见 App 可打开并返回；
- 资源响应无 404；
- 加载 URL 不包含 Windows 本地绝对路径。

当前正式音频与视频仍受媒体生产门禁限制；线上流程验证的是既有字幕、事件时间轴、文字替代和 temporary 占位媒体。内容 JSON 由 Vite 编译进入生产 JS，不作为独立网络 JSON 请求。

## 已知非阻塞项

- 当前本地网络访问 `github.io` 会发生连接重置，因此真实线上自动化放在部署后的 GitHub Runner 执行。
- GitHub Pages 官方 Actions 当前会报告 Node 20 action-runtime 弃用警告；Runner 自动使用 Node 24 执行这些上游 Action，构建、部署与线上测试均成功。
