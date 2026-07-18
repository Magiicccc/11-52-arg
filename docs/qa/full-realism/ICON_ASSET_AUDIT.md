# GitHub Pages 图标资产审计

- 审计范围：当前主屏幕全部 30 个 App 图标。
- 运行时规则：外层仅提供尺寸与点击热区；`padding: 0`、`border: 0`、`background: transparent`，图片使用 `object-fit: cover`，不做第二次圆角裁切。
- 系统图标：继续使用从冻结 iOS atlas 裁出的透明运行时 PNG。
- 第三方图标：使用冻结 PNG 的像素一致 lossless WebP 运行时副本，降低 GitHub Pages 首访请求体积；冻结源文件未改写。

| App | 当前资源 | 像素 | 格式 | Alpha | 透明边缘 L/T/R/B | 白色底板 | 冻结来源 | 换资源 | 改 CSS |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- |
| 微信 | `/icons/third_party/runtime/wechat.webp` | 256×256 | WEBP | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 照片 | `/icons/system/runtime/photos.png` | 256×256 | PNG | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| Safari | `/icons/system/runtime/safari.png` | 256×256 | PNG | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 百度地图 | `/icons/third_party/runtime/baidu_map.webp` | 256×256 | WEBP | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 电话 | `/icons/system/runtime/phone.png` | 256×256 | PNG | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 文件 | `/icons/system/runtime/files.png` | 256×256 | PNG | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 备忘录 | `/icons/system/runtime/notes.png` | 256×256 | PNG | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 日历 | `/icons/system/runtime/calendar.png` | 256×256 | PNG | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 设置 | `/icons/system/runtime/settings.png` | 256×256 | PNG | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 小红书 | `/icons/third_party/runtime/xiaohongshu.webp` | 256×256 | WEBP | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 抖音 | `/icons/third_party/runtime/douyin.webp` | 256×256 | WEBP | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 知乎 | `/icons/third_party/runtime/zhihu.webp` | 256×256 | WEBP | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 百度贴吧 | `/icons/third_party/runtime/tieba.webp` | 256×256 | WEBP | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 今日头条 | `/icons/third_party/runtime/toutiao.webp` | 256×256 | WEBP | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| QQ邮箱 | `/icons/third_party/runtime/qqmail.webp` | 256×256 | WEBP | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 百度网盘 | `/icons/third_party/runtime/baidunetdisk.webp` | 256×256 | WEBP | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 支付宝 | `/icons/third_party/runtime/alipay.webp` | 256×256 | WEBP | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 滴滴出行 | `/icons/third_party/runtime/didi.webp` | 256×256 | WEBP | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 美团 | `/icons/third_party/runtime/meituan.webp` | 256×256 | WEBP | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 淘宝 | `/icons/third_party/runtime/taobao.webp` | 256×256 | WEBP | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 网易云音乐 | `/icons/third_party/runtime/netease_music.webp` | 256×256 | WEBP | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 微信读书 | `/icons/third_party/runtime/wechat_reading.webp` | 256×256 | WEBP | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 铁路12306 | `/icons/third_party/runtime/railway12306.webp` | 256×256 | WEBP | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 健康 | `/icons/system/runtime/health.png` | 256×256 | PNG | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 天气 | `/icons/system/runtime/weather.png` | 256×256 | PNG | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 时钟 | `/icons/system/runtime/clock.png` | 256×256 | PNG | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 计算器 | `/icons/system/runtime/calculator.png` | 256×256 | PNG | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 相机 | `/icons/system/runtime/camera.png` | 256×256 | PNG | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 语音备忘录 | `/icons/system/runtime/voice_memos.png` | 256×256 | PNG | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |
| 指南针 | `/icons/system/runtime/compass.png` | 256×256 | PNG | 是 | 0/0/0/0 | 否 | 是 | 否 | 否 |

## 结论

- 当前运行时资源没有检测到四角不透明白色底板。
- CSS 不再绘制第二层白色图标外壳，也没有 `contain`、额外 padding、border 或重复圆角。
- 第三方 WebP 仅是冻结 PNG 的无损传输副本；逐像素一致性由 `scripts/prepare_runtime_icons.py` 验证。
