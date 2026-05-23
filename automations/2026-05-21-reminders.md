# 2026-05-21 自动提醒信息

本文件用于保存 2026-05-21 用户要求 Codex 自动处理、发送或预览的提醒信息，便于同步到 GitHub 云端留档。

## 1. 工作日提醒李辉更新独立站数据

- Automation ID: `automation-3`
- 脚本: `send_lihui_daily_data_reminder.js`
- 发送对象: 李辉
- 飞书 Open ID: `ou_f6cad0a6196dcd8f5cf2e110740af268`
- 发送方式: 飞书机器人单聊
- 发送状态: 已于 2026-05-21 20:44:24 +08:00 补发成功
- 飞书消息 ID: `om_x100b6fdbacb33cb8c420e8ac019a9ce`

### 计划提醒文案

```markdown
【每日提醒｜独立站数据更新】

李辉，麻烦今天下班前更新一下独立站投放出单数据，并填写至下方表格：

[FlyLily站内数据](https://acnnjmus15ma.feishu.cn/sheets/UKULs2H11hb948tKnhIceaYvnIU?from=from_copylink)

重点确认：

1. 昨日花费
2. 出单量
3. 点击数和展示量
4. CPC 和千展成本
5. ROI / CPA 是否有异常

如果数据异常，也麻烦简单备注原因和明日动作。

谢谢。
```

### 当前风险

- 当前自动化依赖本机执行；如果电脑关机，本地任务可能不会触发。
- 建议后续迁移到云端定时任务，并增加失败告警。

## 2. 工作日上午事项提醒

- 脚本: `send_morning_workday_reminder.js`
- 发送对象: 当前脚本配置的飞书用户 `ou_dbf761347f696a177e473ced64f7ea0d`
- 发送方式: 飞书机器人单聊
- 内容范围:
  - 查看 Levanta 订单和红人信息
  - 今日目标：触达 500 个红人，并新增 5 个可合作红人数据
  - 查看李辉更新的独立站投流数据表
  - 查看黄观锦 CC 给你的红人邮件并生成昨日邮件汇总

### 涉及链接

- 红人数据表: https://acnnjmus15ma.feishu.cn/base/BjbZbDQTBaXxWPs74yJcADFKn8b?from=from_copylink
- FlyLily 站内数据: https://acnnjmus15ma.feishu.cn/sheets/UKULs2H11hb948tKnhIceaYvnIU?from=from_copylink
- FlyLily 独立站投流数据仪表盘文档: https://www.feishu.cn/file/Zbsrbc6wqo7neSxcsjXcSeFfnlf

### 计划提醒文案

```markdown
【工作日提醒｜上午事项】

早上好，今天先看这三件事：

1. 打开 Levanta，查看订单和红人信息情况。

   今日目标：触达 500 个红人，并新增 5 个可合作红人数据。

   请同步更新到下方表格：

[红人数据表](https://acnnjmus15ma.feishu.cn/base/BjbZbDQTBaXxWPs74yJcADFKn8b?from=from_copylink)

2. 查看李辉更新的独立站投流数据表。

   重点看昨日花费、出单量、CPC、千展成本、ROI / CPA 是否异常。

[FlyLily站内数据](https://acnnjmus15ma.feishu.cn/sheets/UKULs2H11hb948tKnhIceaYvnIU?from=from_copylink)

   仪表盘文档：

[FlyLily独立站投流数据仪表盘](https://www.feishu.cn/file/Zbsrbc6wqo7neSxcsjXcSeFfnlf)

3. 查看黄观锦 CC 给你的红人邮件。

{昨日红人邮件汇总}

有异常或需要跟进的地方，可以顺手备注一下原因和下一步动作。
```

### 当前风险

- 邮件汇总依赖飞书 CLI 和用户态邮箱权限。
- 当前自动化依赖本机执行；如果电脑关机，本地任务可能不会触发。

## 3. 站外对接群每日信息提醒

- 脚本: 待补充，当前项目中未找到独立脚本
- 飞书群名称: 站外对接群
- 飞书群 ID: 待确认
- 发送方式: 飞书机器人群发
- 发送频率: 每日
- 发送状态: 已补充到归档；尚未发现可执行脚本或历史发送记录

### 计划提醒文案

```markdown
【每日提醒｜站外对接信息同步】

各位，麻烦今天把站外对接相关信息同步一下，重点看这几类：

1. 今日新增对接对象 / 红人 / 机构
2. 已回复但需要继续推进的合作
3. 待补资料、待报价、待寄样、待确认授权的事项
4. 今日已完成动作和明日下一步
5. 有异常或卡住的地方，请备注原因和需要谁协助

辛苦大家，信息尽量当天同步，避免后续跟进断档。
```

### 当前风险

- 本地项目没有查到明确的站外对接群 chat_id。
- 飞书 CLI 当前缺少 `im:chat:read` 权限，暂时无法通过群名搜索确认群 ID。
- 需要补充群 ID 后，才能把这条提醒落成可执行脚本并稳定发送。

## 4. 每周任务收尾群提醒

- 脚本: `send_weekly_reminder.js`
- 飞书群 ID: `oc_3f9fe10b24fd8b1f65cbd105d1063406`
- 发送方式: 飞书机器人群发
- 提醒范围:
  - @所有人检查本周任务是否完成
  - 更新 5 月工作计划任务表
  - 未完成任务备注原因和当前进度
  - 李辉同步更新独立站数据表
  - 提交本周周报

### 涉及链接

- 5 月工作计划: https://acnnjmus15ma.feishu.cn/base/VPYKbOFbUaYYhuszKFRcjvzEn7d?from=from_copylink
- FlyLily 站内数据: https://acnnjmus15ma.feishu.cn/sheets/UKULs2H11hb948tKnhIceaYvnIU?from=from_copylink

### 计划提醒文案

```markdown
【每周提醒｜任务收尾】

请大家检查本周任务是否完成，并及时更新到下方任务表：

[5月工作计划](https://acnnjmus15ma.feishu.cn/base/VPYKbOFbUaYYhuszKFRcjvzEn7d?from=from_copylink)

已完成的任务，请更新任务状态。

未完成的任务，请备注原因和当前进度。

另外，李辉同学请同步更新独立站数据表：

[FlyLily站内数据](https://acnnjmus15ma.feishu.cn/sheets/UKULs2H11hb948tKnhIceaYvnIU?from=from_copylink)

最后，请大家记得提交本周周报。

辛苦啦，给这周一个漂亮的收尾。
```

### 当前风险

- 群发会 @所有人，正式启用前应确认发送时间和频率。

## 待办

- 补充站外对接群的飞书 chat_id。
- 为站外对接群每日提醒新增独立发送脚本。
- 明确每条自动化的运行时间、工作日/每日/周频规则和失败告警对象。
- 将本地执行改为云端定时任务，避免电脑关机导致漏发。

## 5. 2026-05-23 执行结果补充

- 任务: 每周任务收尾群提醒
- 脚本: `send_weekly_reminder.js`
- 执行时间: `2026-05-23 17:22:43 +08:00`
- 发送状态: 成功
- 飞书群 ID: `oc_3f9fe10b24fd8b1f65cbd105d1063406`
- 飞书消息 ID: `om_x100b6e2350e3e0bcc22f2b74665fdf5`
