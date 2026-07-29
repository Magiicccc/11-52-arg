# 全站交互有效性审计

- 地址：http://127.0.0.1:4176/
- 审计时间：2026-07-29T15:44:31.104Z
- 可见控件：306
- WORKS：292
- DISABLED：14
- BROKEN：0
- 审计范围：定向 app.douyin, app.toutiao, app.qqmail, app.baidunetdisk, app.alipay, app.didi, app.meituan, app.taobao
- 未覆盖 App：0

| App | 控件 | WORKS | DISABLED | BROKEN |
| --- | ---: | ---: | ---: | ---: |
| app.douyin | 36 | 32 | 4 | 0 |
| app.toutiao | 50 | 48 | 2 | 0 |
| app.qqmail | 37 | 36 | 1 | 0 |
| app.baidunetdisk | 34 | 33 | 1 | 0 |
| app.alipay | 39 | 38 | 1 | 0 |
| app.didi | 31 | 29 | 2 | 0 |
| app.meituan | 36 | 35 | 1 | 0 |
| app.taobao | 43 | 41 | 2 | 0 |

所有被审计的可见控件均有稳定交互 ID，并产生可见 DOM 变化、规范状态事件或有效表单提交。
