/**
 * MCP 服务器配置接口
 */
export interface MCPServerConfig {
  /** 启动命令 */
  command: string;
  /** 命令参数 */
  args?: string[];
  /** 工作目录 */
  cwd?: string;
  /** 环境变量 */
  env?: Record<string, string>;
}

/**
 * MCP 服务器信息
 */
export interface MCPServerInfo {
  name: string;
  config: MCPServerConfig;
  client?: unknown;
  transport?: unknown;
  isConnected: boolean;
}

/**
 * 工具定义接口（兼容性包装）
 */
export interface ToolDefinition {
  name: string;
  description?: string | undefined;
  inputSchema: Record<string, unknown>;
}

/**
 * 工具执行结果（兼容性包装）
 */
export interface ToolResult {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}
