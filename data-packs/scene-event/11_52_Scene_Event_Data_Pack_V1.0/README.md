# 11:52 Scene & Event Data Pack V1.0

本包是第十册的可机读交付物，覆盖 P00—A5-07 共49个场景、49个完成触发器、49个原子事务、3条结局和W1—W4周目补丁。

## 验证

```bash
python scripts/validate_pack.py
```

## 生产门禁

- `LOC_RIVER_EDU_OLD_01`仍为现实地点生产令牌，发布构建前必须解析。
- 所有`contentRefs`必须在Content Pack中存在。
- 正式实现不得绕过事务直接修改世界状态。
- 结局判断必须读取可观察状态，不使用随机数或隐藏好感度。
