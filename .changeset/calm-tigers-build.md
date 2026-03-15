---
"bestmcp": patch
"@bestmcp/server": patch
"@bestmcp/client": patch
---

修改构建配置：`pnpm build` 默认使用生产环境构建

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