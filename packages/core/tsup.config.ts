import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["cjs", "esm"],
  dts: false,
  clean: true,
  sourcemap: true,
  external: ["@modelcontextprotocol/sdk", "reflect-metadata", "zod"],
  treeshake: true,
  minify: false,
  target: "node18",
  outDir: "dist",
  splitting: false,
  onSuccess: 'echo "✅ packages/core 构建完成"',
});
