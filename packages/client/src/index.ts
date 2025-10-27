// 类型定义

// 客户端类
export { Client } from "./client.js";

// 错误类
export {
  MCPConnectionError,
  MCPToolError,
} from "./errors.js";
export { BestMCPClient } from "./manager.js";
export type {
  MCPServerConfig,
  MCPServerInfo,
  ToolDefinition,
  ToolResult,
} from "./types.js";
