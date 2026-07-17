Feature: P00—A2-11首个可玩垂直切片

Scenario: 新玩家完成调查手机解锁
  Given 玩家手机处于R0且调查手机锁定
  When 玩家从壁纸、12306卡和票根推导并输入230917
  Then 调查手机应解锁
  And 事件passcode.device.unlocked只应出现一次

Scenario: 第四张人脸引发首次同步
  Given 玩家已经确认沈川姓名
  When 玩家查看photo.dinner.4faces的信息页并将图片发给陈屿
  Then 陈屿应短暂说出沈川并撤回
  And 玩家手机头像或昵称应出现一次轻微普通化
  And 刷新后不得重复侵蚀

Scenario: 摩斯谜题与第417帧
  Given 玩家进入旧雨17缓存并获得carrier.wav
  When 玩家通过知识页解出FRAME 417
  Then 视频应定位第417帧
  And PB_0425应在玩家实际查看该帧后发送一次消息

Scenario: 验证记录普通化但主线不死锁
  Given 玩家已经满足A2-09前置
  When 玩家阅读验证记录_07达到关键段落阈值
  Then 正文应普通化为购物清单
  And 通知预览或其他独立来源应保留必要残片
  And 刷新后不得再次播放完整普通化事务

Scenario: 垂直切片结束
  Given 玩家已解出FRAME 417并见证验证记录普通化
  When 沈川哨兵程序执行
  Then 文件传输助手应收到417_index.json
  And 响应来源应为A
  And 应建立checkpoint.A2-11
