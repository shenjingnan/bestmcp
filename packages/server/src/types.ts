import type { ServerCapabilities } from "@server/internal/mcp-sdk";
import type { z } from "zod";

// 类型定义
export interface ToolMetadata {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, JsonSchema>;
    required: string[];
  };
}

// 工具执行器的类型定义
export interface ToolExecutor {
  metadata: ToolMetadata;
  handler: (...args: unknown[]) => unknown;
  paramZodSchemas?: Record<string, z.ZodType<unknown>>;
}

// 参数类型定义
export interface ParamTypeMetadata {
  name?: string;
  required: boolean;
  index: number;
  type?: string;
  schema?: JsonSchema;
  zodSchema?: z.ZodType<unknown>;
  description?: string;
  enum?: unknown[];
  items?: JsonSchema;
  properties?: Record<string, JsonSchema>;
}

// JSON Schema 类型定义
export interface JsonSchema {
  type: string;
  description?: string;
  enum?: unknown[];
  items?: JsonSchema;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  default?: unknown;
}

// 元数据存储
export const TOOLS_METADATA = Symbol("tools");
export const TOOL_PARAM_METADATA = Symbol("tool:params");

// 运行时配置接口
export interface RunOptions {
  transport?: "stdio" | "http";
  port?: number;
  host?: string;
}

// BestMCP 配置接口
export interface BestMCPConfig {
  name?: string;
  version?: string;
  capabilities?: ServerCapabilities;
  instructions?: string;
}

// 验证结果接口
export interface ValidationResult {
  isValid: boolean;
  errors?: Array<{
    path: string;
    message: string;
    code?: string;
  }>;
  data?: unknown;
}

// 服务器信息接口
export interface ServerInfo {
  name: string;
  version?: string;
  host?: string;
  port?: number;
  protocol: "stdio" | "http";
  status: "running" | "stopped" | "error";
  capabilities?: ServerCapabilities;
}
