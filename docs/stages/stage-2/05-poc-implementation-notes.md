# 阶段二：PoC 实施说明

## 1. 当前实现范围

当前 PoC 已实现以下闭环页面：

- Landing
- Step 1：Lock check
- Step 2：Safety check
- Step 3：Door placement
- Feedback
- Unresolved Reason

首批 SKU 固定为：

- `B0BXJLTRSH`

## 2. 当前技术实现

- 前端工程：Vite + React
- 入口文件：[index.tsx](/F:/Users/Administrator/Desktop/SPAPP/index.tsx)
- PWA 入口文件：[manifest.webmanifest](/F:/Users/Administrator/Desktop/SPAPP/manifest.webmanifest)
- 应用图标：[icon.svg](/F:/Users/Administrator/Desktop/SPAPP/icon.svg)

## 3. 内容结构

当前首批教程内容通过结构化对象定义在入口文件中，按 ASIN 读取，便于后续迁移到 JSON 或表格导出结构。

已覆盖的内容要点：

- Step 1：压扣打滑与正确锁死
- Step 2：缝线安全背书
- Step 3：门板保护与合页侧安装
- Feedback：是否解决
- Unresolved Reason：未解决原因与推荐回看步骤

## 4. 当前埋点实现

当前 PoC 已接入以下事件，并通过 `localStorage` 方式做本地日志回收：

- `pwa_entry`
- `sku_view`
- `tutorial_start`
- `step_view`
- `step_complete`
- `safety_trust_click`
- `resolved_status`
- `unresolved_reason_submit`
- `dropout_step`

说明：

- 当前事件会显示在页面右下角的 PoC Event Log 中
- 当前日志方案适合作为 Stage 2 本地验证兜底
- 后续可替换为 PostHog、GA4 或其他正式接入方式
- `dropout_step` 已在页面离开时记录当前步骤上下文，用于识别中途流失位置

## 5. 运行与验证

本地开发：

```bash
npm.cmd install
npm.cmd run dev
```

生产构建验证：

```bash
npm.cmd run build
```

移动端模拟验证：

```bash
npx.cmd vite preview --host 127.0.0.1 --port 4173
npm.cmd run verify:mobile -- --output docs/stages/stage-2/mobile-verification-results.json
```

当前状态：

- 依赖已安装
- 本地构建已通过
- WebKit（iPhone 13）闭环验证已通过
- Chromium（Pixel 7）中途退出埋点验证已通过

## 6. 当前限制

- 当前只支持首批单一 ASIN
- 页面通过 URL hash 标识当前步骤，但仍是单入口应用
- 埋点目前为本地事件日志方案，尚未接正式分析平台
- 页面内容目前仍在代码内，尚未拆成独立 JSON 文件
- 移动端验证目前基于浏览器模拟，尚未补充真实 iPhone Safari / Android Chrome 实机记录

## 7. 下一步建议

1. 将内容抽离为独立 JSON 文件并按 ASIN 建模
2. 接入正式埋点平台
3. 增加线上部署、二维码验证和真实设备回归
4. 用真实素材替换当前 PoC 级静态说明
5. 根据 [07-mvp-backlog-findings.md](/F:/Users/Administrator/Desktop/SPAPP/docs/stages/stage-2/07-mvp-backlog-findings.md) 进入阶段三排期
