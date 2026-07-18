# GitHub Pages 部署版本审计

审计日期：2026-07-18

线上地址：<https://magiicccc.github.io/11-52-arg/>

## 结论

当前线上页面实际对应：

- Commit：`c30147c25de9b6aecaad8f16c9b3e22cdb3185a7`
- 分支：`main`
- Workflow run：<https://github.com/Magiicccc/11-52-arg/actions/runs/29634602397>
- Pages deployment ID：`5499605590`
- 部署时间：`2026-07-18T06:48:00Z`
- Workflow 结果：build、deploy、online-test 全部成功
- 线上 Playwright：20 passed / 0 failed

`docs/qa/GITHUB_PAGES_FULL_AUDIT.md` 中的 `18458960a9c16b01f2cea3a45cfd71c820bab389` 和 Workflow `29633877691` 是第一轮功能分支首次部署时留下的旧记录，已经不代表当前线上版本。

## 证据链

### 1. GitHub Pages deployment

GitHub Deployments API 返回的最新 `github-pages` deployment：

| 字段 | 值 |
| --- | --- |
| `id` | `5499605590` |
| `sha` | `c30147c25de9b6aecaad8f16c9b3e22cdb3185a7` |
| `ref` | `main` |
| `environment` | `github-pages` |
| `created_at` | `2026-07-18T06:48:00Z` |

GitHub Pages API 同时确认：

- `html_url`：`https://magiicccc.github.io/11-52-arg/`
- `build_type`：`workflow`
- source branch：`main`
- HTTPS：已强制启用

### 2. Workflow

Workflow run `29634602397` 由 `main` push 触发，`headSha` 为 `c30147c25de9b6aecaad8f16c9b3e22cdb3185a7`。

| Job | 结果 |
| --- | --- |
| `build` | success |
| `deploy` | success |
| `online-test` | success，20 passed |

### 3. 构建产物指纹

在 commit `c30147c` 上使用与 Workflow 相同的 `VITE_BASE_PATH=/11-52-arg/` 重新构建，线上资产与本地产物逐字节一致：

| 资产 | 线上字节数 | SHA-256 | 与本地 Pages 构建一致 |
| --- | ---: | --- | --- |
| `index-CERWYBpn.js` | 446259 | `bfd775db9a95949d7210d98a838e70a41f8632afe4ece5d809af881b3c8132da` | 是 |
| `index-kpi-lFz2.css` | 54360 | `d3046c4954e4e90d33d3328122c858dfc23986f636fb43f3b1b6f0f9bc6188e9` | 是 |

这排除了“Deployment API 已更新但 CDN 仍提供旧 bundle”的情况。

### 4. 线上隐藏 QA 入口

直接访问 `https://magiicccc.github.io/11-52-arg/?qa=1`，页面显示：

- `可运行仓库 V0.1`
- 场景：`P00`
- 修正：`R0`
- 修订：`0`
- 当前玩家手机 App 清单及 QA 设备切换

当前 QA 面板没有显示 commit SHA、Workflow run 或构建时间，因此不能单独承担部署版本追溯。本轮应补充只在 `?qa=1` 可见的构建元数据，并由 Workflow 注入，而正常玩家页面保持隐藏。

## 旧报告处理

`docs/qa/GITHUB_PAGES_FULL_AUDIT.md` 的部署 SHA 和 Workflow 字段已过期。第二轮完成时必须将其更新为当时最新的功能分支部署事实，并以本文件的四段证据链为准，不再用早期功能分支 run 代表当前线上版本。

## UI 真实性第二轮最终部署

本文件前述 `c30147c` 结论是第二轮开始时的 before 基线。第二轮功能分支部署完成后，GitHub Deployments API、Workflow、线上 `?qa=1` 构建元数据和 after 截图元数据共同确认当前线上版本已经更新为：

| 字段 | 当前值 |
| --- | --- |
| Commit | `d0f6ab5d165b63979eb6bc108bbd96e73fc566df` |
| 分支 | `fix/ui-realism-pass-2` |
| Workflow run | [29640396718](https://github.com/Magiicccc/11-52-arg/actions/runs/29640396718) |
| Pages deployment ID | `5500799281` |
| Deployment 创建时间 | `2026-07-18T10:10:31Z` |
| Workflow 事件 | `workflow_dispatch` |
| Workflow 结果 | build / deploy / online-test 全部 success |
| 线上 Playwright | 30 passed / 0 failed |

线上隐藏 QA 入口显示 `build d0f6ab5d165b · workflow 29640396718`。after 工件的 [capture-metadata.json](../../test-results/ui-pass-2/after/capture-metadata.json) 同时记录：

- `baseUrl`: `https://magiicccc.github.io/11-52-arg/`
- `deployedCommit`: `d0f6ab5d165b63979eb6bc108bbd96e73fc566df`
- `workflowRun`: `29640396718`
- `capturedAt`: `2026-07-18T10:12:21.619Z`
- 两个视口 HTTP 状态均为 `200`

因此，`18458960...` 与 `c30147c...` 都是可追溯的历史部署，不再代表本报告更新时的线上页面。
