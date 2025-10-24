import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["cjs", "esm"],
  dts: false,
  clean: true,
  sourcemap: true,
  external: [],
  treeshake: true,
  minify: false,
  target: "node18",
  outDir: "dist",
  splitting: false,
  swc: {
    minify: false,
    jsc: {
      target: "es2022",
      parser: {
        syntax: "typescript",
      },
      transform: {},
      loose: false,
      externalHelpers: true,
    },
    logger: {
      setName: () => {},
      success: () => {},
      info: () => {},
      error: () => {},
      warn: () => {},
      log: () => {},
    },
  },
  onSuccess: 'echo "✅ packages/client 构建完成"',
});
