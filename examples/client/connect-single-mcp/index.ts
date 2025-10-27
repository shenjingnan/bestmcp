import { Client } from '@bestmcp/client';
import { resolve } from 'path';

async function main() {
  // 创建客户端实例
  const client = new Client("stdio-mcp", {
    command: "node",
    args: [resolve(__dirname, "../../../stdio-mcp/dist/index.js")],
  });

  // 连接MCP服务器
  await client.connect();

  // 获取工具列表
  const tools = await client.listTools();
  console.log(JSON.stringify(tools, null, 2));
  
  // 断开连接
  client.disconnect();
}

// 运行主程序
main().catch((error) => {
  console.error("❌ 程序执行失败:", error);
  process.exit(1);
});
