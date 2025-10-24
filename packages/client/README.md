# 使用示例

```ts
const client = new BestMCPClient({});
client.registry("stdio-mcp", {
  command: "node",
  args: [
    "/Users/nemo/github/shenjingnan/bestmcp/examples/stdio-mcp/dist/index.js",
  ],
});

client.connect();
client.listTool("stdio-mcp");
client.callTool("stdio-mcp", { ... });
```
