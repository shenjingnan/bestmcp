# BestMCP 客户端使用示例

这个示例展示了如何使用 `@bestmcp/client` 库连接和调用 MCP 服务器工具。

## 功能特性

- 连接到 stdio-mcp 服务器
- 自动发现可用工具
- 执行计算器运算（加法、减法、乘法、除法）
- 完整的错误处理和连接管理

## 前置要求

在运行此示例之前，需要先构建 stdio-mcp 服务器：

```bash
# 构建核心包
pnpm build:core

# 构建客户端包
pnpm -C packages/client build

# 构建 stdio-mcp 示例
pnpm -C examples/stdio-mcp build
```

## 运行示例

```bash
# 安装依赖
pnpm install

# 构建示例
pnpm build

# 运行示例
pnpm start
```

## 预期输出

```
🚀 BestMCP 客户端示例启动

📡 连接到 MCP 服务器...
✅ 服务器连接成功！

📋 已注册的服务器: stdio-mcp

🔧 获取可用工具列表...

📦 服务器: stdio-mcp
可用工具数量: 4
  - add: 计算两个数字的和
  - subtract: 计算两个数字的差
  - multiply: 计算两个数字的积
  - divide: 计算两个数字的商

🧮 测试计算器工具...
➕ 10 + 5 = 15
➖ 10 - 3 = 7
✖️ 6 * 7 = 42
➗ 20 / 4 = 5

✅ 所有工具调用测试成功！

🔌 断开服务器连接...
✅ 连接已断开
```

## 代码说明

### 客户端初始化

```typescript
import { BestMCPClient } from "@bestmcp/client";

const client = new BestMCPClient();
```

### 注册服务器

```typescript
client.registry("stdio-mcp", {
  command: "node",
  args: ["/path/to/stdio-mcp/dist/index.js"],
});
```

### 连接服务器

```typescript
await client.connect();
```

### 获取工具列表

```typescript
const toolsMap = await client.listTools();
for (const [serverName, tools] of toolsMap) {
  console.log(`服务器: ${serverName}, 工具数量: ${tools.length}`);
}
```

### 调用工具

```typescript
const result = await client.callTool("stdio-mcp", "add", {
  a: 10,
  b: 5,
});
console.log(`结果: ${result.content[0].text}`);
```

### 清理资源

```typescript
client.disconnect();
```