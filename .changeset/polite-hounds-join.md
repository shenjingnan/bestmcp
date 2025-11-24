---
"bestmcp": patch
"@bestmcp/server": patch
"@bestmcp/client": patch
---

修复 Zod 类型检测和多实例兼容性问题

- 修复 zodSchemaToJsonSchema 函数中使用 instanceof 检测类型的问题，改为使用 _def.typeName 进行类型判断
- 优化 isZodSchemaOptional 函数的可选类型检测逻辑，增强多 Zod 实例兼容性
- 新增全面的测试用例覆盖可选类型处理和多实例兼容性场景
- 在 stdio-mcp 示例中添加可选参数测试工具方法
- 修复函数参数声明中的尾随逗号格式问题