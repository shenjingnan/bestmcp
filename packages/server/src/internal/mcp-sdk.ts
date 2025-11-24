/**
 * MCP SDK 统一导出模块
 * 用于解决 @modelcontextprotocol/sdk 包的导入路径问题
 */

export type { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js";
export { Server } from "@modelcontextprotocol/sdk/server/index.js";
export { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
export type { StreamableHTTPServerTransportOptions } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
export { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
export type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
// 重新导出 types.js 中的常用类型和 Schema
export type {
  CallToolRequest,
  CallToolResult,
  Implementation,
  ServerCapabilities,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
export {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
