import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BestMCPClient } from "@bestmcp/client";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

async function main() {
  console.log("🚀 BestMCP 客户端示例启动\n");

  // 创建客户端实例
  const client = new BestMCPClient();

  // 注册 stdio-mcp 服务器（使用现有的 calculator-mcp 示例）
  const stdioMcpPath = resolve(__dirname, "../../stdio-mcp/dist/index.js");

  client.registry("stdio-mcp", {
    command: "node",
    args: [stdioMcpPath],
  });

  try {
    console.log("📡 连接到 MCP 服务器...");

    // 连接到所有已注册的服务器
    await client.connect();

    console.log("✅ 服务器连接成功！\n");

    // 获取已注册的服务器列表
    const serverNames = client.getServerNames();
    console.log(`📋 已注册的服务器: ${serverNames.join(", ")}\n`);

    // 获取工具列表
    console.log("🔧 获取可用工具列表...");
    const toolsMap = await client.listTools();

    for (const [serverName, tools] of toolsMap) {
      console.log(`\n📦 服务器: ${serverName}`);
      console.log(`可用工具数量: ${tools.length}`);

      for (const tool of tools) {
        console.log(`  - ${tool.name}: ${tool.description}`);
      }
    }

    // 调用计算器工具示例
    if (toolsMap.has("stdio-mcp") && toolsMap.get("stdio-mcp")!.length > 0) {
      console.log("\n🧮 测试计算器工具...");

      try {
        // 测试加法
        const addResult = await client.callTool("stdio-mcp", "add", {
          a: 10,
          b: 5,
        });
        console.log(`➕ 10 + 5 = ${addResult.content[0]?.text}`);

        // 测试减法
        const subtractResult = await client.callTool("stdio-mcp", "subtract", {
          a: 10,
          b: 3,
        });
        console.log(`➖ 10 - 3 = ${subtractResult.content[0]?.text}`);

        // 测试乘法
        const multiplyResult = await client.callTool("stdio-mcp", "multiply", {
          a: 6,
          b: 7,
        });
        console.log(`✖️ 6 * 7 = ${multiplyResult.content[0]?.text}`);

        // 测试除法
        const divideResult = await client.callTool("stdio-mcp", "divide", {
          a: 20,
          b: 4,
        });
        console.log(`➗ 20 / 4 = ${divideResult.content[0]?.text}`);

        console.log("\n✅ 所有工具调用测试成功！");
      } catch (error) {
        console.error("❌ 工具调用失败:", error);
      }
    }
  } catch (error) {
    console.error("❌ 客户端运行失败:", error);
    process.exit(1);
  } finally {
    // 断开连接
    console.log("\n🔌 断开服务器连接...");
    client.disconnect();
    console.log("✅ 连接已断开");
  }
}

// 处理程序退出
process.on("SIGINT", () => {
  console.log("\n👋 收到退出信号，正在关闭...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n👋 收到终止信号，正在关闭...");
  process.exit(0);
});

// 运行主程序
main().catch((error) => {
  console.error("❌ 程序执行失败:", error);
  process.exit(1);
});
