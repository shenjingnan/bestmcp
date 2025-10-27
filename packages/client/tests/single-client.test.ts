import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Client, MCPConnectionError, MCPToolError } from "../src/index";

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

const { Client: SDKClient } = await import("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = await import("@modelcontextprotocol/sdk/client/stdio.js");

interface MockClient {
  connect: ReturnType<typeof vi.fn>;
  listTools: ReturnType<typeof vi.fn>;
  callTool: ReturnType<typeof vi.fn>;
}

interface MockTransport {
  close: ReturnType<typeof vi.fn>;
}

describe("Client", () => {
  let client: Client;
  let mockSDKClient: MockClient;
  let mockTransport: MockTransport;

  beforeEach(() => {
    client = new Client("test-server", {
      command: "node",
      args: ["test-server.js"],
    });

    // 创建 mock 实例
    mockSDKClient = {
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
    vi.mocked(SDKClient).mockImplementation(() => mockSDKClient as never);
    vi.mocked(StdioClientTransport).mockImplementation(() => mockTransport as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("应该正确初始化客户端", () => {
      expect(client.getServerName()).toBe("test-server");
      expect(client.isConnectedToServer()).toBe(false);
    });
  });

  describe("connect", () => {
    it("应该成功连接到服务器", async () => {
      await client.connect();

      expect(SDKClient).toHaveBeenCalledWith({
        name: "bestmcp-client",
        version: "1.0.0",
      });
      expect(StdioClientTransport).toHaveBeenCalledWith({
        command: "node",
        args: ["test-server.js"],
        env: expect.any(Object),
      });
      expect(mockSDKClient.connect).toHaveBeenCalledWith(mockTransport);
      expect(client.isConnectedToServer()).toBe(true);
    });

    it("应该支持自定义工作目录", async () => {
      const customClient = new Client("test-server", {
        command: "node",
        args: ["test-server.js"],
        cwd: "/custom/dir",
      });

      await customClient.connect();

      expect(StdioClientTransport).toHaveBeenCalledWith({
        command: "node",
        args: ["test-server.js"],
        cwd: "/custom/dir",
        env: expect.any(Object),
      });
    });

    it("应该支持自定义环境变量", async () => {
      const customClient = new Client("test-server", {
        command: "node",
        args: ["test-server.js"],
        env: { CUSTOM_VAR: "value" },
      });

      await customClient.connect();

      const transportCall = vi.mocked(StdioClientTransport).mock.calls[0];
      if (transportCall?.[0]) {
        expect(transportCall[0]).toHaveProperty("env");
        expect(transportCall[0].env).toMatchObject({ CUSTOM_VAR: "value" });
      }
    });

    it("重复连接不应该建立新连接", async () => {
      await client.connect();
      await client.connect(); // 第二次连接

      expect(mockSDKClient.connect).toHaveBeenCalledTimes(1);
    });

    it("连接失败应该抛出 MCPConnectionError", async () => {
      const connectError = new Error("连接失败");
      mockSDKClient.connect.mockRejectedValue(connectError);

      await expect(client.connect()).rejects.toThrow(MCPConnectionError);
      expect(client.isConnectedToServer()).toBe(false);
    });
  });

  describe("disconnect", () => {
    it("应该成功断开连接", async () => {
      await client.connect();
      await client.disconnect();

      expect(mockTransport.close).toHaveBeenCalled();
      expect(client.isConnectedToServer()).toBe(false);
    });

    it("未连接状态下断开不应该报错", async () => {
      await client.disconnect();
      expect(client.isConnectedToServer()).toBe(false);
    });

    it("断开连接失败不应该抛出错误", async () => {
      await client.connect();
      mockTransport.close.mockRejectedValue(new Error("关闭失败"));

      // 不应该抛出错误
      await client.disconnect();
      expect(client.isConnectedToServer()).toBe(false);
    });
  });

  describe("isConnectedToServer", () => {
    it("未连接时应该返回 false", () => {
      expect(client.isConnectedToServer()).toBe(false);
    });

    it("连接后应该返回 true", async () => {
      await client.connect();
      expect(client.isConnectedToServer()).toBe(true);
    });

    it("断开后应该返回 false", async () => {
      await client.connect();
      await client.disconnect();
      expect(client.isConnectedToServer()).toBe(false);
    });
  });

  describe("listTools", () => {
    it("未连接时调用应该抛出错误", async () => {
      await expect(client.listTools()).rejects.toThrow(MCPConnectionError);
    });

    it("应该成功获取工具列表", async () => {
      await client.connect();
      const tools = await client.listTools();

      expect(mockSDKClient.listTools).toHaveBeenCalled();
      expect(tools).toEqual([
        {
          name: "test-tool",
          description: "测试工具",
          inputSchema: { type: "object" },
        },
      ]);
    });

    it("获取工具列表失败应该抛出错误", async () => {
      await client.connect();
      const listError = new Error("获取工具列表失败");
      mockSDKClient.listTools.mockRejectedValue(listError);

      await expect(client.listTools()).rejects.toThrow(MCPConnectionError);
    });
  });

  describe("callTool", () => {
    it("未连接时调用应该抛出错误", async () => {
      await expect(client.callTool("test-tool")).rejects.toThrow(MCPConnectionError);
    });

    it("应该成功调用工具", async () => {
      await client.connect();
      const args = { param1: "value1" };
      const result = await client.callTool("test-tool", args);

      expect(mockSDKClient.callTool).toHaveBeenCalledWith({
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
      await client.connect();
      const callError = new Error("工具调用失败");
      mockSDKClient.callTool.mockRejectedValue(callError);

      await expect(client.callTool("test-tool")).rejects.toThrow(MCPToolError);
    });

    it("应该处理非文本类型的工具结果", async () => {
      await client.connect();

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

      mockSDKClient.callTool.mockResolvedValue(mockResult);

      const result = await client.callTool("test-tool");

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

  describe("getServerName", () => {
    it("应该返回正确的服务器名称", () => {
      expect(client.getServerName()).toBe("test-server");
    });
  });

  describe("私有方法测试", () => {
    it("应该正确合并环境变量", async () => {
      const customClient = new Client("test-server", {
        command: "node",
        args: ["test-server.js"],
        env: { CUSTOM_VAR: "value", PATH: "/custom/bin" },
      });

      await customClient.connect();

      const transportCall = vi.mocked(StdioClientTransport).mock.calls[0];
      if (transportCall?.[0]) {
        const env = transportCall[0].env;
        expect(env).toHaveProperty("CUSTOM_VAR", "value");
        expect(env).toHaveProperty("PATH", "/custom/bin");
        // 应该包含其他默认环境变量
        expect(env).toHaveProperty("HOME");
      }
    });
  });
});
