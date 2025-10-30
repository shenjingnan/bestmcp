// 统一导出入口 - 重新导出所有核心功能

export { Client } from "../packages/client/src/client";
export { MCPConnectionError, MCPToolError } from "../packages/client/src/errors";
export { BestMCPClient } from "../packages/client/src/manager";
// 客户端相关 - 直接从源码导入
export type { MCPServerConfig, MCPServerInfo, ToolDefinition, ToolResult } from "../packages/client/src/types";
export type { ToolMetadata } from "../packages/server/src/decorators";
export { Param, Tool } from "../packages/server/src/decorators";
export { ToolNotFoundError, ToolValidationError, ZodValidationError } from "../packages/server/src/errors";
export { BestMCP } from "../packages/server/src/server";
export { TransportManager } from "../packages/server/src/transport-manager";
export type { HttpConfig, ServerInfo, TransportConfig } from "../packages/server/src/transports";
export { BaseTransport, HTTPTransport, StdioTransport } from "../packages/server/src/transports";
// 服务端相关 - 直接从源码导入
export type { Config } from "../packages/server/src/types";
export type { ValidationResult } from "../packages/server/src/validation";
export { extractParameters, zodSchemaToJsonSchema } from "../packages/server/src/validation";
