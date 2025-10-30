// 类型定义

// 客户端类
export { Client } from "./client";

// 错误类
export {
  MCPConnectionError,
  MCPToolError,
} from "./errors";
export { BestMCPClient } from "./manager";
export type {
  MCPServerConfig,
  MCPServerInfo,
  ToolDefinition,
  ToolResult,
} from "./types";
