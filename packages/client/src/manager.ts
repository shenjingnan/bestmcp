import { Client } from "./client.js";
import { MCPConnectionError } from "./errors.js";
import type { MCPServerConfig, ToolDefinition, ToolResult } from "./types.js";

/**
 * 多 MCP 客户端管理器
 * 提供统一的多服务器管理功能
 */
export class BestMCPClient {
  private readonly clients: Map<string, Client> = new Map();

  /**
   * 注册 MCP 服务器
   */
  registry(name: string, config: MCPServerConfig): void {
    const client = new Client(name, config);
    this.clients.set(name, client);
  }

  /**
   * 注销 MCP 服务器
   */
  unregistry(name: string): void {
    const client = this.clients.get(name);
    if (client) {
      client.disconnect().catch(console.warn);
      this.clients.delete(name);
    }
  }

  /**
   * 连接到指定的 MCP 服务器
   */
  async connect(serverName?: string): Promise<void> {
    if (serverName) {
      await this.connectSingle(serverName);
    } else {
      const promises = Array.from(this.clients.keys()).map((name) => this.connectSingle(name));
      await Promise.all(promises);
    }
  }

  /**
   * 断开所有服务器连接
   */
  async disconnect(): Promise<void> {
    const promises = Array.from(this.clients.values()).map((client) => client.disconnect());
    await Promise.all(promises);
  }

  /**
   * 查找指定的客户端
   */
  findMCP(name: string): Client {
    const client = this.clients.get(name);
    if (!client) {
      throw new MCPConnectionError(name, "客户端未注册");
    }
    return client;
  }

  /**
   * 获取工具列表
   */
  async listTools(serverName?: string): Promise<Map<string, ToolDefinition[]>> {
    const result = new Map<string, ToolDefinition[]>();

    if (serverName) {
      const client = this.findMCP(serverName);
      const tools = await client.listTools();
      result.set(serverName, tools);
    } else {
      for (const [name, client] of this.clients) {
        if (client.isConnectedToServer()) {
          const tools = await client.listTools();
          result.set(name, tools);
        }
      }
    }

    return result;
  }

  /**
   * 调用指定服务器的工具
   */
  async callTool(serverName: string, toolName: string, args: Record<string, unknown> = {}): Promise<ToolResult> {
    const client = this.findMCP(serverName);
    return await client.callTool(toolName, args);
  }

  /**
   * 检查服务器连接状态
   */
  isServerConnected(name: string): boolean {
    const client = this.clients.get(name);
    return client?.isConnectedToServer() ?? false;
  }

  /**
   * 获取已注册的服务器列表
   */
  getServerNames(): string[] {
    return Array.from(this.clients.keys());
  }

  /**
   * 获取已连接的服务器列表
   */
  getConnectedServers(): string[] {
    return Array.from(this.clients.entries())
      .filter(([, client]) => client.isConnectedToServer())
      .map(([name]) => name);
  }

  /**
   * 连接单个服务器
   */
  private async connectSingle(serverName: string): Promise<void> {
    const client = this.clients.get(serverName);
    if (!client) {
      throw new MCPConnectionError(serverName, "服务器未注册");
    }

    if (!client.isConnectedToServer()) {
      await client.connect();
    }
  }
}
