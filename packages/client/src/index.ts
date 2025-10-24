import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { CallToolResult, Tool } from "@modelcontextprotocol/sdk/types.js";

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
  client?: Client;
  transport?: StdioClientTransport;
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

/**
 * MCP 连接错误
 */
export class MCPConnectionError extends Error {
  public override readonly name = "MCPConnectionError";
  public readonly serverName: string;
  public override readonly cause?: Error | undefined;

  constructor(serverName: string, message: string, cause?: Error) {
    super(`MCP 连接错误 [${serverName}]: ${message}`);
    this.serverName = serverName;
    this.cause = cause;
  }
}

/**
 * MCP 工具执行错误
 */
export class MCPToolError extends Error {
  public override readonly name = "MCPToolError";
  public readonly serverName: string;
  public readonly toolName: string;
  public override readonly cause?: Error | undefined;

  constructor(serverName: string, toolName: string, message: string, cause?: Error) {
    super(`MCP 工具执行错误 [${serverName}:${toolName}]: ${message}`);
    this.serverName = serverName;
    this.toolName = toolName;
    this.cause = cause;
  }
}

/**
 * BestMCP 客户端类
 * 使用 @modelcontextprotocol/sdk 简化实现
 */
export class BestMCPClient {
  private readonly mcpServers: Map<string, MCPServerInfo> = new Map();

  /**
   * 注册 MCP 服务器
   * @param name 服务器名称
   * @param config 服务器配置
   */
  registry(name: string, config: MCPServerConfig): void {
    this.mcpServers.set(name, {
      name,
      config,
      isConnected: false,
    });
  }

  /**
   * 连接到指定的 MCP 服务器
   * @param serverName 服务器名称，如果不指定则连接所有已注册的服务器
   */
  async connect(serverName?: string): Promise<void> {
    if (serverName) {
      await this.connectSingle(serverName);
    } else {
      const promises = Array.from(this.mcpServers.keys()).map((name) => this.connectSingle(name));
      await Promise.all(promises);
    }
  }

  /**
   * 获取工具列表
   * @param serverName 服务器名称，如果不指定则获取所有服务器的工具
   * @returns 工具列表
   */
  async listTools(serverName?: string): Promise<Map<string, ToolDefinition[]>> {
    const result = new Map<string, ToolDefinition[]>();

    if (serverName) {
      const tools = await this.getServerTools(serverName);
      result.set(serverName, tools);
    } else {
      for (const name of this.mcpServers.keys()) {
        const tools = await this.getServerTools(name);
        result.set(name, tools);
      }
    }

    return result;
  }

  /**
   * 调用指定服务器的工具
   * @param serverName 服务器名称
   * @param toolName 工具名称
   * @param args 工具参数
   * @returns 工具执行结果
   */
  async callTool(serverName: string, toolName: string, args: Record<string, unknown> = {}): Promise<ToolResult> {
    const serverInfo = this.mcpServers.get(serverName);
    if (!serverInfo) {
      throw new MCPConnectionError(serverName, "服务器未注册，请先使用 registry() 注册服务器");
    }

    if (!serverInfo.isConnected || !serverInfo.client) {
      throw new MCPConnectionError(serverName, "服务器未连接，请先使用 connect() 建立连接");
    }

    try {
      // 使用 SDK 的 callTool 方法
      const result = await serverInfo.client.callTool({
        name: toolName,
        arguments: args,
      });

      // 转换为我们的兼容格式
      return this.convertToolResult(result as CallToolResult);
    } catch (error) {
      throw new MCPToolError(serverName, toolName, "工具调用失败", error as Error);
    }
  }

  /**
   * 断开所有服务器连接
   */
  async disconnect(): Promise<void> {
    const promises = Array.from(this.mcpServers.values()).map(async (serverInfo) => {
      if (serverInfo.transport) {
        try {
          await serverInfo.transport.close();
        } catch (error) {
          // 忽略关闭错误，继续断开其他连接
          console.warn(`断开连接时出现警告: ${error}`);
        }
      }
      serverInfo.isConnected = false;
      (serverInfo as unknown as { client: Client | undefined }).client = undefined;
      (serverInfo as unknown as { transport: StdioClientTransport | undefined }).transport = undefined;
    });

    await Promise.all(promises);
  }

  /**
   * 获取已注册的服务器列表
   */
  getServerNames(): string[] {
    return Array.from(this.mcpServers.keys());
  }

  /**
   * 检查服务器连接状态
   */
  isServerConnected(serverName: string): boolean {
    const serverInfo = this.mcpServers.get(serverName);
    return serverInfo?.isConnected ?? false;
  }

  /**
   * 连接单个服务器
   */
  private async connectSingle(serverName: string): Promise<void> {
    const serverInfo = this.mcpServers.get(serverName);
    if (!serverInfo) {
      throw new MCPConnectionError(serverName, "服务器未注册，请先使用 registry() 注册服务器");
    }

    if (serverInfo.isConnected) {
      return;
    }

    try {
      // 创建 MCP 客户端
      const client = new Client({
        name: "bestmcp-client",
        version: "1.0.0",
      });

      // 创建 stdio 传输层
      const transportConfig: any = {
        command: serverInfo.config.command,
        args: serverInfo.config.args || [],
        env: serverInfo.config.env
          ? (() => {
              const combined = { ...process.env, ...serverInfo.config.env };
              const result: Record<string, string> = {};
              for (const [key, value] of Object.entries(combined)) {
                if (value !== undefined) {
                  result[key] = value;
                }
              }
              return result;
            })()
          : (() => {
              const result: Record<string, string> = {};
              for (const [key, value] of Object.entries(process.env)) {
                if (value !== undefined) {
                  result[key] = value;
                }
              }
              return result;
            })(),
      };

      if (serverInfo.config.cwd !== undefined) {
        transportConfig.cwd = serverInfo.config.cwd;
      }

      const transport = new StdioClientTransport(transportConfig);

      // 连接到服务器
      await client.connect(transport);

      (serverInfo as any).client = client;
      (serverInfo as any).transport = transport;
      serverInfo.isConnected = true;
    } catch (error) {
      throw new MCPConnectionError(serverName, "启动服务器失败", error as Error);
    }
  }

  /**
   * 获取指定服务器的工具列表
   */
  private async getServerTools(serverName: string): Promise<ToolDefinition[]> {
    const serverInfo = this.mcpServers.get(serverName);
    if (!serverInfo?.isConnected || !(serverInfo as any).client) {
      throw new MCPConnectionError(serverName, "服务器未连接");
    }

    try {
      // 使用 SDK 的 listTools 方法
      const toolsResult = await (serverInfo as any).client.listTools();

      // 转换为我们的兼容格式
      return toolsResult.tools.map(this.convertToolDefinition);
    } catch (error) {
      throw new MCPConnectionError(serverName, "获取工具列表失败", error as Error);
    }
  }

  /**
   * 转换 SDK 工具定义为我们的兼容格式
   */
  private convertToolDefinition(tool: Tool): ToolDefinition {
    return {
      name: tool.name,
      description: tool.description || undefined,
      inputSchema: tool.inputSchema as Record<string, unknown>,
    };
  }

  /**
   * 转换 SDK 工具结果为我们的兼容格式
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
