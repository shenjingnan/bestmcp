import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BestMCPClient, MCPConnectionError, MCPToolError } from "../src/index";

// Mock @modelcontextprotocol/sdk
vi.mock("@modelcontextprotocol/sdk/client/index.js", () => ({
  Client: vi.fn().mockImplementation(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    listTools: vi.fn().mockResolvedValue({
      tools: [
        {
          name: "test-tool",
          description: "测试工具",
          inputSchema: { type: "object" },
        },
      ],
    }),
    callTool: vi.fn().mockResolvedValue({
      content: [
        {
          type: "text",
          text: "工具执行成功",
        },
      ],
    }),
  })),
}));

vi.mock("@modelcontextprotocol/sdk/client/stdio.js", () => ({
  StdioClientTransport: vi.fn().mockImplementation(() => ({
    close: vi.fn().mockResolvedValue(undefined),
  })),
}));

const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = await import("@modelcontextprotocol/sdk/client/stdio.js");

interface MockClient {
  connect: ReturnType<typeof vi.fn>;
  listTools: ReturnType<typeof vi.fn>;
  callTool: ReturnType<typeof vi.fn>;
}

interface MockTransport {
  close: ReturnType<typeof vi.fn>;
}

describe("BestMCPClient", () => {
  let client: BestMCPClient;
  let mockClient: MockClient;
  let mockTransport: MockTransport;

  beforeEach(() => {
    client = new BestMCPClient();

    // 创建 mock 实例
    mockClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      listTools: vi.fn().mockResolvedValue({
        tools: [
          {
            name: "test-tool",
            description: "测试工具",
            inputSchema: { type: "object" },
          },
        ],
      }),
      callTool: vi.fn().mockResolvedValue({
        content: [
          {
            type: "text",
            text: "工具执行成功",
          },
        ],
      }),
    };

    mockTransport = {
      close: vi.fn().mockResolvedValue(undefined),
    };

    // Mock 构造函数
    vi.mocked(Client).mockImplementation(() => mockClient as never);
    vi.mocked(StdioClientTransport).mockImplementation(() => mockTransport as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("registry", () => {
    it("应该成功注册 MCP 服务器", () => {
      const config = {
        command: "node",
        args: ["test-server.js"],
      };

      client.registry("test-server", config);

      expect(client.getServerNames()).toContain("test-server");
      expect(client.isServerConnected("test-server")).toBe(false);
    });
  });

  describe("getServerNames", () => {
    it("应该返回已注册的服务器名称列表", () => {
      client.registry("server1", { command: "node", args: ["server1.js"] });
      client.registry("server2", { command: "node", args: ["server2.js"] });

      const names = client.getServerNames();
      expect(names).toHaveLength(2);
      expect(names).toContain("server1");
      expect(names).toContain("server2");
    });

    it("空列表时应该返回空数组", () => {
      const names = client.getServerNames();
      expect(names).toHaveLength(0);
    });
  });

  describe("isServerConnected", () => {
    it("未注册的服务器应该返回 false", () => {
      expect(client.isServerConnected("nonexistent")).toBe(false);
    });

    it("已注册但未连接的服务器应该返回 false", () => {
      client.registry("test-server", { command: "node", args: ["test.js"] });
      expect(client.isServerConnected("test-server")).toBe(false);
    });
  });

  describe("connect", () => {
    it("连接未注册的服务器应该抛出错误", async () => {
      await expect(client.connect("nonexistent")).rejects.toThrow(MCPConnectionError);
    });

    it("应该成功连接到已注册的服务器", async () => {
      client.registry("test-server", { command: "node", args: ["test.js"] });

      await client.connect("test-server");

      expect(StdioClientTransport).toHaveBeenCalled();
      expect(Client).toHaveBeenCalledWith({
        name: "bestmcp-client",
        version: "1.0.0",
      });
      expect(mockClient.connect).toHaveBeenCalledWith(mockTransport);
      expect(client.isServerConnected("test-server")).toBe(true);
    });

    it("应该使用自定义环境变量和工作目录", async () => {
      client.registry("test-server", {
        command: "node",
        args: ["test.js"],
        cwd: "/custom/dir",
        env: { CUSTOM_VAR: "value" },
      });

      await client.connect("test-server");

      expect(StdioClientTransport).toHaveBeenCalled();
      // 验证传输层配置包含了正确的命令和参数
      const transportCall = vi.mocked(StdioClientTransport).mock.calls[0];
      if (transportCall?.[0]) {
        expect(transportCall[0]).toHaveProperty("command", "node");
        expect(transportCall[0]).toHaveProperty("args", ["test.js"]);
      }
    });

    it("连接失败应该抛出 MCPConnectionError", async () => {
      client.registry("test-server", { command: "node", args: ["test.js"] });

      const connectError = new Error("连接失败");
      mockClient.connect.mockRejectedValue(connectError);

      await expect(client.connect("test-server")).rejects.toThrow(MCPConnectionError);
    });

    it("应该连接所有已注册的服务器", async () => {
      client.registry("server1", { command: "node", args: ["server1.js"] });
      client.registry("server2", { command: "node", args: ["server2.js"] });

      await client.connect();

      expect(Client).toHaveBeenCalledTimes(2);
      expect(StdioClientTransport).toHaveBeenCalledTimes(2);
      expect(mockClient.connect).toHaveBeenCalledTimes(2);
      expect(client.isServerConnected("server1")).toBe(true);
      expect(client.isServerConnected("server2")).toBe(true);
    });
  });

  describe("listTools", () => {
    it("获取未注册服务器的工具应该抛出错误", async () => {
      await expect(client.listTools("nonexistent")).rejects.toThrow(MCPConnectionError);
    });

    it("获取未连接服务器的工具应该抛出错误", async () => {
      client.registry("test-server", { command: "node", args: ["test.js"] });

      await expect(client.listTools("test-server")).rejects.toThrow(MCPConnectionError);
    });

    it("应该成功获取已连接服务器的工具列表", async () => {
      client.registry("test-server", { command: "node", args: ["test.js"] });
      await client.connect("test-server");

      const tools = await client.listTools("test-server");

      expect(mockClient.listTools).toHaveBeenCalled();
      expect(tools.get("test-server")).toEqual([
        {
          name: "test-tool",
          description: "测试工具",
          inputSchema: { type: "object" },
        },
      ]);
    });

    it("应该获取所有已连接服务器的工具列表", async () => {
      client.registry("server1", { command: "node", args: ["server1.js"] });
      client.registry("server2", { command: "node", args: ["server2.js"] });
      await client.connect();

      const tools = await client.listTools();

      expect(mockClient.listTools).toHaveBeenCalledTimes(2);
      expect(tools.size).toBe(2);
      expect(tools.has("server1")).toBe(true);
      expect(tools.has("server2")).toBe(true);
    });

    it("工具列表获取失败应该抛出 MCPConnectionError", async () => {
      client.registry("test-server", { command: "node", args: ["test.js"] });
      await client.connect("test-server");

      const listError = new Error("获取工具列表失败");
      mockClient.listTools.mockRejectedValue(listError);

      await expect(client.listTools("test-server")).rejects.toThrow(MCPConnectionError);
    });
  });

  describe("callTool", () => {
    it("调用未注册服务器的工具应该抛出错误", async () => {
      await expect(client.callTool("nonexistent", "test-tool")).rejects.toThrow(MCPConnectionError);
    });

    it("调用未连接服务器的工具应该抛出错误", async () => {
      client.registry("test-server", { command: "node", args: ["test.js"] });

      await expect(client.callTool("test-server", "test-tool")).rejects.toThrow(MCPConnectionError);
    });

    it("应该成功调用已连接服务器的工具", async () => {
      client.registry("test-server", { command: "node", args: ["test.js"] });
      await client.connect("test-server");

      const args = { param1: "value1" };
      const result = await client.callTool("test-server", "test-tool", args);

      expect(mockClient.callTool).toHaveBeenCalledWith({
        name: "test-tool",
        arguments: args,
      });
      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: "工具执行成功",
          },
        ],
        isError: false,
      });
    });

    it("工具调用失败应该抛出 MCPToolError", async () => {
      client.registry("test-server", { command: "node", args: ["test.js"] });
      await client.connect("test-server");

      const callError = new Error("工具调用失败");
      mockClient.callTool.mockRejectedValue(callError);

      await expect(client.callTool("test-server", "test-tool")).rejects.toThrow(MCPToolError);
    });

    it("应该处理非文本类型的工具结果", async () => {
      client.registry("test-server", { command: "node", args: ["test.js"] });
      await client.connect("test-server");

      const mockResult = {
        content: [
          {
            type: "text",
            text: "文本结果",
          },
          {
            type: "image",
            data: "base64data",
            mimeType: "image/png",
          },
        ],
      };

      mockClient.callTool.mockResolvedValue(mockResult);

      const result = await client.callTool("test-server", "test-tool");

      expect(result.content).toEqual([
        {
          type: "text",
          text: "文本结果",
        },
        {
          type: "image",
          text: JSON.stringify({
            type: "image",
            data: "base64data",
            mimeType: "image/png",
          }),
        },
      ]);
    });
  });

  describe("disconnect", () => {
    it("应该断开所有服务器连接", async () => {
      client.registry("server1", { command: "node", args: ["server1.js"] });
      client.registry("server2", { command: "node", args: ["server2.js"] });
      await client.connect();

      await client.disconnect();

      expect(mockTransport.close).toHaveBeenCalledTimes(2);
      expect(client.isServerConnected("server1")).toBe(false);
      expect(client.isServerConnected("server2")).toBe(false);
    });

    it("断开连接失败不应该影响其他服务器的断开", async () => {
      client.registry("server1", { command: "node", args: ["server1.js"] });
      client.registry("server2", { command: "node", args: ["server2.js"] });
      await client.connect();

      // 模拟第一个传输层关闭失败，但不影响整体断开操作
      mockTransport.close.mockImplementationOnce(() => Promise.reject(new Error("关闭失败")));
      mockTransport.close.mockImplementationOnce(() => Promise.resolve());

      // 不应该抛出错误
      await client.disconnect();
    });
  });
});
