# 阶段二：PoC Demo Runbook

## 1. 目标

本 Runbook 用于支持阶段二演示、闭环验证和后续归档复跑。

核心链路：

`Landing -> Step 1 -> Step 2 -> Step 3 -> Feedback -> Unresolved Reason -> Recommended Review`

## 2. 演示入口

- Base URL: `http://127.0.0.1:4173/?asin=B0BXJLTRSH&src=qr`
- 首批 ASIN: `B0BXJLTRSH`
- 建议演示模式：先演完整闭环，再演中途退出埋点

## 3. 准备步骤

1. 安装依赖：`npm.cmd install`
2. 构建项目：`npm.cmd run build`
3. 启动预览：`npx.cmd vite preview --host 127.0.0.1 --port 4173`
4. 如需自动验证，执行：`npm.cmd run verify:mobile -- --output docs/stages/stage-2/mobile-verification-results.json`

## 4. 标准演示脚本

1. 打开 Base URL，确认 Landing 显示 `B0BXJLTRSH`
2. 点击 `Start 3-step safety guide`
3. 在 Step 1 强调“错误穿法 vs 正确锁死”的区别
4. 进入 Step 2，点击 `Open proof`，展示安全信任埋点
5. 进入 Step 3，说明“合页侧安装”和“门板保护”逻辑
6. 在 Feedback 页选择 `No, still not solved`
7. 在 Unresolved Reason 页选择 `It still slips`
8. 点击 `Submit and review`，确认系统推荐回看 Step 1
9. 检查页面右下角 `PoC Event Log`，确认出现 `resolved_status` 和 `unresolved_reason_submit`

## 5. 中途退出验证脚本

1. 打开 Landing 并开始教程
2. 完成 Step 1，进入 Step 2
3. 在 Step 2 直接关闭页面或离开当前页
4. 重新打开应用
5. 检查事件记录中是否存在 `dropout_step`
6. 确认 `dropout_step` 的 `page=step2`、`step_name=safety_check`

## 6. 本次验证结果

- 构建验证：通过
- WebKit `iPhone 13` 闭环验证：通过
- Chromium `Pixel 7` 中途退出埋点验证：通过
- 结果文件： [mobile-verification-results.json](/F:/Users/Administrator/Desktop/SPAPP/docs/stages/stage-2/mobile-verification-results.json)
- 验证脚本： [verify-mobile-flow.mjs](/F:/Users/Administrator/Desktop/SPAPP/scripts/verify-mobile-flow.mjs)

## 7. 演示时建议重点强调

- Step 1 是首要价值点，因为它直接对应“压扣打滑”这一致命断点
- Step 2 的目标不是营销，而是降低康复用户对缝线断裂和弹伤的恐惧
- Step 3 负责处理“门板损坏”和“放置位置不确定”两类体验摩擦
- Feedback 和 Unresolved Reason 让教程从单向说明变成可回收数据的闭环

## 8. 当前边界

- 当前验证基于浏览器模拟，不等同于真实设备实测
- 当前埋点是本地日志兜底方案，不是正式分析平台
- 当前仍是单 ASIN PoC，不代表多 SKU 已准备完成
