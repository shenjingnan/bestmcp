---
"bestmcp": patch
---

优化 TypeScript 配置，从 include 中排除 examples 目录

- 修改 config/tsconfig.json，移除对 examples 目录的 TypeScript 编译
- 提高构建性能，避免编译不必要的示例代码
- 只保留 packages 目录的 TypeScript 编译，更专注于核心库代码