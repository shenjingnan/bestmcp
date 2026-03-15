---
"bestmcp": patch
"@bestmcp/server": patch
"@bestmcp/client": patch
---

修复 release 命令使用生产模式构建

- 在 `pnpm release` 命令中添加 `NODE_ENV=production` 环境变量
- 确保发布时启用代码压缩和移除 console/debugger 语句
- 生成更小、更优化的生产环境代码