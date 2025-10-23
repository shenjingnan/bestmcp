# BestMCP

BestMCP 是一个为 TypeScript 设计的 Model Context Protocol (MCP) 服务器框架，通过装饰器和 Zod 验证提供类型安全的工具声明方式。它简化了 MCP 服务器的开发流程，让开发者能够以声明式的方式定义工具和参数验证。

## 项目介绍

### 核心理念

BestMCP 的设计理念是提供类似 [FastMCP](https://github.com/jlowin/fastmcp) 的开发体验，但专为 TypeScript/Node.js 生态系统打造。
BestMCP 通过 TypeScript 装饰器语法和 Zod 验证库实现：

- **类型安全**：编译时类型检查和运行时验证双重保障
- **开发体验**：简洁直观的装饰器 API，减少样板代码
- **自动化**：自动生成 MCP 工具描述、参数验证和错误处理
- **扩展性**：支持复杂参数类型和高级功能配置

### 与 @modelcontextprotocol/sdk 的关系

BestMCP 目前是基于官方 `[@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)` 构建的框架，这帮助我们能更快的跟进官方对 MCP 的规范定义。
未来我们会考虑完全基于 MCP 协议规范重新实现。一旦完成我们将不再依赖 `@modelcontextprotocol/sdk`。

## 一个简单示例

```typescript
import { BestMCP, Param, Tool } from "bestmcp";
import { z } from "zod";

class CalculatorService {
  @Tool("计算两个数字的和")
  add(
    @Param(z.number(), "第一个值")
    a: number,
    @Param(z.number(), "第二个值")
    b: number,
  ): number {
    return a + b;
  }

  // ... 更多 MCP 工具
}

// 实例化 BestMCP
const mcp = new BestMCP({
  name: "calculator-stdio-mcp",
  version: "1.0.0",
});

// 注册工具类
mcp.register(CalculatorService);

// 启动服务
mcp.run();
```

### 🔄 自动 JSON Schema 生成

通过上述示例，我们可以直观的看到，使用 BestMCP 非常简单，只需要简单的定义即可使用。
一旦启动服务，BestMCP 将自动帮你生成 JSON Schema。这帮助你能更专注与功能实现。

### 支持的 MCP 通信方式

目前我们支持 STDIO 和 HTTP 两种方式的 MCP 服务，考虑到在开源 BestMCP 前，官方已废弃 SSE 方式，因此我们不再对 SSE 支持。

## 示例项目

我们在 `[examples/](./examples/)` 目录准备了一些示例，帮助你更好的理解如何使用。

## 安装和使用示例

### 安装

```bash
npm install bestmcp zod
# 或
pnpm add bestmcp zod
```

**依赖说明**:

- `bestmcp`: 核心框架包
- `zod`: 参数验证库（peer dependency，需要手动安装）

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更多资源

- [MCP 官方文档](https://modelcontextprotocol.io/)
- [Zod 验证库文档](https://zod.dev/)
- [TypeScript 装饰器文档](https://www.typescriptlang.org/docs/handbook/decorators.html)
