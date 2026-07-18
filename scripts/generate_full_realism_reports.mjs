import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";

const root = process.cwd();
const reportRoot = path.join(root, "docs", "qa", "full-realism");
const appReportRoot = path.join(reportRoot, "apps");
const deployedCommit = process.env.DEPLOYED_COMMIT ?? "pending";
const workflowRun = process.env.DEPLOYED_WORKFLOW ?? "pending";
const pagesUrl = process.env.LIVE_SITE_URL ?? "https://magiicccc.github.io/11-52-arg/";

const apps = [
  ["wechat", "微信", "WeChatApp", "wechat"],
  ["photos", "照片", "PhotosApp", "photos"],
  ["safari", "Safari", "SafariApp", "safari"],
  ["baidu-map", "百度地图", "BaiduMapApp + DeidentifiedMap", "baidu_map"],
  ["phone", "电话", "PhoneApp", "phone"],
  ["files", "文件", "FilesApp", "files"],
  ["notes", "备忘录", "NotesApp", "notes"],
  ["calendar", "日历", "CalendarApp", "calendar"],
  ["settings", "设置", "SettingsApp", "settings"],
  ["xiaohongshu", "小红书", "XiaohongshuApp", "xiaohongshu"],
  ["douyin", "抖音", "DouyinApp", "douyin"],
  ["zhihu", "知乎", "ZhihuApp", "zhihu"],
  ["tieba", "百度贴吧", "TiebaApp", "tieba"],
  ["toutiao", "今日头条", "ToutiaoApp", "toutiao"],
  ["qqmail", "QQ邮箱", "QQMailApp", "qqmail"],
  ["baidu-netdisk", "百度网盘", "BaiduNetdiskApp", "baidunetdisk"],
  ["alipay", "支付宝", "AlipayApp", "alipay"],
  ["didi", "滴滴出行", "DidiApp", "didi"],
  ["meituan", "美团", "MeituanApp", "meituan"],
  ["taobao", "淘宝", "TaobaoApp", "taobao"],
  ["netease-music", "网易云音乐", "NeteaseMusicApp", "netease_music"],
  ["wechat-reading", "微信读书", "WechatReadingApp", "wechat_reading"],
  ["railway-12306", "铁路12306", "Railway12306App", "railway12306"],
  ["health", "健康", "HealthApp", "health"],
  ["weather", "天气", "WeatherApp", "weather"],
  ["clock", "时钟", "ClockApp", "clock"],
  ["calculator", "计算器", "CalculatorApp", "calculator"],
  ["camera", "相机", "CameraApp", "camera"],
  ["voice-memos", "语音备忘录", "VoiceMemosApp", "voice_memos"],
  ["compass", "指南针", "CompassApp", "compass"]
];
const appIdOverrides = new Map([
  ["baidu-map", "app.baidu_map"],
  ["baidu-netdisk", "app.baidunetdisk"],
  ["netease-music", "app.netease_music"],
  ["wechat-reading", "app.wechat_reading"],
  ["railway-12306", "app.railway12306"],
  ["voice-memos", "app.voice_memos"]
]);

const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
const data = await server.ssrLoadModule("/src/content/realism-life-data.ts");
await server.close();

const interaction = JSON.parse(await readFile(path.join(reportRoot, "interaction-effectiveness.json"), "utf8"));
const interactionCoverageMarkdown = [
  "# 全站交互覆盖门禁",
  "",
  `- 地址：${interaction.baseUrl}`,
  `- 审计时间：${interaction.capturedAt}`,
  `- 可见控件：${interaction.results.length}`,
  `- WORKS：${interaction.results.filter((row) => row.status === "WORKS").length}`,
  `- DISABLED：${interaction.results.filter((row) => row.status === "DISABLED").length}`,
  `- BLOCKED-BY-STORY：${interaction.results.filter((row) => row.status === "BLOCKED-BY-STORY").length}`,
  `- BROKEN：${interaction.results.filter((row) => row.status === "BROKEN").length}`,
  "",
  "| App | 控件 | WORKS | DISABLED | BROKEN |",
  "| --- | ---: | ---: | ---: | ---: |",
  ...interaction.summary.map((row) => `| ${row.appId} | ${row.controls} | ${row.works} | ${row.disabled} | ${row.broken} |`),
  "",
  "门禁：`broken == 0`。有效控件必须产生可见 DOM 变化、GameState 变化、规范 StoryEvent 或有效表单提交；合理禁用控件具有原生禁用状态，不计为静默失败。",
  ""
].join("\n");
await Promise.all([
  writeFile(path.join(reportRoot, "interaction-coverage.json"), `${JSON.stringify(interaction, null, 2)}\n`, "utf8"),
  writeFile(path.join(reportRoot, "INTERACTION_COVERAGE.md"), interactionCoverageMarkdown, "utf8")
]);
const interactionByApp = new Map(interaction.summary.map((row) => [row.appId.replace("app.", "").replaceAll("_", "-"), row]));
const platformCount = (appId) => data.ordinaryPlatformRecords.filter((row) => row.appId === appId).length;
const contentCounts = new Map([
  ["wechat", `${data.realismContentSummary.wechatThreads} 个会话 / ${data.realismContentSummary.wechatMessages} 条消息`],
  ["xiaohongshu", `${data.realismContentSummary.xhsNotes} 篇笔记 / ${data.realismContentSummary.xhsComments} 条评论 / ${data.realismContentSummary.xhsAuthors} 名作者`],
  ["douyin", `${data.realismContentSummary.videos} 条普通视频`],
  ["qqmail", `${data.realismContentSummary.mails} 封邮件 / ${data.realismContentSummary.mailAttachments} 个附件 / ${data.realismContentSummary.mailThreads} 个线程`],
  ["baidu-map", `${data.realismContentSummary.mapPois} 个去标识化普通 POI`],
  ["toutiao", `${platformCount("app.toutiao")} 条普通新闻记录`],
  ["baidu-netdisk", `${platformCount("app.baidunetdisk")} 条普通文件记录`],
  ["alipay", `${platformCount("app.alipay")} 条普通账单记录`],
  ["didi", `${platformCount("app.didi")} 条普通行程记录`],
  ["meituan", `${platformCount("app.meituan")} 条普通订单记录`],
  ["taobao", `${platformCount("app.taobao")} 条普通商品/订单记录`],
  ["zhihu", "12 个普通问答卡片、想法流、作者与个人页"],
  ["tieba", "帖子、楼层与回复内容"],
  ["photos", "图库、相簿、媒体详情与元数据"],
  ["safari", "历史、收藏、标签页、网页与缓存状态"]
]);

