# @bestmcp/server

## 0.2.2

### Patch Changes

- ff67117: 修复 release 命令使用生产模式构建

  - 在 `pnpm release` 命令中添加 `NODE_ENV=production` 环境变量
  - 确保发布时启用代码压缩和移除 console/debugger 语句
  - 生成更小、更优化的生产环境代码

## 0.2.1

### Patch Changes

- 6cea3bd: 修改构建配置：`pnpm build` 默认使用生产环境构建

  **变更内容**：

  - 将 `build` 脚本修改为默认设置 `NODE_ENV=production`
  - 移除冗余的 `build:prod` 脚本（功能已合并到 `build`）

  **影响**：

  - `pnpm build` 现在输出压缩后的生产版本
  - 自动移除 `console.log` 和 `debugger` 语句
  - `pnpm dev` 保持开发模式，输出未压缩代码

  **用户价值**：

  - 简化构建流程，无需额外记住 `build:prod` 命令
  - 确保发布到 npm 的代码是优化后的生产版本

## 0.2.0

### Minor Changes

- 发布 0.2.0 版本

## 0.1.4

### Patch Changes

- b99be3a: 修复 Zod 类型检测和多实例兼容性问题

  - 修复 zodSchemaToJsonSchema 函数中使用 instanceof 检测类型的问题，改为使用 \_def.typeName 进行类型判断
  - 优化 isZodSchemaOptional 函数的可选类型检测逻辑，增强多 Zod 实例兼容性
  - 新增全面的测试用例覆盖可选类型处理和多实例兼容性场景
  - 在 stdio-mcp 示例中添加可选参数测试工具方法
  - 修复函数参数声明中的尾随逗号格式问题

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

## 0.1.2

## 0.1.1

### Patch Changes

- 95dc26c: tt
- 0.0.9

## 0.1.1-beta.5

### Patch Changes

- tt
