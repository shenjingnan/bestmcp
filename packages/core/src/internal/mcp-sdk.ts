/**
 * MCP SDK 统一导出模块
 * 用于解决 @modelcontextprotocol/sdk 包的导入路径问题
 */
export { Server } from "@modelcontextprotocol/sdk/server/index.js";
export { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
export type { StreamableHTTPServerTransportOptions } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
export { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
export type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
