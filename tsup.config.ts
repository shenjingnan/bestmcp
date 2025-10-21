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
  minify: true,
  target: "node18",
  outDir: "dist",
  splitting: true,
  swc: {
    minify: false,
    jsc: {
      target: "es2022",
      parser: {
        syntax: "typescript",
        decorators: true,
      },
      transform: {
        decoratorMetadata: true,
        legacyDecorator: true,
      },
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
  onSuccess: 'echo "✅ bestmcp 根包构建完成"',
});
