import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Client, BestMCPClient, MCPConnectionError } from "../src/index";

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

describe("集成测试", () => {
  let manager: BestMCPClient;

  beforeEach(() => {
    manager = new BestMCPClient();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("两类客户端协作", () => {
    it("应该支持同时使用单客户端和多客户端管理器", async () => {
      // 注册多个服务器
      manager.registry("server1", {
        command: "node",
        args: ["server1.js"],
      });
      manager.registry("server2", {
        command: "node",
        args: ["server2.js"],
      });

      // 连接所有服务器
      await manager.connect();

      // 使用管理器批量操作
      const allTools = await manager.listTools();
      expect(allTools.size).toBe(2);
      expect(allTools.has("server1")).toBe(true);
      expect(allTools.has("server2")).toBe(true);

      // 使用管理器直接调用工具
      const result1 = await manager.callTool("server1", "test-tool", { data: "test1" });
      expect(result1.content).toHaveLength(1);

      // 使用 findMCP 获取单个客户端进行操作
      const client2 = manager.findMCP("server2");
      expect(client2).toBeInstanceOf(Client);
      expect(client2.getServerName()).toBe("server2");
      expect(client2.isConnectedToServer()).toBe(true);

      const tools2 = await client2.listTools();
      expect(tools2).toHaveLength(1);

      const result2 = await client2.callTool("test-tool", { data: "test2" });
      expect(result2.content).toHaveLength(1);

      // 清理
      await manager.disconnect();
    });

    it("应该支持两种不同的使用模式", async () => {
      // 模式1: 直接使用单客户端
      const singleClient = new Client("direct-server", {
        command: "node",
        args: ["direct-server.js"],
      });

      await singleClient.connect();
      const singleTools = await singleClient.listTools();
      const singleResult = await singleClient.callTool("test-tool");
      expect(singleTools).toHaveLength(1);
      expect(singleResult.content).toHaveLength(1);

      // 模式2: 通过管理器使用
      manager.registry("managed-server", {
        command: "node",
        args: ["managed-server.js"],
      });

      await manager.connect();
      const managedTools = await manager.listTools();
      const managedResult = await manager.callTool("managed-server", "test-tool");
      expect(managedTools.get("managed-server")).toHaveLength(1);
      expect(managedResult.content).toHaveLength(1);

      // 清理
      await singleClient.disconnect();
      await manager.disconnect();
    });
  });

  describe("错误处理一致性", () => {
    it("两类客户端应该抛出相同类型的错误", async () => {
      // 单客户端错误
      const singleClient = new Client("error-server", {
        command: "node",
        args: ["error-server.js"],
      });

      await expect(singleClient.listTools()).rejects.toThrow(MCPConnectionError);

      // 多客户端管理器错误
      manager.registry("error-server", {
        command: "node",
        args: ["error-server.js"],
      });

      await expect(manager.listTools("error-server")).rejects.toThrow(MCPConnectionError);

      // findMCP 错误
      await expect(manager.callTool("nonexistent", "tool")).rejects.toThrow(MCPConnectionError);
      await expect(() => manager.findMCP("nonexistent")).toThrow(MCPConnectionError);
    });
  });

  describe("状态管理", () => {
    it("应该正确管理连接状态", async () => {
      manager.registry("server1", { command: "node", args: ["server1.js"] });
      manager.registry("server2", { command: "node", args: ["server2.js"] });

      // 初始状态
      expect(manager.isServerConnected("server1")).toBe(false);
      expect(manager.isServerConnected("server2")).toBe(false);
      expect(manager.getConnectedServers()).toHaveLength(0);

      // 部分连接
      await manager.connect("server1");
      expect(manager.isServerConnected("server1")).toBe(true);
      expect(manager.isServerConnected("server2")).toBe(false);
      expect(manager.getConnectedServers()).toEqual(["server1"]);

      // 全部连接
      await manager.connect();
      expect(manager.isServerConnected("server1")).toBe(true);
      expect(manager.isServerConnected("server2")).toBe(true);
      expect(manager.getConnectedServers()).toHaveLength(2);

      // 通过 findMCP 检查状态
      const client1 = manager.findMCP("server1");
      const client2 = manager.findMCP("server2");
      expect(client1.isConnectedToServer()).toBe(true);
      expect(client2.isConnectedToServer()).toBe(true);

      // 清理
      await manager.disconnect();
      expect(manager.isServerConnected("server1")).toBe(false);
      expect(manager.isServerConnected("server2")).toBe(false);
      expect(manager.getConnectedServers()).toHaveLength(0);
    });
  });

  describe("性能和资源管理", () => {
    it("应该正确处理客户端注销", async () => {
      manager.registry("temp-server", { command: "node", args: ["temp.js"] });
      await manager.connect();

      expect(manager.listClients()).toContain("temp-server");
      expect(manager.isServerConnected("temp-server")).toBe(true);

      // 注销服务器
      manager.unregistry("temp-server");
      expect(manager.listClients()).not.toContain("temp-server");

      // 等待断开连接完成
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(manager.isServerConnected("temp-server")).toBe(false);
    });

    it("应该支持大量客户端管理", async () => {
      const serverCount = 10;

      // 注册大量服务器
      for (let i = 0; i < serverCount; i++) {
        manager.registry(`server-${i}`, {
          command: "node",
          args: [`server-${i}.js`],
        });
      }

      expect(manager.listClients()).toHaveLength(serverCount);

      // 批量连接
      await manager.connect();
      expect(manager.getConnectedServers()).toHaveLength(serverCount);

      // 验证每个客户端都可以正常工作
      for (let i = 0; i < serverCount; i++) {
        const client = manager.findMCP(`server-${i}`);
        expect(client.getServerName()).toBe(`server-${i}`);
        expect(client.isConnectedToServer()).toBe(true);
      }

      // 批量操作
      const allTools = await manager.listTools();
      expect(allTools.size).toBe(serverCount);

      // 清理
      await manager.disconnect();
      expect(manager.getConnectedServers()).toHaveLength(0);
    });
  });

  describe("API 一致性", () => {
    it("两类客户端的 API 应该保持一致的行为", async () => {
      const singleClient = new Client("consistency-server", {
        command: "node",
        args: ["consistency.js"],
      });

      manager.registry("consistency-server", {
        command: "node",
        args: ["consistency.js"],
      });

      await singleClient.connect();
      await manager.connect("consistency-server");

      // 工具列表一致性
      const singleTools = await singleClient.listTools();
      const managedTools = await manager.listTools("consistency-server");
      expect(singleTools).toEqual(managedTools.get("consistency-server"));

      // 工具调用一致性
      const args = { test: "data" };
      const singleResult = await singleClient.callTool("test-tool", args);
      const managedResult = await manager.callTool("consistency-server", "test-tool", args);
      expect(singleResult).toEqual(managedResult);

      // 清理
      await singleClient.disconnect();
      await manager.disconnect();
    });
  });
});