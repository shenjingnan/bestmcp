# bestmcp

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
