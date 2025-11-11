# BestMCP

BestMCP 是一个为 TypeScript 设计的 Model Context Protocol (MCP) 服务器框架，通过装饰器和 Zod 验证提供类型安全的工具声明方式。它简化了 MCP 服务器的开发流程，让开发者能够以声明式的方式定义工具和参数验证。

## ✨ 特性

- 🎯 **类型安全**：编译时类型检查和运行时验证双重保障，避免参数错误
- 🚀 **开发体验**：简洁直观的装饰器 API，大幅减少样板代码
- 🤖 **自动化**：自动生成 MCP 工具描述、JSON Schema 和错误处理
- 🔧 **扩展性**：支持复杂参数类型、异步操作和高级功能配置
- 🌐 **多传输层**：支持 STDIO 和 HTTP 两种通信方式，按需切换
- 📦 **零配置**：开箱即用，无需复杂的配置文件

## 🚀 快速开始

### 安装

```bash
npm install bestmcp zod
# 或
pnpm add bestmcp zod
```

**依赖说明**:

- `bestmcp`: 核心框架包
- `zod`: 参数验证库（peer dependency，需要手动安装）

### 第一个 MCP 服务器

创建一个简单的计算器服务：

```typescript
import { BestMCP, Param, Tool } from "bestmcp";
import { z } from "zod";

class CalculatorService {
  @Tool("计算两个数字的和")
  add(
    @Param(z.number(), "第一个值")
    a: number,
    @Param(z.number(), "第二个值")
    b: number
  ): number {
    return a + b;
  }

  @Tool("计算两个数字的积")
  multiply(
    @Param(z.number(), "第一个值")
    a: number,
    @Param(z.number(), "第二个值")
    b: number
  ): number {
    return a * b;
  }
}

// 实例化 BestMCP
const mcp = new BestMCP({
  name: "calculator-server",
  version: "1.0.0",
});

// 注册工具类
mcp.register(CalculatorService);

// 启动服务
mcp.run();
```

运行后，BestMCP 会自动：

- 解析装饰器元数据
- 生成 JSON Schema
- 注册工具到 MCP 服务器
- 处理工具调用和参数验证

## 💡 核心概念

### 装饰器声明式编程

BestMCP 使用 TypeScript 装饰器提供声明式的工具定义方式：

```typescript
class MyService {
  @Tool("工具描述")
  async myMethod(
    @Param(z.string(), "参数描述") param: string
  ): Promise<string> {
    return `处理结果: ${param}`;
  }
}
```

### 自动化 Schema 生成

BestMCP 会自动将 Zod 验证规则转换为 JSON Schema，无需手动编写：

- ✅ 类型定义和验证规则
- ✅ 参数描述和约束
- ✅ 错误处理和响应格式

## 📖 使用指南

### 高级参数类型

```typescript
class UserService {
  @Tool("创建用户")
  createUser(
    @Param(
      z.object({
        name: z.string().min(1),
        age: z.number().min(0),
        email: z.string().email().optional(),
      }),
      "用户信息"
    )
    user: UserInfo
  ): Promise<User> {
    // 实现用户创建逻辑
    return createdUser;
  }
}
```

### 异步操作支持

```typescript
class ApiService {
  @Tool("获取用户信息")
  async getUser(
    @Param(z.string(), "用户ID")
    userId: string
  ): Promise<User> {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  }
}
```

## 🌐 传输层支持

BestMCP 支持多种 MCP 通信方式，可以根据使用场景选择合适的传输层。

### STDIO 模式

适用于命令行工具和脚本集成：

```typescript
// 默认 STDIO 模式
const mcp = new BestMCP({
  name: "my-tool",
  version: "1.0.0",
});

mcp.run();
```

**使用场景**：

- 命令行工具集成
- CI/CD 流水线
- 本地开发工具

### HTTP 模式

适用于 Web 应用和微服务架构：

```typescript
// HTTP 模式
const mcp = new BestMCP({
  name: "my-api",
  version: "1.0.0",
});

mcp.run({
  transport: "http",
  port: 3000,
});
```

**使用场景**：

- Web 应用后端
- 微服务架构
- API 服务集成

### 传输层切换

支持运行时动态切换传输层：

```typescript
const mcp = new BestMCP({
  name: "flexible-tool",
  version: "1.0.0",
});

// 根据环境变量选择传输层
const transport = process.env.HTTP_MODE ? "http" : "stdio";
const options = transport === "http" ? { port: 3000 } : {};

mcp.run({ transport, ...options });
```

## 🔗 相关链接

- [完整文档](https://github.com/shenjingnan/bestmcp/blob/main/README.md)
- [示例项目](https://github.com/shenjingnan/bestmcp/tree/main/examples)
- [MCP 官方文档](https://modelcontextprotocol.io/)
- [Zod 验证库文档](https://zod.dev/)
- [更新日志](https://github.com/shenjingnan/bestmcp/blob/main/packages/bestmcp/CHANGELOG.md)

## 📄 许可证

MIT License - 详见 [LICENSE](https://github.com/shenjingnan/bestmcp/blob/main/LICENSE) 文件