import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "index.ts",
  },
  format: ["cjs"],
  dts: false,
  clean: true,
  sourcemap: true,
  external: ["cross-spawn", "bestmcp"],
  treeshake: true,
  minify: false,
  target: "node18",
  outDir: "dist",
  splitting: false,
  onSuccess: 'echo "✅ examples/client-demo 构建完成"',
});
