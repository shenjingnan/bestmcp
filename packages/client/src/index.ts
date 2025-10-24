export class BestMCPClient {
  private mcpServers: Map<string, {
    name: string;
    config: unknown;
  }> = new Map();

  registry(name: string, config: unknown) {
    this.mcpServers.set(name, {
      name,
      config,
    });
  }

  connect() {
    // TODO: 连接MCP服务
  }

  listTools(name?: string) {
    // TODO: 列出MCP服务中的工具
  }

  callTool(name: string, args: Record<string, unknown>) {
    // TODO: 调用MCP服务中的工具
  }
}
