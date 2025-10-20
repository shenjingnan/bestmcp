import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "index.ts",
  },
  format: ["cjs"],
  clean: true,
  sourcemap: true,
  external: ["bestmcp"],
  treeshake: false,
  minify: false,
  target: "node18",
  outDir: "dist",
  splitting: false,
  onSuccess: 'echo "✅ examples/calculator-mcp 构建完成"',
});
