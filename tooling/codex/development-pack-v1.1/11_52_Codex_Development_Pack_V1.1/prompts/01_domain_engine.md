# 任务：实现事件驱动领域核心

范围：src/contracts、src/engine、src/persistence、tests/model。

按开发包合同实现GameState、StoryEvent、Trigger、Condition、Action、事务、幂等凭据、事件日志、快照与IndexedDB适配器。使用纯函数更新和运行时Schema校验。

至少证明：
- 事件重放确定性；
- 同一事件重复提交无副作用；
- 事务崩溃不产生半状态；
- 存档Schema迁移入口存在。

不要实现任何具体App UI。
