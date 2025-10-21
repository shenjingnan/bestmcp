import type { ServerCapabilities } from "@modelcontextprotocol/sdk/types.js";
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
