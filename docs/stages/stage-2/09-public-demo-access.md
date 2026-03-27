# 阶段二：公开演示链接与二维码交付说明

## 1. 目标

本文件用于承接阶段二追加事项中的两项展示件：

1. 线上公开演示链接
2. 对应二维码

## 2. 当前状态

- GitHub Pages 发布工作流：已准备
- 二维码生成脚本：已准备
- GitHub CLI：已安装
- GitHub 登录状态：当前机器尚未完成 `gh auth login`
- 最终公开 URL：待连接 GitHub 远端仓库并完成 Pages 发布后回填
- 正式二维码资产：待基于最终公开 URL 生成

## 3. 标准公开演示入口

当前预期标准入口格式为：

`https://<github-username>.github.io/<repo>/?asin=B0BXJLTRSH&src=qr`

回填项：

- GitHub 仓库地址：待补充
- GitHub Pages 公开链接：待补充
- 标准演示链接：待补充

## 4. GitHub Pages 发布说明

已在仓库内准备 GitHub Pages 工作流：

- 路径：`.github/workflows/deploy-pages.yml`

工作流用途：

- 在 `master` 分支推送后自动构建 Stage 2 PoC
- 将 `dist/` 产物发布到 GitHub Pages
- 使用仓库名自动设置 `VITE_BASE_PATH`

## 5. 二维码资产说明

已在仓库内准备二维码生成脚本：

- 推荐命令：`$env:STAGE2_DEMO_URL='<public-demo-url>'; npm.cmd run generate:stage2-qr`
- 默认输出目录：`docs/stages/stage-2/assets/qr`

输出文件包括：

- `stage2-demo-qr.png`
- `stage2-demo-qr.svg`
- `stage2-demo-qr.txt`

## 6. 验证记录

当前验证状态：

- 本地构建通过
- GitHub Pages 工作流文件已创建
- 二维码生成脚本已创建
- 示例 URL 下的脚本产物已验证可生成，正式资产需等待最终公开 URL
- GitHub 账号授权尚未完成，因此公开发布仍处于阻塞状态
- 公开访问验证：待 GitHub 远端仓库接通后完成
- 二维码扫码验证：待最终公开 URL 生成后完成

## 7. 回填要求

当 GitHub 远端仓库接通并完成正式发布后，需要回填以下信息：

1. GitHub 仓库地址
2. GitHub Pages URL
3. 最终标准演示链接
4. 二维码产物路径
5. 公开访问验证结果
6. 手机扫码验证结果
