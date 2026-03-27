# 交付物 4：最小埋点与数据回收方案

## 1. 文档目的

本文件定义阶段一到阶段二之间的最小埋点结构，用于支持 PoC 与 MVP 的漏斗分析、解决率评估和未解决原因复盘。

## 2. 埋点原则

- 先保证关键闭环数据可回收，再追求复杂分析
- 事件名称尽量稳定，便于阶段二、三复用
- 能通过属性表达的，不单独拆成过多事件
- 优先保证 `resolved_status` 和 `unresolved_reason_submit`

## 3. 最终埋点结构表

| 事件名称 | 埋点位置 | 触发时机 | 关键属性 | 目的（Business Goal） |
|---|---|---|---|---|
| `pwa_entry` | 扫码进入瞬间 | 用户通过二维码首次进入 PWA | `asin`, `qr_source`, `channel`, `timestamp` | 作为转化漏斗起点，统计 Scan Count 与入口有效性 |
| `sku_view` | Landing Page | 型号确认页完成首屏加载 | `asin`, `page=landing` | 统计进入首批 SKU 页面的人数，判断入口到页面的有效承接 |
| `tutorial_start` | Landing Page -> Step 1 | 用户点击“3-Step Safety Installation Guide” | `asin`, `entry_page=landing` | 衡量从入口到教程启动的转化率 |
| `step_view` | Step 1 / 2 / 3 | 每个步骤首屏加载完成 | `asin`, `step_id`, `step_name` | 统计各步骤到达率，为流失和停留分析提供基础 |
| `step_complete` | Step 1 / 2 / 3 | 用户点击下一步或完成按钮 | `asin`, `step_id`, `step_name` | 衡量每一步完成率，判断内容是否可顺利推进 |
| `safety_trust_click` | Step 2 | 用户点击缝线特写、大图或相关安全细节 | `asin`, `step_id=2`, `target_type` | 验证用户对安全性证明的关注程度 |
| `resolved_status` | Feedback 页面 | 用户点击 `Yes` 或 `No` | `asin`, `resolved=yes/no` | 作为北极星指标，衡量教程是否真正解决问题 |
| `unresolved_reason_submit` | Unresolved Reason 页面 | 用户提交未解决原因 | `asin`, `reason`, `note_present`, `recommended_review` | 识别未解决原因，为后续内容和产品迭代提供依据 |
| `dropout_step` | 全链路 | 用户在某一步退出、关闭页面或长时间无后续动作 | `asin`, `step_id`, `step_name`, `drop_reason` | 识别内容断点与耐心流失点 |

## 4. 衍生指标说明

以下指标建议通过事件计算得出，而不是额外新增独立事件：

| 指标名称 | 计算方式 | 说明 |
|---|---|---|
| `step_1_stall_time` | `step_complete(step_1)` 时间 - `step_view(step_1)` 时间 | 反映 Step 1 是否仍然晦涩，停留过久说明 GIF 或说明不够清晰 |
| Tutorial Complete Rate | `step_complete(step_3)` / `tutorial_start` | 衡量 3 步教程完成率 |
| Resolved Rate | `resolved_status=yes` / `resolved_status` 总数 | 作为最核心业务结果指标 |
| Step Drop-off Rate | `dropout_step` 按步骤聚合 | 识别最容易流失的页面 |

## 5. 页面与事件映射

### 5.1 Landing Page

- `pwa_entry`
- `sku_view`
- `tutorial_start`

### 5.2 Step 1

- `step_view` with `step_id=1`
- `step_complete` with `step_id=1`

重点观察：

- `step_1_stall_time`
- 是否仍有大量用户在此流失

### 5.3 Step 2

- `step_view` with `step_id=2`
- `safety_trust_click`
- `step_complete` with `step_id=2`

### 5.4 Step 3

- `step_view` with `step_id=3`
- `step_complete` with `step_id=3`

### 5.5 Feedback

- `resolved_status`

### 5.6 Unresolved Reason

- `unresolved_reason_submit`

## 6. 推荐属性枚举

### 6.1 `step_id`

- `1`
- `2`
- `3`

### 6.2 `step_name`

- `lock_check`
- `safety_check`
- `door_placement`

### 6.3 `reason`

- `still_slips`
- `not_sure_locked`
- `stitching_safety`
- `wrong_placement`
- `door_damage_worry`
- `door_not_fit`

### 6.4 `recommended_review`

- `step_1`
- `step_2`
- `step_3`
- `support`

## 7. 阶段四复盘重点

阶段四数据复盘时，建议优先看以下问题：

- 从 `pwa_entry` 到 `tutorial_start` 的转化是否成立
- Step 1 是否仍然成为主要阻塞点
- 用户是否主动点击安全背书内容
- 最终 `resolved_status` 中 `yes/no` 的比例
- `unresolved_reason_submit` 中最集中的是哪类原因
- 是否需要优先回改 Step 1、Step 2 还是 Step 3

## 8. 结论

当前最小埋点方案已经足以支撑阶段二 PoC 和阶段四复盘。后续阶段如需扩展，应在不破坏当前事件稳定性的前提下新增字段或次级事件，而不是频繁重命名现有核心事件。
