# A3 第三幕运行时接入报告（2026-07-17）

## 范围与结果

A3-01 至 A3-10 已接入现有 `StoryEvent → Trigger → Action → GameState` 运行时。玩家可从 A2-11 的 `417_index.json` 自然进入 A3-01，在 A3-09 完成两部手机的原子同步侵蚀，并在 A3-10 建立可刷新恢复的稳定检查点。A4 仅开放入口状态 `world.flags.story.a4EntryAvailable=true` 与门禁 `G6`，没有实现 A4 页面、剧情或身份反转。

## 场景到实现文件

| 场景 | 主要运行时实现 | 内容与触发器 |
|---|---|---|
| A3-01 | `src/apps/FilesApp.tsx`、`src/a3/coordinate-assembly.ts` | `a3.coordinate.case`、`trigger.a3.enter`、`trigger.a3_01.coordinate_assembled` |
| A3-02 | `src/apps/BaiduMapApp.tsx` | `a3.map.oldpark`、`trigger.a3_02.map_opened`、在线/离线模式触发器 |
| A3-03 | `src/apps/PhotosApp.tsx` | `a3.site.photos`、三个差异标记触发器、`trigger.a3_03.photo_series` |
| A3-04 | `src/apps/PhotosApp.tsx` | `trigger.a3_04.metadata` |
| A3-05 | `src/apps/PhoneApp.tsx` | `a3.unknown.call`、接听/拒接/无障碍替代触发器 |
| A3-06 | `src/apps/WeChatApp.tsx` | `a3.zhoulan.thread`、`trigger.a3_06.zhoulan_opened` |
| A3-07 | `src/apps/WeChatApp.tsx`、`src/apps/GenericApp.tsx` | 蓝杯 clean/contaminated/retry、`a3.bluecup.order`、独立证据触发器 |
| A3-08 | `src/apps/WeChatApp.tsx` | 同一 `a3.zhoulan.thread` 的 R2/R3 `ContentVariant`、`trigger.a3_08.voice_corrected` |
| A3-09 | `src/app/GameContext.tsx`、微信/地图/照片投影 | `a3.player.sync`、`trigger.a3_09.player_sync` |
| A3-10 | `src/apps/PhotosApp.tsx` | `a3.site.video`、六个进度事件、失败替代与完成触发器 |

共享合同和事务执行位于 `src/contracts/triggers.ts`、`src/engine/actions.ts`、`src/engine/story-engine.ts`。运行时内容、媒体 manifest 与触发器分别位于：

- `content/case-001/apps/a3-content-items.json`
- `content/case-001/media/a3-temporary-media.json`
- `content/case-001/triggers/a3-triggers.json`

## 新增事件、触发器与事务

主要玩家事件：

- `a3.coordinate.started`
- `coordinate.source.inspected`
- `coordinates.assembled` / `coordinates.assembly.rejected`
- `map.network.mode.changed`
- `map.location.opened`
- `photo.site.difference.inspected`
- `photo.site.series.opened`
- `photo.metadata.signature.confirmed`
- `unknown.call.completed`
- `audio.fallback.opened`
- `wechat.thread.zhoulan.opened`
- `wechat.media.clean.sent`
- `wechat.media.contaminated.sent`
- `audio.voice.played`
- `content.item.opened`
- `voice.variant.corrected`
- `device.player.anchor_change.viewed`
- `video.fallback.opened`
- `video.playback.progressed`
- `video.playback.completed`

关键事务：

| 事务 | 原子性 | 回滚 | 幂等键 |
|---|---|---|---|
| `transaction.a3_09.player_sync` | `true` | `allOrNothing` | `a3_09_player_sync_v1` |
| `transaction.a3_10.checkpoint` | `true` | `allOrNothing` | `a3_10_checkpoint_v1` |

A3-09 的联系人、语气、地图、相册、头像、阿序反应、场景完成与检查点均属于同一事务；单元测试覆盖重复进入和中途失败回滚。

## Temporary 与 REFERENCE-GAP

- `LOC_RIVER_EDU_OLD_01` 仍为未绑定生产令牌；地图使用 `temporary-not-to-scale` 几何，不含真实经纬度或地址。
- A3-03 的 12 个照片槽位复用仓库既有 `corridor-frame-417.svg` 占位资产；manifest 文件名明确标记 `temporary`。
- A3-10 的 26.4 秒视频复用同一既有占位资产并提供冻结时间轴文字替代。
- A3-05 未知来电与 A3-07/08 周岚语音当前使用波形、字幕和冻结转写合同；正式音频媒体仍待第九册生产包落地。
- 占位媒体的视觉瑕疵不参与线索判定。

## 冲突与未决项

- `PZ-009/PZ-010` 编号冲突及检查点覆盖差异已记录在 `docs/authority/CONFLICT_REPORT.md`；运行时不修改冻结数据包。
- 尚待：正式地点绑定、12 张现场照片、8 秒来电音频、18.2/17.7 秒同母带语音、26.4 秒现场视频，以及按冻结 UI 参考逐页进行最终视觉精修。
- 本轮没有实现 A4、A5、三结局、W1—W4，也未修改第十一册或第十二册。

## 验证结果

- 冻结输入校验：16/16 通过。
- 集成仓库/场景数据校验：49 场景、49 触发器、49 事务通过；220 个 JSON 可解析。
- 内容引用：354 个 ID、679 个引用通过。
- 叙事语义：56 个内容项通过，孤立内容 0。
- TypeScript strict：通过。
- Vitest：2 个文件、17 个测试通过。
- Playwright：8 个测试通过；覆盖 402×874 与 440×956。
- 生产构建：通过。
- `pnpm qa`：通过。
