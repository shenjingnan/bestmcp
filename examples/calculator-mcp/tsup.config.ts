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
  onSuccess: 'echo "✅ examples/calculator-mcp 构建完成"',
});
