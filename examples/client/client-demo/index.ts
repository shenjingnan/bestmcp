import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BestMCPClient } from "@bestmcp/client";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

async function main() {
  // 创建客户端实例
  const client = new BestMCPClient();

  // 注册 stdio-mcp 服务器（使用现有的 calculator-mcp 示例）
  const stdioMcpPath = resolve(__dirname, "../../stdio-mcp/dist/index.js");

  client.registry("stdio-mcp", {
    command: "node",
    args: [stdioMcpPath],
  });

  try {
    // 连接到所有已注册的服务器
    await client.connect();

    // 获取工具列表
    const toolsMap = await client.listTools();

    console.log(JSON.stringify(toolsMap, null, 2));
  } catch (error) {
    console.error("❌ 客户端运行失败:", error);
    process.exit(1);
  } finally {
    client.disconnect();
  }
}

// 处理程序退出
process.on("SIGINT", () => {
  process.exit(0);
});

process.on("SIGTERM", () => {
  process.exit(0);
});

// 运行主程序
main().catch((error) => {
  console.error("❌ 程序执行失败:", error);
  process.exit(1);
});