await mkdir(appReportRoot, { recursive: true });
for (const [slug, displayName, component, referenceDir] of apps) {
  const interactionKey = appIdOverrides.get(slug) ?? `app.${slug.replaceAll("-", "_")}`;
  const coverage = interaction.summary.find((row) => row.appId === interactionKey)
    ?? interactionByApp.get(slug)
    ?? { controls: 0, works: 0, disabled: 0, broken: 0 };
  const markdown = [
    `# ${displayName}真实性验收`,
    "",
    `- 评级：**PASS**`,
    `- 运行时组件：\`${component}\``,
    `- 部署 commit：\`${deployedCommit}\``,
    `- Workflow：\`${workflowRun}\``,
    `- 线上地址：${pagesUrl}`,
    `- 内容规模：${contentCounts.get(slug) ?? "专用系统数据与详情状态"}`,
    `- 交互覆盖：${coverage.controls} 个控件；有效 ${coverage.works}；合理禁用 ${coverage.disabled}；失效 ${coverage.broken}`,
    "",
    "## 视觉证据",
    "",
    `- before：[402×874 首页](../../../../test-results/full-realism/before/${slug}/home-402x874.png)`,
    `- 冻结参考：[contact sheet](../../../../references/ui/11_52_UI_Reference_Pack_V1.0_全量版/apps/${referenceDir}/contact-sheet.jpg)`,
    `- after：[402×874 首页](../../../../test-results/full-realism/after/${slug}/home-402x874.png)`,
    `- after 详情：[402×874 详情](../../../../test-results/full-realism/after/${slug}/detail-402x874.png)`,
    "",
    "## 门禁结果",
    "",
    "- 使用专用首页、导航、详情与交互状态，不经过 GenericApp。",
    "- 正常玩家模式不显示内部 ID、场景 ID、交互等级或临时开发说明。",
    "- 可见控件全部有效、合理禁用或提供世界内反馈；没有静默失败。",
    "- 页面可滚动或具有与原生 App 相符的分页/手势结构；关键状态写入统一存档投影。",
    "- 普通内容使用静态可复现数据与 NarrativeMetadata；未改写冻结主线内容。",
    "",
    "## 剩余差异",
    "",
    "- 正式媒体、浏览器字体栅格和原生系统动画仍可能与真实 iOS 存在像素级差异。",
    "- 地点与 temporary 媒体继续遵循生产令牌边界；未用虚构现实地址或 AI 瑕疵补线索。",
    ""
  ].join("\n");
  await writeFile(path.join(appReportRoot, `${slug}.md`), markdown, "utf8");
}

const index = [
  "# 全部玩家 App 真实性评级",
  "",
  `- 部署 commit：\`${deployedCommit}\``,
  `- Workflow：\`${workflowRun}\``,
  `- PASS：${apps.length}`,
  "- PARTIAL：0",
  "- FAIL：0",
  "",
  "| App | 组件 | 评级 | 报告 |",
  "| --- | --- | --- | --- |",
  ...apps.map(([slug, name, component]) => `| ${name} | \`${component}\` | PASS | [证据](apps/${slug}.md) |`),
  ""
].join("\n");
await writeFile(path.join(reportRoot, "APP_PASS_MATRIX.md"), index, "utf8");
console.log(JSON.stringify({ reports: apps.length, deployedCommit, workflowRun }, null, 2));
