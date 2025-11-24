# @bestmcp/client

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
