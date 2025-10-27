import { Client as SDKClient } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { CallToolResult, Tool } from "@modelcontextprotocol/sdk/types.js";
import { MCPConnectionError, MCPToolError } from "./errors.js";
import type { MCPServerConfig, ToolDefinition, ToolResult } from "./types.js";

/**
 * 单个 MCP 客户端
 * 专注于单个MCP服务器的连接和操作
 */
export class Client {
  private readonly serverName: string;
  private readonly config: MCPServerConfig;
  private client: SDKClient | undefined;
  private transport: StdioClientTransport | undefined;
  private isConnected = false;

  constructor(serverName: string, config: MCPServerConfig) {
    this.serverName = serverName;
    this.config = config;
  }

  /**
   * 连接到 MCP 服务器
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      // 创建 MCP 客户端
      this.client = new SDKClient({
        name: "bestmcp-client",
        version: "1.0.0",
      });

      // 创建 stdio 传输层
      const transportConfig = this.buildTransportConfig();
      this.transport = new StdioClientTransport(transportConfig);

      // 连接到服务器
      await this.client.connect(this.transport);
      this.isConnected = true;
    } catch (error) {
      throw new MCPConnectionError(this.serverName, "连接失败", error as Error);
    }
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    if (this.transport) {
      try {
        await this.transport.close();
      } catch (error) {
        console.warn(`断开连接时出现警告: ${error}`);
      }
    }

    this.client = undefined;
    this.transport = undefined;
    this.isConnected = false;
  }

  /**
   * 检查连接状态
   */
  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  /**
   * 获取工具列表
   */
  async listTools(): Promise<ToolDefinition[]> {
    if (!this.isConnected || !this.client) {
      throw new MCPConnectionError(this.serverName, "未连接到服务器");
    }

    try {
      const toolsResult = await this.client.listTools();
      return toolsResult.tools.map(this.convertToolDefinition);
    } catch (error) {
      throw new MCPConnectionError(this.serverName, "获取工具列表失败", error as Error);
    }
  }

  /**
   * 调用工具
   */
  async callTool(toolName: string, args: Record<string, unknown> = {}): Promise<ToolResult> {
    if (!this.isConnected || !this.client) {
      throw new MCPConnectionError(this.serverName, "未连接到服务器");
    }

    try {
      const result = await this.client.callTool({
        name: toolName,
        arguments: args,
      });

      return this.convertToolResult(result as CallToolResult);
    } catch (error) {
      throw new MCPToolError(this.serverName, toolName, "工具调用失败", error as Error);
    }
  }

  /**
   * 获取服务器名称
   */
  getServerName(): string {
    return this.serverName;
  }

  /**
   * 构建传输层配置
   */
  private buildTransportConfig(): {
    command: string;
    args?: string[];
    cwd?: string;
    env: Record<string, string>;
  } {
    const config = {
      command: this.config.command,
      args: this.config.args || [],
      env: this.mergeEnvironmentVariables(),
    };

    if (this.config.cwd !== undefined) {
      (config as Record<string, unknown>)["cwd"] = this.config.cwd;
    }

    return config;
  }

  /**
   * 合并环境变量
   */
  private mergeEnvironmentVariables(): Record<string, string> {
    const baseEnv = { ...process.env };
    const result: Record<string, string> = {};

    const combinedEnv = this.config.env ? { ...baseEnv, ...this.config.env } : baseEnv;

    for (const [key, value] of Object.entries(combinedEnv)) {
      if (value !== undefined) {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * 转换工具定义
   */
  private convertToolDefinition(tool: Tool): ToolDefinition {
    return {
      name: tool.name,
      description: tool.description || undefined,
      inputSchema: tool.inputSchema as Record<string, unknown>,
    };
  }

  /**
   * 转换工具结果
   */
  private convertToolResult(result: CallToolResult): ToolResult {
    return {
      content: result.content.map((item) => ({
        type: item.type,
        text: "text" in item ? String(item.text) : JSON.stringify(item),
      })),
      isError: result.isError ?? false,
    };
  }
}
