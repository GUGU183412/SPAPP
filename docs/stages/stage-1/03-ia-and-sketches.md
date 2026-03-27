# 交付物 3：信息架构与核心页面草图

## 1. 文档目的

本文件用于定义阶段一的核心页面结构与信息流，作为后续 UI 实现、埋点布置与内容填充的页面蓝图。

## 2. 信息架构

1. Landing Page
2. Step 1：防呆锁死
3. Step 2：安全背书
4. Step 3：门板保护
5. Feedback：是否解决
6. Unresolved Reason：未解决原因补充页

## 3. 页面定义

### 3.1 Landing Page

目标：

- 确认型号
- 建立专业与安全感
- 引导开始 3 步安全安装

核心内容：

- 欢迎语
- `ASIN: B0BXJLTRSH` 确认
- `3-Step Safety Installation Guide` 按钮

参考稿：

- [landing-page-v1.html](/F:/Users/Administrator/Desktop/SPAPP/docs/ui-mockups/landing-page-v1.html)

### 3.2 Step 1：防呆锁死

目标：

- 解决“压扣打滑”这个致命断点
- 帮用户判断正确 / 错误穿法

核心内容：

- 错误穿法 vs 正确锁死穿法
- 锁死判断文案
- 下一步按钮

当前较优参考稿：

- [step1-v2.html](/F:/Users/Administrator/Desktop/SPAPP/docs/ui-mockups/step1-v2.html)

### 3.3 Step 2：安全背书

目标：

- 缓解对缝线断裂和安全性的焦虑

核心内容：

- 缝线工艺微距图
- 承重 / 安全说明
- 使用边界或停止条件提示

参考稿：

- [step2-v1.html](/F:/Users/Administrator/Desktop/SPAPP/docs/ui-mockups/step2-v1.html)

### 3.4 Step 3：门板保护

目标：

- 回应伤门担忧
- 帮用户确定安装位置，尤其是合页侧

核心内容：

- 背部材质图
- “Hinge Side” 明确提示
- “Never Latch Side” 反向提示
- `Done, let's start!`

当前较优参考稿：

- [step3-v2.html](/F:/Users/Administrator/Desktop/SPAPP/docs/ui-mockups/step3-v2.html)

### 3.5 Feedback

目标：

- 收集教程是否解决问题

核心内容：

- `Problem Resolved?`
- `Yes`
- `No, still slip`

参考稿：

- [feedback-v1.html](/F:/Users/Administrator/Desktop/SPAPP/docs/ui-mockups/feedback-v1.html)

### 3.6 Unresolved Reason

目标：

- 把“没解决”拆成结构化原因
- 引导用户回看最相关步骤

核心内容：

- `What is still not resolved?`
- 结构化原因选项
- 推荐回看步骤提示
- 可选补充备注

当前较优参考稿：

- [unresolved-reason-v2.html](/F:/Users/Administrator/Desktop/SPAPP/docs/ui-mockups/unresolved-reason-v2.html)

## 4. 当前页面链路结论

阶段一页面骨架已基本成形，且页面职责清晰：

- Landing Page 负责确认型号与启动
- Step 1-3 负责逐步建立正确安装与安全信任
- Feedback 和 Unresolved Reason 负责完成业务与数据闭环

该 IA 已足够支持阶段二 PoC 搭建。
