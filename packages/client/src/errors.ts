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
