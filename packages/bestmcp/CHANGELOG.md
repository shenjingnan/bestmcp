# bestmcp

## 0.1.3

### Patch Changes

- 6b3bebd: ## 改进

  - 为 `bestmcp` npm 包添加了专用的 README.md 文档，改善用户在 NPM 平台的阅读体验
  - 移除了服务器启动时的调试日志输出，提升用户体验
  - 优化了文档结构，专注于快速开始和核心功能介绍

  ## 详情

  新增的 README 文档为 npm 包用户提供了：

  - 清晰的安装指南和快速开始示例
  - 装饰器声明式编程的使用方法
  - 传输层支持（STDIO 和 HTTP）的详细说明
  - 相关文档和资源的链接

  这些改动主要是文档和体验优化，不涉及 API 变更。

- Updated dependencies [6b3bebd]
  - @bestmcp/server@0.1.3
  - @bestmcp/client@0.1.3

## 0.1.2

### Patch Changes

- 7014ba1: 优化 TypeScript 配置，从 include 中排除 examples 目录

  - 修改 config/tsconfig.json，移除对 examples 目录的 TypeScript 编译
  - 提高构建性能，避免编译不必要的示例代码
  - 只保留 packages 目录的 TypeScript 编译，更专注于核心库代码
  - @bestmcp/server@0.1.2
  - @bestmcp/client@0.1.2

## 0.1.1

### Patch Changes

- 95dc26c: tt
- 480de77: 迁移到 changesets 版本管理
  - 从 release-it 迁移到 changesets
  - 配置固定版本模式
  - 更新 GitHub Actions 工作流
  - 添加 changesets 使用文档
- 0.0.9
- Updated dependencies [95dc26c]
- Updated dependencies
  - @bestmcp/client@0.1.1
  - @bestmcp/server@0.1.1

## 0.1.1-beta.5

### Patch Changes

- tt
- Updated dependencies
  - @bestmcp/client@0.1.1-beta.5
  - @bestmcp/server@0.1.1-beta.5
