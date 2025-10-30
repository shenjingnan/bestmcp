// 核心功能
export { Client } from "../packages/client/src/client";
export { MCPConnectionError, MCPToolError } from "../packages/client/src/errors";
export { BestMCPClient } from "../packages/client/src/manager";

// 客户端相关
export type { MCPServerConfig, MCPServerInfo, ToolDefinition, ToolResult } from "../packages/client/src/types";
export { Param, Tool } from "../packages/server/src/decorators";
export { ToolNotFoundError, ToolValidationError, ZodValidationError } from "../packages/server/src/errors";
export { BestMCP } from "../packages/server/src/server";
export { TransportManager } from "../packages/server/src/transport-manager";
export type { HttpConfig, TransportConfig } from "../packages/server/src/transports";
export { BaseTransport, HTTPTransport, StdioTransport } from "../packages/server/src/transports";

// 服务端相关
export type { BestMCPConfig as Config, ServerInfo, ToolMetadata, ValidationResult } from "../packages/server/src/types";
export { extractParameters, zodSchemaToJsonSchema } from "../packages/server/src/validation";
